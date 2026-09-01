import Image from "next/image";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import jacare from "@/public/jacare.jpg";

export function BroadcastEnded({ description }: { description: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <Image
            src={jacare}
            alt="Jacaré de boné olhando de lado"
            className="max-h-48 w-auto rounded-lg"
            unoptimized
          />
        </EmptyMedia>
        <EmptyTitle>Transmissão encerrada</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
