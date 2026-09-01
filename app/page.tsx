import { ArrowRight, Eye, MonitorUp } from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type Role = {
  href: "/apresentador" | "/espectador";
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action: string;
};

const ROLES: Role[] = [
  {
    href: "/apresentador",
    icon: MonitorUp,
    title: "Apresentar uma tela",
    description: "Inicie uma sala e envie sua tela com áudio para quem tiver o link.",
    action: "Abrir uma sala",
  },
  {
    href: "/espectador",
    icon: Eye,
    title: "Assistir uma tela",
    description: "Entre com o ID de uma sala aberta e acompanhe a transmissão ao vivo.",
    action: "Entrar em uma sala",
  },
];

export default function HomePage() {
  return (
    <AppShell note="conexão direta · WebRTC">
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
        <div className="max-w-2xl space-y-4">
          <Badge variant="secondary">Ponto a ponto, sem servidor no meio</Badge>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Uma tela. Dois lugares.
          </h1>
          <p className="text-base text-muted-foreground">
            Compartilhe sua tela e sua voz diretamente no navegador. Sem upload, sem cadastro, sem
            deixar a transmissão passar por um servidor.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:max-w-3xl">
          {ROLES.map((role) => (
            <Link
              key={role.href}
              href={role.href}
              className="group rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Card className="h-full transition-shadow group-hover:ring-foreground/25">
                <CardHeader>
                  <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-muted">
                    <role.icon className="size-4" />
                  </div>
                  <CardTitle>{role.title}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardFooter className="justify-between text-sm font-medium">
                  {role.action}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
