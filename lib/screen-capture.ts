import { VIDEO_PROFILE } from "@/lib/video-profile";

export type CaptureSource = {
  video: MediaStreamTrack;
  isTab: boolean;
  hasAudio: boolean;
};

export type ScreenCapture = {
  stream: MediaStream;
  selectSource: () => Promise<CaptureSource>;
  stop: () => void;
};

const DISPLAY_MEDIA_OPTIONS: DisplayMediaStreamOptions = {
  video: {
    displaySurface: "browser",
    width: { ideal: VIDEO_PROFILE.width, max: VIDEO_PROFILE.width },
    height: { ideal: VIDEO_PROFILE.height, max: VIDEO_PROFILE.height },
    frameRate: { ideal: VIDEO_PROFILE.frameRate, max: VIDEO_PROFILE.frameRate },
  },
  audio: true,
  systemAudio: "exclude",
  windowAudio: "exclude",
  selfBrowserSurface: "exclude",
  surfaceSwitching: "exclude",
};

export function createScreenCapture(): ScreenCapture {
  const context = new AudioContext();
  const bus = context.createMediaStreamDestination();
  const stream = new MediaStream(bus.stream.getAudioTracks());

  let source: MediaStream | null = null;
  let audioInput: MediaStreamAudioSourceNode | null = null;

  function releaseSource(): void {
    audioInput?.disconnect();
    audioInput = null;
    stopTracks(source);
    source = null;
  }

  function publishVideo(video: MediaStreamTrack): void {
    stream.getVideoTracks().forEach((track) => stream.removeTrack(track));
    stream.addTrack(video);
  }

  function publishAudio(tracks: MediaStreamTrack[]): void {
    if (!tracks.length) return;
    audioInput = context.createMediaStreamSource(new MediaStream(tracks));
    audioInput.connect(bus);
  }

  return {
    stream,

    selectSource: async () => {
      const picked = await navigator.mediaDevices.getDisplayMedia(DISPLAY_MEDIA_OPTIONS);
      const video = await prepareVideoTrack(picked);
      const audio = picked.getAudioTracks();

      releaseSource();
      publishVideo(video);
      publishAudio(audio);
      source = picked;

      if (context.state === "suspended") await context.resume();

      return {
        video,
        isTab: video.getSettings().displaySurface === "browser",
        hasAudio: audio.length > 0,
      };
    },

    stop: () => {
      releaseSource();
      stopTracks(stream);
      void context.close();
    },
  };
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
