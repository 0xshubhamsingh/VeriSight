import { Activity, Eye, ShieldAlert } from "lucide-react";
import { ManualScanner } from "../components/ManualScanner";
import { MetricCard } from "../components/MetricCard";
import { RiskBadge } from "../components/RiskBadge";
import { useVeriSightStore } from "../store/useStore";

export function Dashboard() {
  const {
    overallLiteracyScore,
    totalScans,
    activeThreatsPrevented,
    scans,
  } = useVeriSightStore();
  const recentScans = scans.slice(0, 3);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-normal text-emerald-300">
          Command Overview
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
          Verification intelligence dashboard
        </h1>
      </header>

      <ManualScanner />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={Activity}
          label="Literacy Score"
          value={`${overallLiteracyScore}%`}
          caption="Current user resilience index"
        />
        <MetricCard
          icon={Eye}
          label="Total Scans"
          value={totalScans.toLocaleString()}
          caption="Articles inspected by the extension"
        />
        <MetricCard
          icon={ShieldAlert}
          label="Threats Prevented"
          value={activeThreatsPrevented.toLocaleString()}
          caption="High-risk narratives intercepted"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="animate-fade-in-up rounded-xl border border-emerald-500/25 bg-slate-900/70 p-6 shadow-[0_0_15px_rgba(16,185,129,0.15)] [animation-delay:120ms]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-400">Media Literacy Gauge</p>
              <h2 className="mt-1 text-xl font-bold text-white">Signal strength</h2>
            </div>
            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-300">
              Stable
            </span>
          </div>

          <LiteracyGauge score={overallLiteracyScore} />
        </article>

        <article className="rounded-xl border border-emerald-500/20 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-400">Recent Activity</p>
              <h2 className="mt-1 text-xl font-bold text-white">Latest extension scans</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {recentScans.map((scan) => (
              <div
                key={scan.id}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <RiskBadge riskLevel={scan.riskLevel} />
                  <span className="text-sm font-semibold text-emerald-300">
                    {scan.confidence}% confidence
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-100">
                  {scan.headline}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(scan.date).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function LiteracyGauge({ score }: { score: number }) {
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="mt-8 flex flex-col items-center">
      <svg className="h-56 w-56 -rotate-90" viewBox="0 0 200 200" aria-hidden="true">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="rgba(15, 23, 42, 0.95)"
          strokeWidth="18"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#34d399"
          strokeLinecap="round"
          strokeWidth="18"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="drop-shadow-[0_0_12px_rgba(52,211,153,0.55)]"
        />
      </svg>
      <div className="-mt-36 text-center">
        <p className="text-5xl font-black tracking-tight text-white">{score}</p>
        <p className="text-sm font-semibold text-emerald-300">out of 100</p>
      </div>
      <p className="mt-20 max-w-sm text-center text-sm leading-6 text-slate-400">
        Strong verification habits with moderate exposure to misleading narratives.
      </p>
    </div>
  );
}
