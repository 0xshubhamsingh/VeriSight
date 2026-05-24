import type { RiskLevel } from "@verisight/shared-types";

const riskClasses: Record<RiskLevel, string> = {
  low: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  medium: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  high: "border-rose-400/30 bg-rose-400/10 text-rose-300",
};

export function RiskBadge({ riskLevel }: { riskLevel: RiskLevel }) {
  return (
    <span
      className={`inline-flex min-w-20 justify-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${riskClasses[riskLevel]}`}
    >
      {riskLevel}
    </span>
  );
}
