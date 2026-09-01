"use client";

import { ControlPanel } from "@/components/control-panel";
import { Stage } from "@/components/stage";
import { StatusLine } from "@/components/status-line";

import { JoinForm } from "./join-form";
import { useViewerSession } from "./use-viewer-session";

export function ViewerRoom({ initialPresenterId }: { initialPresenterId: string }) {
  const session = useViewerSession();

  return (
    <>
      <Stage
        videoRef={session.videoRef}
        label="Transmissão recebida"
        isLive={session.isWatching}
        controls
      >
        <strong>A transmissão aparecerá aqui</strong>
        <span>Conecte-se a uma sala para começar a assistir.</span>
      </Stage>
      <ControlPanel label="Entrar em uma sala">
        <StatusLine status={session.status} />
        <JoinForm
          initialPresenterId={initialPresenterId}
          disabled={!session.isReady || session.isConnecting || session.isWatching}
          submitLabel={joinLabel(session.isConnecting, session.isWatching)}
          onJoin={session.join}
        />
      </ControlPanel>
    </>
  );
}

function joinLabel(isConnecting: boolean, isWatching: boolean): string {
  if (isConnecting) return "Conectando...";
  if (isWatching) return "Você está assistindo";
  return "Conectar à transmissão";
}
