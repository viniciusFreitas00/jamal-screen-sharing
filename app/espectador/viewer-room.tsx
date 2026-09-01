"use client";

import { Eye } from "lucide-react";

import { ControlPanel } from "@/components/control-panel";
import { Stage } from "@/components/stage";
import { StatusAlert } from "@/components/status-alert";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

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
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-background">
              <Eye />
            </EmptyMedia>
            <EmptyTitle>A transmissão aparecerá aqui</EmptyTitle>
            <EmptyDescription>Conecte-se a uma sala para começar a assistir.</EmptyDescription>
          </EmptyHeader>
        </Empty>
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
