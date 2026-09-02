import Image from "next/image";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type BroadcastIdleProps = {
  title: string;
  description: string;
};

export function BroadcastIdle({ title, description }: BroadcastIdleProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia className="min-h-0 shrink">
          <Image
            src="/jacare.gif"
            alt="Jacaré de boné esperando a transmissão começar"
            width={399}
            height={527}
            className="h-auto max-h-64 w-auto max-w-52 rounded-lg object-contain"
            unoptimized
          />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
