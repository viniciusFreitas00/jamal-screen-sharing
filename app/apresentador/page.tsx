import { AppShell } from "@/components/app-shell";
import { Workspace } from "@/components/workspace";

import { BroadcastRoom } from "./broadcast-room";

export default function PresenterPage() {
  return (
    <AppShell note="modo apresentador">
      <Workspace title="Apresente sua tela.">
        <BroadcastRoom />
      </Workspace>
    </AppShell>
  );
}
