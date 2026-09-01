export type ViewerMessage =
  | { type: "viewer-presence"; username: string }
  | { type: "viewer-heartbeat" };

export const HEARTBEAT_INTERVAL_MS = 4_000;

export const VIEWER_HEARTBEAT: ViewerMessage = { type: "viewer-heartbeat" };

export function viewerPresence(username: string): ViewerMessage {
  return { type: "viewer-presence", username };
}

export function parseViewerMessage(data: unknown): ViewerMessage | null {
  if (!data || typeof data !== "object") return null;

  const message = data as { type?: unknown; username?: unknown };

  if (message.type === "viewer-heartbeat") return VIEWER_HEARTBEAT;

  if (message.type === "viewer-presence" && typeof message.username === "string") {
    return viewerPresence(message.username);
  }

  return null;
}
