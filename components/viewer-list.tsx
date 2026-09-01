import type { ViewerPresence } from "@/lib/peer/viewer-registry";

export function ViewerList({ viewers }: { viewers: ViewerPresence[] }) {
  if (viewers.length === 0) return null;

  return (
    <div className="viewer-list">
      <div className="viewer-list-heading">
        <span>Presença na sala</span>
        <strong>{viewers.length}</strong>
      </div>
      {viewers.map((viewer) => (
        <div className="viewer-item" key={viewer.id}>
          <span className={`viewer-avatar ${presenceClass(viewer)}`}>{initialOf(viewer.name)}</span>
          <span className="viewer-name">{viewer.name}</span>
          <span className={`viewer-status ${presenceClass(viewer)}`}>
            {viewer.connected ? "Conectado" : "Desconectado"}
          </span>
        </div>
      ))}
    </div>
  );
}

function presenceClass(viewer: ViewerPresence): string {
  return viewer.connected ? "online" : "offline";
}

function initialOf(name: string): string {
  return name.slice(0, 1).toUpperCase();
}
