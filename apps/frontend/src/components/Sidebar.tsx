import { BarChart3, LayoutDashboard, ListChecks, ShieldCheck } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/exposure", label: "Exposure Feed", icon: ListChecks },
  { to: "/insights", label: "Insights", icon: BarChart3 },
];

export function Sidebar() {
  return (
    <aside className="flex min-h-screen w-72 flex-col border-r border-emerald-500/15 bg-slate-950/95 px-5 py-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-2 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.18)]">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-lg font-black tracking-tight text-white">VeriSight</p>
          <p className="text-xs font-medium text-emerald-300/80">Analytics Hub</p>
        </div>
      </div>

      <nav className="mt-9 grid gap-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition",
                isActive
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.14)]"
                  : "border-transparent text-slate-400 hover:border-emerald-500/20 hover:bg-slate-900 hover:text-slate-100",
              ].join(" ")
            }
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-emerald-500/20 bg-slate-900/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">
          Coverage
        </p>
        <p className="mt-2 text-sm text-slate-300">
          142 scans indexed across 7 active monitoring days.
        </p>
      </div>
    </aside>
  );
}
