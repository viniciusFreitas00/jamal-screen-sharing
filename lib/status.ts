export type StatusKind = "idle" | "ready" | "error";

export type Status = {
  kind: StatusKind;
  title: string;
  detail: string;
};

export function errorStatus(title: string, detail: string): Status {
  return { kind: "error", title, detail };
}
