"use client";

import type { ReactNode, RefObject } from "react";

type StageProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  label: string;
  isLive: boolean;
  muted?: boolean;
  controls?: boolean;
  children: ReactNode;
};

export function Stage({ videoRef, label, isLive, muted, controls, children }: StageProps) {
  return (
    <section className="stage">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        controls={controls}
        aria-label={label}
      />
      {!isLive && <div className="stage-empty">{children}</div>}
      {isLive && (
        <div className="stage-live">
          <span className="live-dot" />
          Ao vivo
        </div>
      )}
    </section>
  );
}
