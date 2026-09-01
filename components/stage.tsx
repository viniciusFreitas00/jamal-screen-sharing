"use client";

import type { ReactNode, RefObject } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
    <Card className="relative aspect-video gap-0 bg-muted p-0">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        controls={controls}
        aria-label={label}
        className="absolute inset-0 size-full object-contain"
      />
      {!isLive && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
          {children}
        </div>
      )}
      {isLive && (
        <Badge
          variant="destructive"
          className="absolute top-3 left-3 gap-1.5 bg-background/85 uppercase backdrop-blur-sm"
        >
          <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
          Ao vivo
        </Badge>
      )}
    </Card>
  );
}
