import { CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { ComponentType } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Status, StatusKind } from "@/lib/status";

const ICONS: Record<StatusKind, ComponentType<{ className?: string }>> = {
  idle: Info,
  ready: CircleCheck,
  error: TriangleAlert,
};

export function StatusAlert({ status }: { status: Status }) {
  const Icon = ICONS[status.kind];

  return (
    <Alert variant={status.kind === "error" ? "destructive" : "default"}>
      <Icon />
      <AlertTitle>{status.title}</AlertTitle>
      <AlertDescription>{status.detail}</AlertDescription>
    </Alert>
  );
}
