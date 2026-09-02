import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import type { ViewerPresence } from "@/lib/peer/viewer-registry";

export function ViewerList({ viewers }: { viewers: ViewerPresence[] }) {
  if (viewers.length === 0) return null;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Presença na sala</CardTitle>
        <CardAction>
          <Badge variant="outline" className="font-mono">
            {viewers.length}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ItemGroup>
          {viewers.map((viewer) => (
            <Item key={viewer.id} size="xs">
              <ItemMedia>
                <Avatar className="size-7">
                  <AvatarFallback className="text-xs">
                    {viewer.name.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="truncate">{viewer.name}</ItemTitle>
              </ItemContent>
              <ItemActions>
                <Badge variant={viewer.connected ? "secondary" : "outline"}>
                  {viewer.connected ? "Conectado" : "Desconectado"}
                </Badge>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      </CardContent>
    </Card>
  );
}
