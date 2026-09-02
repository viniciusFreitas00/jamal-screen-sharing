import type { MediaConnection } from "peerjs";

import { VIDEO_PROFILE } from "@/lib/video-profile";

export async function applyVideoQuality(call: MediaConnection): Promise<void> {
  const sender = call.peerConnection
    ?.getSenders()
    .find((candidate) => candidate.track?.kind === "video");

  if (!sender) return;

  const parameters = sender.getParameters();
  const encodings = parameters.encodings?.length ? parameters.encodings : [{}];

  encodings[0] = {
    ...encodings[0],
    maxBitrate: VIDEO_PROFILE.maxBitrate,
    maxFramerate: VIDEO_PROFILE.frameRate,
    scaleResolutionDownBy: 1,
  };

  parameters.encodings = encodings;
  parameters.degradationPreference = "maintain-resolution";

  await sender.setParameters(parameters).catch(() => undefined);
}
