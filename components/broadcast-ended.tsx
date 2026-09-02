import { VideoOff } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function BroadcastEnded({ description }: { description: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-background">
          <VideoOff />
        </EmptyMedia>
        <EmptyTitle>Live encerrada</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
