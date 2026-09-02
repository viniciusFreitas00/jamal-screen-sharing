import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";

type WorkspaceProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function Workspace({ title, description, children }: WorkspaceProps) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Link href="/" className={buttonVariants({ variant: "outline", size: "sm" })}>
          <ArrowLeft />
          Trocar de modo
        </Link>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">{children}</div>
    </main>
  );
}
