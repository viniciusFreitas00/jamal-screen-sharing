"use client";

import { Peer } from "peerjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { parseViewerMessage } from "@/lib/peer/messages";
import { PEER_OPTIONS } from "@/lib/peer/options";
import { applyVideoQuality } from "@/lib/peer/video-quality";
import { replaceVideoTrack } from "@/lib/peer/video-sender";
import { ViewerRegistry, type ViewerPresence } from "@/lib/peer/viewer-registry";
import {
  createScreenCapture,
  type CaptureSource,
  type ScreenCapture,
} from "@/lib/screen-capture";
import { errorStatus, type Status } from "@/lib/status";

const PRESENCE_TIMEOUT_MS = 12_000;
const PRESENCE_SWEEP_MS = 4_000;

const STATUS = {
  idle: {
    kind: "idle",
    title: "Pronto para iniciar",
    detail: "Sua tela ainda não está sendo compartilhada.",
  },
  requesting: {
    kind: "idle",
    title: "Solicitando permissões",
    detail: "Escolha uma guia do Chrome para transmitir com som — janelas e telas vão sem áudio.",
  },
  live: {
    kind: "ready",
    title: "Transmitindo ao vivo",
    detail: "Compartilhe o link abaixo com seus espectadores.",
  },
  tabWithoutAudio: {
    kind: "idle",
    title: "Transmitindo sem áudio",
    detail:
      'Você não marcou "Compartilhar áudio da guia". Troque a tela e marque a caixa para transmitir o som.',
  },
  surfaceWithoutAudio: {
    kind: "idle",
    title: "Transmitindo sem áudio",
    detail:
      "Janelas e telas inteiras não têm áudio no navegador. Para transmitir som, compartilhe uma guia do Chrome.",
  },
  sourceUnchanged: {
    kind: "idle",
    title: "A tela não foi trocada",
    detail: "A transmissão continua na fonte anterior.",
  },
  ended: {
    kind: "idle",
    title: "Transmissão encerrada",
    detail: "Você pode iniciar uma nova transmissão.",
  },
} satisfies Record<string, Status>;

function liveStatus(source: CaptureSource | null): Status {
  if (!source || source.hasAudio) return STATUS.live;

  return source.isTab ? STATUS.tabWithoutAudio : STATUS.surfaceWithoutAudio;
}

export function useBroadcast() {
  const [status, setStatus] = useState<Status>(STATUS.idle);
  const [presenterId, setPresenterId] = useState("");
  const [viewers, setViewers] = useState<ViewerPresence[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [registry] = useState(() => new ViewerRegistry());

  const previewRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const captureRef = useRef<ScreenCapture | null>(null);
  const sourceRef = useRef<CaptureSource | null>(null);

  const syncViewers = useCallback(() => setViewers(registry.list()), [registry]);

  const dropViewer = useCallback(
    (id: string) => {
      registry.leave(id);
      syncViewers();
    },
    [registry, syncViewers],
  );

  const release = useCallback(() => {
    captureRef.current?.stop();
    registry.closeAll();
    peerRef.current?.destroy();
    captureRef.current = null;
    sourceRef.current = null;
    peerRef.current = null;
  }, [registry]);

  const stop = useCallback(() => {
    release();
    if (previewRef.current) previewRef.current.srcObject = null;
    setViewers([]);
    setPresenterId("");
    setIsStarting(false);
    setIsSwitching(false);
    setIsLive(false);
    setStatus(STATUS.ended);
  }, [release]);

  useEffect(() => release, [release]);

  useEffect(() => {
    if (!isLive) return;

    const sweep = window.setInterval(() => {
      if (registry.dropExpired(PRESENCE_TIMEOUT_MS)) syncViewers();
    }, PRESENCE_SWEEP_MS);

    return () => window.clearInterval(sweep);
  }, [isLive, registry, syncViewers]);

  const showPreview = useCallback(async () => {
    const preview = previewRef.current;
    const stream = captureRef.current?.stream;
    if (!preview || !stream) return;

    preview.srcObject = stream;
    await preview.play().catch(() => undefined);
  }, []);

  const adoptSource = useCallback(
    (source: CaptureSource) => {
      sourceRef.current = source;

      source.video.addEventListener(
        "ended",
        () => {
          if (sourceRef.current === source) stop();
        },
        { once: true },
      );
    },
    [stop],
  );

  const welcomeViewer = useCallback(
    (peer: Peer, id: string) => {
      const stream = captureRef.current?.stream;
      if (!stream) return;

      const call = peer.call(id, stream);
      registry.join(id, call);
      syncViewers();
      void applyVideoQuality(call);
      call.on("close", () => dropViewer(id));
      call.on("error", () => dropViewer(id));
    },
    [dropViewer, registry, syncViewers],
  );

  const start = useCallback(async () => {
    if (isStarting || isLive) return;

    setIsStarting(true);
    setStatus(STATUS.requesting);

    try {
      const capture = createScreenCapture();
      captureRef.current = capture;

      adoptSource(await capture.selectSource());
      await showPreview();

      const peer = new Peer(PEER_OPTIONS);
      peerRef.current = peer;

      peer.on("open", (id) => {
        setPresenterId(id);
        setIsLive(true);
        setIsStarting(false);
        setStatus(liveStatus(sourceRef.current));
      });

      peer.on("connection", (connection) => {
        const id = connection.peer;
        registry.open(id, connection);

        connection.on("open", () => welcomeViewer(peer, id));
        connection.on("data", (data) => {
          const message = parseViewerMessage(data);
          if (!message) return;

          registry.touch(id);
          if (message.type === "viewer-presence") {
            registry.rename(id, message.username);
            syncViewers();
          }
        });
        connection.on("close", () => dropViewer(id));
        connection.on("error", () => dropViewer(id));
      });

      peer.on("error", (error) => {
        setIsStarting(false);
        setStatus(errorStatus("Falha na conexão", error.message));
      });
    } catch (error) {
      release();
      setIsStarting(false);
      setStatus(
        errorStatus(
          "Não foi possível iniciar",
          error instanceof Error ? error.message : "Permissão de captura recusada.",
        ),
      );
    }
  }, [
    adoptSource,
    dropViewer,
    isLive,
    isStarting,
    registry,
    release,
    showPreview,
    syncViewers,
    welcomeViewer,
  ]);

  const switchScreen = useCallback(async () => {
    const capture = captureRef.current;
    if (!capture || !isLive || isSwitching) return;

    setIsSwitching(true);

    try {
      const source = await capture.selectSource();
      adoptSource(source);

      await Promise.all(
        registry.liveCalls().map(async (call) => {
          await replaceVideoTrack(call, source.video);
          await applyVideoQuality(call);
        }),
      );

      await showPreview();
      setStatus(liveStatus(source));
    } catch {
      setStatus(STATUS.sourceUnchanged);
    } finally {
      setIsSwitching(false);
    }
  }, [adoptSource, isLive, isSwitching, registry, showPreview]);

  const connectedCount = useMemo(
    () => viewers.filter((viewer) => viewer.connected).length,
    [viewers],
  );

  return {
    previewRef,
    status,
    hasEnded: status === STATUS.ended,
    presenterId,
    viewers,
    connectedCount,
    isStarting,
    isSwitching,
    isLive,
    start,
    switchScreen,
    stop,
  };
}
