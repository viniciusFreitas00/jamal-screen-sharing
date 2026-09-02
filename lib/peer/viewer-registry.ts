import type { DataConnection, MediaConnection } from "peerjs";

export type ViewerPresence = {
  id: string;
  name: string;
  connected: boolean;
};

type ViewerRecord = {
  presence: ViewerPresence;
  connection: DataConnection;
  call: MediaConnection | null;
  lastSeenAt: number;
};

const DEFAULT_VIEWER_NAME = "Espectador";

export class ViewerRegistry {
  private readonly viewers = new Map<string, ViewerRecord>();

  open(id: string, connection: DataConnection): void {
    const known = this.viewers.get(id);

    this.viewers.set(id, {
      presence: known?.presence ?? { id, name: DEFAULT_VIEWER_NAME, connected: false },
      connection,
      call: null,
      lastSeenAt: Date.now(),
    });
  }

  join(id: string, call: MediaConnection): void {
    this.update(id, (viewer) => {
      viewer.call = call;
      viewer.presence = { ...viewer.presence, connected: true };
    });
  }

  rename(id: string, name: string): void {
    this.update(id, (viewer) => {
      viewer.presence = { ...viewer.presence, name };
    });
  }

  touch(id: string): void {
    this.update(id, (viewer) => {
      viewer.lastSeenAt = Date.now();
    });
  }

  leave(id: string): void {
    this.update(id, (viewer) => {
      viewer.connection.close();
      viewer.call?.close();
      viewer.call = null;
      viewer.presence = { ...viewer.presence, connected: false };
    });
  }

  dropExpired(timeoutMs: number): boolean {
    const deadline = Date.now() - timeoutMs;
    let dropped = false;

    this.viewers.forEach((viewer, id) => {
      if (!viewer.presence.connected || viewer.lastSeenAt > deadline) return;
      this.leave(id);
      dropped = true;
    });

    return dropped;
  }

  closeAll(): void {
    this.viewers.forEach((viewer) => {
      viewer.connection.close();
      viewer.call?.close();
    });
    this.viewers.clear();
  }

  list(): ViewerPresence[] {
    return Array.from(this.viewers.values(), (viewer) => viewer.presence);
  }

  liveCalls(): MediaConnection[] {
    return Array.from(this.viewers.values())
      .map((viewer) => viewer.call)
      .filter((call): call is MediaConnection => call !== null);
  }

  private update(id: string, change: (viewer: ViewerRecord) => void): void {
    const viewer = this.viewers.get(id);
    if (viewer) change(viewer);
  }
}
