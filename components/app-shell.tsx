import Link from "next/link";
import type { ReactNode } from "react";

type AppShellProps = {
  note: string;
  children: ReactNode;
};

export function AppShell({ note, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark" />
          tela ao vivo
        </Link>
        <span className="topbar-note">{note}</span>
      </header>
      {children}
    </div>
  );
}
