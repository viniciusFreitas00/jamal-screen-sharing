"use client";

import { Peer, type DataConnection } from "peerjs";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  HEARTBEAT_INTERVAL_MS,
  VIEWER_HEARTBEAT,
  viewerPresence,
} from "@/lib/peer/messages";
import { PEER_OPTIONS } from "@/lib/peer/options";
import { errorStatus, type Status } from "@/lib/status";

const STATUS = {
  starting: {
    kind: "idle",
    title: "Inicializando serviço",
    detail: "Aguarde enquanto preparamos sua conexão.",
  },
  ready: {
    kind: "ready",
    title: "Pronto para assistir",
    detail: "Cole o ID do apresentador para solicitar acesso.",
  },
  requesting: {
    kind: "idle",
    title: "Solicitando acesso",
    detail: "Esperando o apresentador aceitar sua conexão.",
  },
  negotiating: {
    kind: "idle",
    title: "Solicitando acesso",
    detail: "Sinal recebido. Negociando vídeo e áudio.",
  },
  watching: {
    kind: "ready",
    title: "Conectado ao vivo",
    detail: "A transmissão está sendo recebida diretamente do apresentador.",
  },
  ended: {
    kind: "idle",
    title: "Transmissão encerrada",
    detail: "O apresentador encerrou a sala.",
  },
  refused: {
    kind: "idle",
    title: "Conexão recusada",
    detail: "A sala não está mais disponível.",
  },
  unavailable: {
    kind: "error",
    title: "Apresentador indisponível",
    detail: "Confira o ID e tente novamente.",
  },
  mediaFailed: {
    kind: "error",
    title: "Falha na transmissão",
    detail: "Não foi possível manter o vídeo conectado.",
  },
} satisfies Record<string, Status>;

type JoinRequest = {
  username: string;
  presenterId: string;
};

export function useViewerSession() {
  const [status, setStatus] = useState<Status>(STATUS.starting);
  const [isReady, setIsReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isWatching, setIsWatching] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const connectionRef = useRef<DataConnection | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const isWatchingRef = useRef(false);

  const changeWatching = useCallback((watching: boolean) => {
    isWatchingRef.current = watching;
    setIsWatching(watching);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current === null) return;
    window.clearInterval(heartbeatRef.current);
    heartbeatRef.current = null;
  }, []);

  const startHeartbeat = useCallback(
    (connection: DataConnection) => {
      stopHeartbeat();
      heartbeatRef.current = window.setInterval(() => {
        if (connection.open) connection.send(VIEWER_HEARTBEAT);
      }, HEARTBEAT_INTERVAL_MS);
    },
    [stopHeartbeat],
  );

  useEffect(() => {
    const peer = new Peer(PEER_OPTIONS);
    peerRef.current = peer;

    peer.on("open", () => {
      setIsReady(true);
      setStatus(STATUS.ready);
    });

    peer.on("call", (call) => {
      call.answer();

      call.on("stream", async (stream) => {
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => undefined);
        }
        changeWatching(true);
        setIsConnecting(false);
        setStatus(STATUS.watching);
      });

      call.on("close", () => {
        changeWatching(false);
        setStatus(STATUS.ended);
      });

      call.on("error", () => {
        changeWatching(false);
        setIsConnecting(false);
        setStatus(STATUS.mediaFailed);
      });
    });

    peer.on("error", (error) => {
      setIsConnecting(false);
      setStatus(errorStatus("Erro de conexão", error.message));
    });

    return () => {
      stopHeartbeat();
      connectionRef.current?.close();
      peer.destroy();
    };
  }, [changeWatching, stopHeartbeat]);

  const join = useCallback(
    ({ username, presenterId }: JoinRequest) => {
      const peer = peerRef.current;
      const name = username.trim();
      const id = presenterId.trim();
      if (!peer || !isReady || !name || !id) return;

      setIsConnecting(true);
      setStatus(STATUS.requesting);

      const connection = peer.connect(id);
      connectionRef.current = connection;

      connection.on("open", () => {
        connection.send(viewerPresence(name));
        startHeartbeat(connection);
        setStatus(STATUS.negotiating);
      });

      connection.on("error", () => {
        setIsConnecting(false);
        setStatus(STATUS.unavailable);
      });

      connection.on("close", () => {
        stopHeartbeat();
        if (isWatchingRef.current) return;
        setIsConnecting(false);
        setStatus(STATUS.refused);
      });
    },
    [isReady, startHeartbeat, stopHeartbeat],
  );

  return { videoRef, status, isReady, isConnecting, isWatching, join };
}
