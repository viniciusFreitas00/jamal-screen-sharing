import { MonitorPlay } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

type AppShellProps = {
  note: string;
  children: ReactNode;
};

export function AppShell({ note, children }: AppShellProps) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium">
            <MonitorPlay className="size-4 text-muted-foreground" />
            tela ao vivo
          </Link>
          <Badge variant="outline" className="font-mono text-[0.7rem] tracking-wide uppercase">
            {note}
          </Badge>
        </div>
      </header>
      {children}
    </div>
  );
}
