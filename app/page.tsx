import Link from "next/link";

import { AppShell } from "@/components/app-shell";

const ROLES = [
  {
    href: "/apresentador",
    badge: "01 / HOST",
    title: "Apresentar uma tela",
    description: "Inicie uma sala e envie sua tela com áudio para quem tiver o seu ID.",
  },
  {
    href: "/espectador",
    badge: "02 / GUEST",
    title: "Assistir uma tela",
    description: "Cole o ID de uma sala aberta e acompanhe a transmissão ao vivo.",
  },
] as const;

export default function HomePage() {
  return (
    <AppShell note="conexão direta · WebRTC">
      <main className="route-main">
        <p className="eyebrow">sala de transmissão</p>
        <h1 className="hero-title">
          Uma tela.
          <br />
          <em>Dois lugares.</em>
        </h1>
        <p className="hero-copy">
          Compartilhe sua tela e sua voz diretamente no navegador. Sem upload, sem cadastro, sem
          deixar a transmissão passar por um servidor.
        </p>
        <div className="role-grid">
          {ROLES.map((role) => (
            <Link className="role-card" href={role.href} key={role.href}>
              <span className="role-number">{role.badge}</span>
              <h2>{role.title}</h2>
              <p>{role.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
