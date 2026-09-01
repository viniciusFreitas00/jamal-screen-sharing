import { VIDEO_PROFILE } from "@/lib/video-profile";

export type ScreenCapture = {
  stream: MediaStream;
  microphoneAvailable: boolean;
  stop: () => void;
};

export async function captureScreenWithAudio(): Promise<ScreenCapture> {
  const screen = await navigator.mediaDevices.getDisplayMedia({
    video: {
      width: { ideal: VIDEO_PROFILE.width, max: VIDEO_PROFILE.width },
      height: { ideal: VIDEO_PROFILE.height, max: VIDEO_PROFILE.height },
      frameRate: { ideal: VIDEO_PROFILE.frameRate, max: VIDEO_PROFILE.frameRate },
    },
    audio: true,
  });

  const microphone = await requestMicrophone();
  const audioContext = new AudioContext();
  const mixer = mixAudio(audioContext, [audioTracksOf(screen), audioTracksOf(microphone)]);
  const video = await prepareVideoTrack(screen);
  const stream = new MediaStream([video, ...mixer.stream.getAudioTracks()]);

  return {
    stream,
    microphoneAvailable: microphone !== null,
    stop: () => {
      stopTracks(stream);
      stopTracks(screen);
      stopTracks(microphone);
      void audioContext.close();
    },
  };
}

async function requestMicrophone(): Promise<MediaStream | null> {
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  } catch {
    return null;
  }
}

function audioTracksOf(source: MediaStream | null): MediaStream | null {
  const tracks = source?.getAudioTracks() ?? [];
  return tracks.length ? new MediaStream(tracks) : null;
}

function mixAudio(
  context: AudioContext,
  sources: (MediaStream | null)[],
): MediaStreamAudioDestinationNode {
  const mixer = context.createMediaStreamDestination();

  sources.forEach((source) => {
    if (source) context.createMediaStreamSource(source).connect(mixer);
  });

  return mixer;
}

async function prepareVideoTrack(screen: MediaStream): Promise<MediaStreamTrack> {
  const [video] = screen.getVideoTracks();
  video.contentHint = "detail";

  await video
    .applyConstraints({
      width: { max: VIDEO_PROFILE.width },
      height: { max: VIDEO_PROFILE.height },
      frameRate: { ideal: VIDEO_PROFILE.frameRate, max: VIDEO_PROFILE.frameRate },
    })
    .catch(() => undefined);

  return video;
}

function stopTracks(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}
