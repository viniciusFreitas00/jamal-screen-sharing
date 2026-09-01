import type { Status } from "@/lib/status";

export function StatusLine({ status }: { status: Status }) {
  return (
    <div className="status-line">
      <span className={`status-dot ${status.kind}`} />
      <div>
        <strong>{status.title}</strong>
        <span>{status.detail}</span>
      </div>
    </div>
  );
}
