"use client";

import { Replace, ScreenShare, ScreenShareOff, Users } from "lucide-react";

import { BroadcastEnded } from "@/components/broadcast-ended";
import { BroadcastIdle } from "@/components/broadcast-idle";
import { ControlPanel } from "@/components/control-panel";
import { ShareLink } from "@/components/share-link";
import { Stage } from "@/components/stage";
import { StatusAlert } from "@/components/status-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ViewerList } from "@/components/viewer-list";

import { useBroadcast } from "./use-broadcast";

export function BroadcastRoom() {
  const broadcast = useBroadcast();

  return (
    <>
      <Stage
        videoRef={broadcast.previewRef}
        label="Prévia da tela compartilhada"
        isLive={broadcast.isLive}
        muted
      >
        {broadcast.hasEnded ? (
          <BroadcastEnded description="Você pode iniciar uma nova transmissão." />
        ) : (
          <BroadcastIdle
            title="A prévia aparecerá aqui"
            description="O navegador pedirá sua autorização antes de começar."
          />
        )}
      </Stage>
      <div className="flex flex-col gap-6">
        <ControlPanel
          title="Controle da sala"
          action={
            broadcast.isLive ? (
              <Badge variant="secondary" className="font-mono">
                <Users />
                {broadcast.connectedCount}
              </Badge>
            ) : undefined
          }
        >
          <StatusAlert status={broadcast.status} />
          {broadcast.isLive ? (
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="lg"
                onClick={broadcast.switchScreen}
                disabled={broadcast.isSwitching}
              >
                {broadcast.isSwitching ? <Spinner /> : <Replace />}
                {broadcast.isSwitching ? "Escolhendo a nova tela..." : "Trocar tela"}
              </Button>
              <Button variant="destructive" size="lg" onClick={broadcast.stop}>
                <ScreenShareOff />
                Encerrar transmissão
              </Button>
            </div>
          ) : (
            <Button size="lg" onClick={broadcast.start} disabled={broadcast.isStarting}>
              {broadcast.isStarting ? <Spinner /> : <ScreenShare />}
              {broadcast.isStarting ? "Preparando transmissão..." : "Iniciar compartilhamento"}
            </Button>
          )}
          {broadcast.presenterId && <ShareLink presenterId={broadcast.presenterId} />}
        </ControlPanel>
        <ViewerList viewers={broadcast.viewers} />
      </div>
    </>
  );
}
