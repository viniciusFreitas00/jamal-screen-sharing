import { AppShell } from "@/components/app-shell";
import { Workspace } from "@/components/workspace";
import { PRESENTER_ID_PARAM } from "@/lib/routes";

import { ViewerRoom } from "./viewer-room";

export default async function ViewerPage(props: PageProps<"/espectador">) {
  const params = await props.searchParams;
  const presenterId = params[PRESENTER_ID_PARAM];

  return (
    <AppShell note="modo espectador">
      <Workspace title="Assista de qualquer lugar.">
        <ViewerRoom initialPresenterId={typeof presenterId === "string" ? presenterId : ""} />
      </Workspace>
    </AppShell>
  );
}
