import { AppShell } from "@/components/app-shell";
import { Workspace } from "@/components/workspace";

import { BroadcastRoom } from "./broadcast-room";

export default function PresenterPage() {
  return (
    <AppShell note="modo apresentador">
      <Workspace
        title="Apresente sua tela"
        description="Compartilhe sua tela e seu áudio com quem tiver o link da sala."
      >
        <BroadcastRoom />
      </Workspace>
    </AppShell>
  );
}
