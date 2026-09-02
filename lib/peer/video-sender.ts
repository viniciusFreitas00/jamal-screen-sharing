import type { MediaConnection } from "peerjs";

export function videoSenderOf(call: MediaConnection): RTCRtpSender | undefined {
  return call.peerConnection
    ?.getSenders()
    .find((candidate) => candidate.track?.kind === "video");
}

export async function replaceVideoTrack(
  call: MediaConnection,
  track: MediaStreamTrack,
): Promise<void> {
  await videoSenderOf(call)
    ?.replaceTrack(track)
    .catch(() => undefined);
}
