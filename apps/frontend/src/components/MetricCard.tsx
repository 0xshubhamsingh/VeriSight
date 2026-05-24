import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  caption: string;
  icon: LucideIcon;
}

export function MetricCard({ label, value, caption, icon: Icon }: MetricCardProps) {
  return (
    <article className="animate-fade-in-up rounded-xl border border-emerald-500/25 bg-slate-900/70 p-5 shadow-[0_0_15px_rgba(16,185,129,0.16)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <strong className="mt-2 block text-3xl font-black tracking-tight text-white">
            {value}
          </strong>
        </div>
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-300">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500">{caption}</p>
    </article>
  );
}
