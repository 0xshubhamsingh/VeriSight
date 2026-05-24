import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useVeriSightStore } from "../store/useStore";

export function Insights() {
  const exposureTrend = useVeriSightStore((state) => state.exposureTrend);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-normal text-emerald-300">
          Insights
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
          Exposure over time
        </h1>
      </header>

      <section className="rounded-xl border border-emerald-500/20 bg-slate-900/70 p-6 shadow-[0_0_15px_rgba(16,185,129,0.12)]">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Seven-day scan velocity</h2>
            <p className="mt-1 text-sm text-slate-400">
              Daily extension scans compared with high-risk threats.
            </p>
          </div>
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={exposureTrend} margin={{ left: 0, right: 12, top: 12 }}>
              <defs>
                <linearGradient id="scanGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.34} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} stroke="#64748b" />
              <YAxis tickLine={false} axisLine={false} stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  background: "#020617",
                  border: "1px solid rgba(16,185,129,0.28)",
                  borderRadius: "12px",
                  color: "#e2e8f0",
                }}
              />
              <Area
                type="monotone"
                dataKey="scans"
                stroke="#34d399"
                strokeWidth={3}
                fill="url(#scanGradient)"
                name="Scans"
              />
              <Area
                type="monotone"
                dataKey="threats"
                stroke="#fb7185"
                strokeWidth={2}
                fill="transparent"
                name="Threats"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
