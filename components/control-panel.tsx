import type { ReactNode } from "react";

type ControlPanelProps = {
  label: string;
  children: ReactNode;
};

export function ControlPanel({ label, children }: ControlPanelProps) {
  return (
    <aside className="control-panel">
      <span className="panel-label">{label}</span>
      {children}
    </aside>
  );
}

type MetricRowProps = {
  label: string;
  value: number;
};

export function MetricRow({ label, value }: MetricRowProps) {
  return (
    <div className="metric-row">
      <span>{label}</span>
      <strong>{String(value).padStart(2, "0")}</strong>
    </div>
  );
}
