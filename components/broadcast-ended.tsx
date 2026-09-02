import Image from "next/image";

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
        <EmptyMedia className="min-h-0 shrink">
          <Image
            src="/jacare.png"
            alt="Jacaré de boné depois do fim da transmissão"
            width={310}
            height={242}
            className="h-auto max-h-48 w-auto max-w-64 rounded-lg object-contain"
          />
        </EmptyMedia>
        <EmptyTitle>Live encerrada</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
