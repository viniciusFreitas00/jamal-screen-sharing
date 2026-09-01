"use client";

import { ControlPanel, MetricRow } from "@/components/control-panel";
import { ShareLink } from "@/components/share-link";
import { Stage } from "@/components/stage";
import { StatusLine } from "@/components/status-line";
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
        <strong>A prévia aparecerá aqui</strong>
        <span>O navegador pedirá sua autorização antes de começar.</span>
      </Stage>
      <ControlPanel label="Controle da sala">
        <StatusLine status={broadcast.status} />
        <button
          className="primary-button"
          type="button"
          onClick={broadcast.start}
          disabled={broadcast.isStarting || broadcast.isLive}
        >
          {startLabel(broadcast.isStarting, broadcast.isLive)}
        </button>
        {broadcast.isLive && (
          <button className="stop-button" type="button" onClick={broadcast.stop}>
            Encerrar transmissão
          </button>
        )}
        {broadcast.presenterId && <ShareLink presenterId={broadcast.presenterId} />}
        <MetricRow label="Espectadores conectados" value={broadcast.connectedCount} />
        <ViewerList viewers={broadcast.viewers} />
      </ControlPanel>
    </>
  );
}

function startLabel(isStarting: boolean, isLive: boolean): string {
  if (isStarting) return "Preparando transmissão...";
  if (isLive) return "Transmissão ativa";
  return "Iniciar compartilhamento";
}
