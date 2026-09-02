import type { ReactNode } from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ControlPanelProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

export function ControlPanel({ title, action, children }: ControlPanelProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}
