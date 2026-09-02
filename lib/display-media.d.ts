type DisplayMediaSurfacePolicy = "include" | "exclude";

interface DisplayMediaStreamOptions {
  systemAudio?: DisplayMediaSurfacePolicy;
  monitorTypeSurfaces?: DisplayMediaSurfacePolicy;
  selfBrowserSurface?: DisplayMediaSurfacePolicy;
  surfaceSwitching?: DisplayMediaSurfacePolicy;
}
