"use client";

import { Peer } from "peerjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { parseViewerMessage } from "@/lib/peer/messages";
import { PEER_OPTIONS } from "@/lib/peer/options";
import { applyVideoQuality } from "@/lib/peer/video-quality";
import { ViewerRegistry, type ViewerPresence } from "@/lib/peer/viewer-registry";
import { captureScreenWithAudio, type ScreenCapture } from "@/lib/screen-capture";
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
    detail: "Escolha uma janela ou tela para compartilhar.",
  },
  withoutMicrophone: {
    kind: "idle",
    title: "Solicitando permissões",
    detail: "Microfone indisponível. A transmissão seguirá com o áudio da tela.",
  },
  live: {
    kind: "ready",
    title: "Transmitindo ao vivo",
    detail: "Compartilhe o link abaixo com seus espectadores.",
  },
  ended: {
    kind: "idle",
    title: "Transmissão encerrada",
    detail: "Você pode iniciar uma nova transmissão.",
  },
} satisfies Record<string, Status>;

export function useBroadcast() {
  const [status, setStatus] = useState<Status>(STATUS.idle);
  const [presenterId, setPresenterId] = useState("");
  const [viewers, setViewers] = useState<ViewerPresence[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [registry] = useState(() => new ViewerRegistry());

  const previewRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const captureRef = useRef<ScreenCapture | null>(null);

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
    peerRef.current = null;
  }, [registry]);

  const stop = useCallback(() => {
    release();
    if (previewRef.current) previewRef.current.srcObject = null;
    setViewers([]);
    setPresenterId("");
    setIsStarting(false);
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
      const capture = await captureScreenWithAudio();
      captureRef.current = capture;
      if (!capture.microphoneAvailable) setStatus(STATUS.withoutMicrophone);

      const preview = previewRef.current;
      if (preview) {
        preview.srcObject = capture.stream;
        await preview.play().catch(() => undefined);
      }

      capture.stream.getVideoTracks()[0].addEventListener("ended", stop);

      const peer = new Peer(PEER_OPTIONS);
      peerRef.current = peer;

      peer.on("open", (id) => {
        setPresenterId(id);
        setIsLive(true);
        setIsStarting(false);
        setStatus(STATUS.live);
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
      setIsStarting(false);
      setStatus(
        errorStatus(
          "Não foi possível iniciar",
          error instanceof Error ? error.message : "Permissão de captura recusada.",
        ),
      );
    }
  }, [dropViewer, isLive, isStarting, registry, stop, syncViewers, welcomeViewer]);

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
    isLive,
    start,
    stop,
  };
}
