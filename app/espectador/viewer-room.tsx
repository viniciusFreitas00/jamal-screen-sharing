"use client";

import { BroadcastEnded } from "@/components/broadcast-ended";
import { BroadcastIdle } from "@/components/broadcast-idle";
import { ControlPanel } from "@/components/control-panel";
import { Stage } from "@/components/stage";
import { StatusAlert } from "@/components/status-alert";

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
        {session.hasEnded ? (
          <BroadcastEnded description="O apresentador encerrou a sala." />
        ) : (
          <BroadcastIdle
            title="A transmissão aparecerá aqui"
            description="Conecte-se a uma sala para começar a assistir."
          />
        )}
      </Stage>
      <ControlPanel title="Entrar em uma sala">
        <StatusAlert status={session.status} />
        <JoinForm
          initialPresenterId={initialPresenterId}
          disabled={!session.isReady || session.isConnecting || session.isWatching}
          isConnecting={session.isConnecting}
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
