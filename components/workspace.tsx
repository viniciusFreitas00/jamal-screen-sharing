import Link from "next/link";
import type { ReactNode } from "react";

type WorkspaceProps = {
  title: string;
  children: ReactNode;
};

export function Workspace({ title, children }: WorkspaceProps) {
  return (
    <main className="workspace">
      <div className="workspace-header">
        <div>
          <p className="eyebrow">sala de transmissão</p>
          <h1>{title}</h1>
        </div>
        <Link className="back-link" href="/">
          Trocar de modo
        </Link>
      </div>
      <div className="workspace-grid">{children}</div>
    </main>
  );
}
