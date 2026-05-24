import { ExternalLink } from "lucide-react";
import { RiskBadge } from "../components/RiskBadge";
import { useVeriSightStore } from "../store/useStore";

export function ExposureFeed() {
  const scans = useVeriSightStore((state) => state.scans);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-normal text-emerald-300">
          Exposure Feed
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
          Historical scan ledger
        </h1>
      </header>

      <section className="overflow-hidden rounded-xl border border-emerald-500/20 bg-slate-900/70">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-950/70">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                  Risk
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                  Headline
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                  Classification
                </th>
                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-normal text-slate-500">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {scans.map((scan) => (
                <tr key={scan.id} className="transition hover:bg-emerald-400/[0.03]">
                  <td className="px-5 py-4">
                    <RiskBadge riskLevel={scan.riskLevel} />
                  </td>
                  <td className="max-w-xl px-5 py-4">
                    <div className="flex items-start gap-3">
                      <ExternalLink className="mt-1 h-4 w-4 flex-none text-slate-600" />
                      <div>
                        <p className="font-semibold leading-6 text-slate-100">
                          {scan.headline}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">{scan.url}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold capitalize text-slate-300">
                    {scan.classification}
                  </td>
                  <td className="px-5 py-4 text-right text-sm font-black text-emerald-300">
                    {scan.confidence}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
