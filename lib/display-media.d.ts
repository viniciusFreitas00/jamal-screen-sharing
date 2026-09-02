type DisplayMediaSurfacePolicy = "include" | "exclude";

type DisplayMediaWindowAudioPolicy = "system" | "window" | "exclude";

interface DisplayMediaStreamOptions {
  systemAudio?: DisplayMediaSurfacePolicy;
  windowAudio?: DisplayMediaWindowAudioPolicy;
  selfBrowserSurface?: DisplayMediaSurfacePolicy;
  surfaceSwitching?: DisplayMediaSurfacePolicy;
}
