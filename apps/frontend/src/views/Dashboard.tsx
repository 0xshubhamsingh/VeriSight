import { Activity, Eye, ShieldAlert, Search } from "lucide-react";
import { ManualScanner } from "../components/ManualScanner";
import { MetricCard } from "../components/MetricCard";
import { RiskBadge } from "../components/RiskBadge";
import {
  useVeriSightStore,
  selectLiteracyScore,
  selectTotalScans,
  selectThreatsPrevented,
} from "../store/useStore";

export function Dashboard() {
  const literacyScore = useVeriSightStore(selectLiteracyScore);
  const totalScans = useVeriSightStore(selectTotalScans);
  const threatsPrevented = useVeriSightStore(selectThreatsPrevented);
  const scans = useVeriSightStore((s) => s.scans);
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
          value={literacyScore !== null ? `${literacyScore}%` : "—"}
          caption={
            literacyScore !== null
              ? "Current user resilience index"
              : "Run your first scan to see your score"
          }
        />
        <MetricCard
          icon={Eye}
          label="Total Scans"
          value={totalScans > 0 ? totalScans.toLocaleString() : "—"}
          caption={
            totalScans > 0
              ? "Articles inspected so far"
              : "No scans yet"
          }
        />
        <MetricCard
          icon={ShieldAlert}
          label="Threats Prevented"
          value={threatsPrevented > 0 ? threatsPrevented.toLocaleString() : "—"}
          caption={
            threatsPrevented > 0
              ? "High-risk narratives intercepted"
              : "No threats detected yet"
          }
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
              {literacyScore !== null
                ? literacyScore >= 70
                  ? "Strong"
                  : literacyScore >= 40
                    ? "Moderate"
                    : "Weak"
                : "Inactive"}
            </span>
          </div>

          <LiteracyGauge score={literacyScore} />
        </article>

        <article className="rounded-xl border border-emerald-500/20 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-400">Recent Activity</p>
              <h2 className="mt-1 text-xl font-bold text-white">Latest scans</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {recentScans.length > 0 ? (
              recentScans.map((scan) => (
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
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                  <Search className="h-6 w-6 text-slate-600" aria-hidden="true" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-400">No activity yet</p>
                <p className="mt-1 text-xs text-slate-600">
                  Scan an article above to see results here.
                </p>
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

function LiteracyGauge({ score }: { score: number | null }) {
  const displayScore = score ?? 0;
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (displayScore / 100) * circumference;

  const description =
    score === null
      ? "Run your first scan to start building your media literacy profile."
      : score >= 70
        ? "Strong verification habits — most of the content you encounter checks out."
        : score >= 40
          ? "Moderate resilience — a mix of verified and questionable content detected."
          : "Low score — many flagged items detected. Stay vigilant and verify claims.";

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
          stroke={score === null ? "#334155" : "#34d399"}
          strokeLinecap="round"
          strokeWidth="18"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={score !== null ? "drop-shadow-[0_0_12px_rgba(52,211,153,0.55)]" : ""}
        />
      </svg>
      <div className="-mt-36 text-center">
        <p className="text-5xl font-black tracking-tight text-white">
          {score !== null ? score : "—"}
        </p>
        <p className="text-sm font-semibold text-emerald-300">out of 100</p>
      </div>
      <p className="mt-20 max-w-sm text-center text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}
