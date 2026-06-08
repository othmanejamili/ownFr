// ─────────────────────────────────────────────
//  AnalyticsPage.jsx
//  Route: /dashboard/owner/analytics
//  Uses: ALL schoolanalytics endpoints
//  Tabs: Overview · Trends · Instructors
//        Students · Comparison · Alerts · System
// ─────────────────────────────────────────────
import React, { useState, useCallback, useMemo, useEffect } from "react";
import Sidebar from '../Sidebar';
import {
  useDashboard, useAlerts, usePredictions, useSummary,
  useTrends, useComparison, useSystemHealth, useSchools,
  useAnalyticsMutations,
} from "./Useanalytics";

import {
  fmt, severityColor, trendDir, healthColor, CHART_COLORS,
  MOCK_DASHBOARD, MOCK_ALERTS, MOCK_PREDICTIONS,
  MOCK_SUMMARY, MOCK_TRENDS, MOCK_HEALTH,
} from "./Analyticsutils";

// ── Recharts ──────────────────────────────────────────────────
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadialBarChart, RadialBar, PieChart, Pie, Cell,
} from "recharts";

// ─────────────────────────────────────────────
//  Tiny UI primitives
// ─────────────────────────────────────────────
//SCHOOL_ID

const Tab = ({ active, onClick, children, badge }) => (
  <button
    onClick={onClick}
    className={`relative px-3.5 py-2 rounded-lg text-[12px] font-semibold tracking-wide transition-all duration-150
      ${active
        ? "bg-blue-600/20 text-blue-300 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.35)]"
        : "text-white/30 hover:text-white/70 hover:bg-white/[0.04]"}`}
  >
    {children}
    {badge > 0 && (
      <span className="ml-1.5 px-1.5 py-px rounded-full text-[9px] font-bold bg-red-500/25 text-red-400">
        {badge}
      </span>
    )}
  </button>
);

const Pill = ({ children, color = "blue" }) => {
  const map = { blue: "bg-blue-500/15 text-blue-400", violet: "bg-violet-500/15 text-violet-400",
    amber: "bg-amber-500/15 text-amber-400", emerald: "bg-emerald-500/15 text-emerald-400",
    red: "bg-red-500/15 text-red-400" };
  return <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${map[color]}`}>{children}</span>;
};

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin text-white/30" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const Card = ({ children, className = "", glow = false }) => (
  <div className={`relative bg-[#0D1828] border border-white/[0.06] rounded-2xl overflow-hidden
    transition-all duration-200 hover:border-white/[0.1] ${className}`}>
    {glow && <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.04] to-transparent pointer-events-none" />}
    {children}
  </div>
);

const CardBody = ({ children, className = "" }) => <div className={`p-5 ${className}`}>{children}</div>;

const SectionHead = ({ title, sub, action }) => (
  <div className="flex items-start justify-between mb-5">
    <div>
      <h2 className="text-[14px] font-bold text-white tracking-tight">{title}</h2>
      {sub && <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>}
    </div>
    {action}
  </div>
);

const EmptyState = ({ icon, title, sub }) => (
  <div className="flex flex-col items-center justify-center py-14 text-center">
    <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-2xl mb-4">{icon}</div>
    <p className="text-[14px] font-bold text-white mb-1">{title}</p>
    <p className="text-[12px] text-white/30">{sub}</p>
  </div>
);

const ErrorBanner = ({ msg, onDismiss }) => (
  <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-[12px] text-red-400">
    <span className="text-[16px]">⚠</span>
    <span className="flex-1">{msg}</span>
    {onDismiss && <button onClick={onDismiss} className="text-red-400/60 hover:text-red-400 ml-2">✕</button>}
  </div>
);

// ── Stat card ─────────────────────────────────────────────────
const StatCard = ({ label, value, sub, delta, deltaLabel, icon, accent = "#3b82f6", loading }) => (
  <Card glow>
    <CardBody>
      {icon && (
        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${accent}22` }}>
          <span style={{ color: accent }} className="text-[16px]">{icon}</span>
        </div>
      )}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-7 w-20 bg-white/[0.06] rounded" />
          <div className="h-3 w-28 bg-white/[0.04] rounded mt-2" />
        </div>
      ) : (
        <>
          <div className="text-[28px] font-bold text-white tracking-tight leading-none mb-1">{value}</div>
          <div className="text-[12px] text-white/40 mb-2">{label}</div>
          <div className="flex items-center gap-2 flex-wrap">
            {delta != null && delta !== 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                ${delta > 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                {delta > 0 ? "↑" : "↓"} {Math.abs(delta)}{deltaLabel ? ` ${deltaLabel}` : ""}
              </span>
            )}
            {sub && <span className="text-[11px] text-white/25">{sub}</span>}
          </div>
        </>
      )}
    </CardBody>
  </Card>
);

// ── Stars ─────────────────────────────────────────────────────
const Stars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map((s) => (
      <svg key={s} width="10" height="10" viewBox="0 0 10 10">
        <path d="M5 1l1.1 3H9L6.5 5.8l1 3L5 7 2.5 8.8l1-3L1 4h2.9z"
          fill={s <= Math.round(rating) ? "#f59e0b" : "rgba(255,255,255,0.1)"} />
      </svg>
    ))}
  </div>
);

// ── Health dot ────────────────────────────────────────────────
const HealthDot = ({ status }) => {
  const map = { healthy: "bg-emerald-400", warning: "bg-amber-400", unhealthy: "bg-red-400" };
  return <span className={`inline-block w-2 h-2 rounded-full ${map[status] ?? "bg-white/20"}`} />;
};

// ── Chart tooltip ─────────────────────────────────────────────
const ChartTip = ({ active, payload, label, fmt: fmtFn }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0D1828] border border-white/[0.1] rounded-xl px-3 py-2.5 shadow-xl text-[11px]">
      <p className="text-white/40 mb-1.5 font-medium">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-white/60 capitalize">{p.name}:</span>
          <span className="font-bold text-white">{fmtFn ? fmtFn(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

const axisStyle = { fill: "rgba(255,255,255,0.2)", fontSize: 10, fontFamily: "monospace" };
const gridStyle = { stroke: "rgba(255,255,255,0.04)", strokeDasharray: "3 3" };

// ── Alert badge ───────────────────────────────────────────────
const AlertBadge = ({ alert, sev }) => {
  const c = severityColor[sev] ?? severityColor.low;
  return (
    <div className={`rounded-xl border p-4 ${c.bg} ${c.border}`}>
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${c.dot}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-[12px] font-bold ${c.text}`}>{alert.title}</p>
          <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">{alert.message}</p>
          {alert.suggestion && <p className="text-[11px] text-white/25 mt-1.5 italic">{alert.suggestion}</p>}
        </div>
      </div>
    </div>
  );
};

// ── HBar ─────────────────────────────────────────────────────
const HBar = ({ label, value, max = 100, color = CHART_COLORS.primary, suffix = "" }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[12px] text-white/50 truncate max-w-[65%]">{label}</span>
      <span className="text-[12px] font-bold text-white">{value}{suffix}</span>
    </div>
    <div className="h-[5px] bg-white/[0.05] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, (Number(value) / max) * 100)}%`, background: color }} />
    </div>
  </div>
);

// ── Pred row ──────────────────────────────────────────────────
const PredRow = ({ label, current, predicted, dir }) => {
  const { icon, cls } = trendDir(dir);
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
      <span className="text-[12px] text-white/40">{label}</span>
      <div className="flex items-center gap-2.5">
        <span className="text-[11px] text-white/25 line-through">{current}</span>
        <span className="text-[13px] font-bold text-white">{predicted}</span>
        <span className={`text-[13px] font-bold ${cls}`}>{icon}</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  BULK GENERATE MODAL
// ─────────────────────────────────────────────
const BulkModal = ({ onClose, onSubmit, saving, schoolId }) => {
  const [start, setStart] = useState("");
  const [end,   setEnd  ] = useState("");
  const [err,   setErr  ] = useState("");

  const submit = () => {
    if (!start || !end) { 
      setErr("Both dates are required"); 
      return; 
    }
    if (new Date(end) < new Date(start)) { 
      setErr("End must be after start"); 
      return; 
    }
    const days = (new Date(end) - new Date(start)) / 86400000;
    if (days > 90) { 
      setErr("Range cannot exceed 90 days"); 
      return; 
    }
    // Use the passed schoolId instead of undefined SCHOOL_ID
    onSubmit({ school_ids: [schoolId], start_date: start, end_date: end });
  };

  const inp = "w-full bg-[#060B18] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white focus:outline-none focus:border-blue-500/50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0D1828] border border-white/[0.1] rounded-2xl p-6 w-[380px] shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-[14px] font-bold text-white mb-1">Bulk Generate Analytics</h3>
        <p className="text-[11px] text-white/30 mb-5">Generate records for a date range (max 90 days).</p>
        {err && <ErrorBanner msg={err} onDismiss={() => setErr("")} />}
        <div className="space-y-3 mt-3">
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Start date</label>
            <input type="date" value={start} onChange={e => setStart(e.target.value)} className={inp} />
          </div>
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">End date</label>
            <input type="date" value={end} onChange={e => setEnd(e.target.value)} className={inp} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-white/[0.08] text-[12px] text-white/40 hover:text-white transition-colors">
            Cancel
          </button>
          <button onClick={submit} disabled={saving}
            className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-[12px] font-bold text-white transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
            {saving && <Spinner />}{saving ? "Generating…" : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  COMPARISON PANEL
// ─────────────────────────────────────────────
const ComparisonPanel = () => {
  const { data: schools }      = useSchools();
  const { data, loading, error, compare } = useComparison();
  const [selectedIds, setIds]  = useState([]);
  const [start, setStart]      = useState("");
  const [end,   setEnd  ]      = useState("");
  const [err,   setErr  ]      = useState("");

  const schoolList = useMemo(() => {
    const raw = schools;
    return Array.isArray(raw) ? raw : raw?.results ?? [];
  }, [schools]);

  const toggleId = (id) =>
    setIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 5 ? [...prev, id] : prev);

  const run = () => {
    if (selectedIds.length < 2) { setErr("Select at least 2 schools"); return; }
    if (!start || !end) { setErr("Both dates required"); return; }
    setErr("");
    compare(selectedIds, start, end);
  };

  const inp = "bg-[#060B18] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white focus:outline-none focus:border-blue-500/50";

  const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.emerald, CHART_COLORS.violet, CHART_COLORS.amber, CHART_COLORS.cyan];

  return (
    <div className="space-y-5">
      <SectionHead title="School Comparison" sub="Compare up to 5 schools across any date range" />

      {/* Config card */}
      <Card>
        <CardBody>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Select schools (max 5)</p>
              <div className="flex flex-wrap gap-2">
                {schoolList.slice(0, 8).map((s) => {
                  const sel = selectedIds.includes(s.id);
                  return (
                    <button key={s.id} onClick={() => toggleId(s.id)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all
                        ${sel ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "border-white/[0.06] text-white/40 hover:text-white"}`}>
                      {s.name}
                    </button>
                  );
                })}
                {schoolList.length === 0 && (
                  <p className="text-[11px] text-white/20">Using mock schools — connect API to populate</p>
                )}
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Start</p>
                <input type="date" value={start} onChange={e => setStart(e.target.value)} className={inp} />
              </div>
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">End</p>
                <input type="date" value={end} onChange={e => setEnd(e.target.value)} className={inp} />
              </div>
              <button onClick={run} disabled={loading}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-[12px] font-bold text-white transition-colors disabled:opacity-40 flex items-center gap-2">
                {loading && <Spinner />} Compare
              </button>
            </div>
          </div>
          {err && <div className="mt-3"><ErrorBanner msg={err} onDismiss={() => setErr("")} /></div>}
        </CardBody>
      </Card>

      {error && <ErrorBanner msg={error} />}

      {data ? (
        <>
          {/* Overall stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Highest Completion", value: fmt.pct(data.overall_statistics?.highest_completion_rate), accent: CHART_COLORS.emerald, icon: "🏆" },
              { label: "Best Rating",         value: fmt.rating(data.overall_statistics?.highest_average_rating), accent: CHART_COLORS.amber, icon: "⭐" },
              { label: "Highest Revenue",     value: fmt.money(data.overall_statistics?.highest_total_revenue), accent: CHART_COLORS.primary, icon: "💰" },
            ].map((s) => <StatCard key={s.label} {...s} />)}
          </div>

          {/* Ranking table */}
          <Card>
            <CardBody>
              <SectionHead title="Performance Ranking" sub={`${data.period?.start_date} → ${data.period?.end_date}`} />
              <div className="space-y-3">
                {data.school_comparison?.map((sc, i) => (
                  <div key={sc.school.id}
                    className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0">
                    <span className={`text-[18px] font-black w-8 text-center flex-shrink-0
                      ${i === 0 ? "text-amber-400" : i === 1 ? "text-white/50" : "text-white/20"}`}>
                      #{sc.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-white truncate">{sc.school.name}</p>
                      <p className="text-[10px] text-white/30">{sc.data_points} data points</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-right flex-shrink-0">
                      <div>
                        <p className="text-[11px] text-white/25">Completion</p>
                        <p className="text-[13px] font-bold text-white">{fmt.pct(sc.period_summary?.average_completion_rate)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-white/25">Rating</p>
                        <p className="text-[13px] font-bold text-amber-400">{fmt.rating(sc.period_summary?.average_rating)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-white/25">Revenue</p>
                        <p className="text-[13px] font-bold text-white">{fmt.money(sc.period_summary?.total_revenue)}</p>
                      </div>
                    </div>
                    {sc.growth_rates && (
                      <span className={`text-[11px] font-bold flex-shrink-0
                        ${sc.growth_rates.student_growth > 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {fmt.delta(sc.growth_rates.student_growth)}% students
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Pie chart — revenue share */}
          {data.school_comparison?.length > 0 && (
            <Card>
              <CardBody>
                <SectionHead title="Revenue Distribution" />
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie data={data.school_comparison} dataKey="period_summary.total_revenue"
                        nameKey="school.name" cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                        {data.school_comparison.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => fmt.money(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {data.school_comparison.map((sc, i) => (
                      <div key={sc.school.id} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-[12px] text-white/60 flex-1 truncate">{sc.school.name}</span>
                        <span className="text-[12px] font-bold text-white">{fmt.money(sc.period_summary?.total_revenue)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </>
      ) : !loading && (
        <EmptyState icon="📊" title="No comparison data" sub="Select schools and a date range to compare performance." />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
//  SYSTEM HEALTH PANEL
// ─────────────────────────────────────────────
const SystemHealthPanel = () => {
  const { data, loading, error, refetch } = useSystemHealth(true);
  const h = data ?? MOCK_HEALTH;
  const sh = h.system_health ?? {};
  const hc = healthColor[sh.status] ?? healthColor.healthy;

  const checkIcon = (status) => {
    if (status === "healthy")   return <span className="text-emerald-400">✓</span>;
    if (status === "warning")   return <span className="text-amber-400">⚠</span>;
    return <span className="text-red-400">✕</span>;
  };

  return (
    <div className="space-y-5">
      <SectionHead title="System Health" sub="Platform admin — analytics module diagnostics"
        action={<button onClick={refetch} className="text-[11px] text-white/30 hover:text-white px-3 py-1.5 rounded-lg border border-white/[0.06] hover:border-white/20 transition-colors flex items-center gap-2">{loading && <Spinner />}Refresh</button>} />

      {error && <ErrorBanner msg={error} />}

      {/* Status banner */}
      <Card>
        <CardBody className={`${hc.bg}`}>
          <div className="flex items-center gap-5">
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">System Status</p>
              <p className={`text-[28px] font-black ${hc.cls} leading-none`}>{hc.label}</p>
              <p className="text-[11px] text-white/25 mt-1">{sh.timestamp ? new Date(sh.timestamp).toLocaleString() : "—"}</p>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-3">
              {[
                { label: "Checks run",   val: sh.checks_performed ?? 5,   cls: "text-white" },
                { label: "Warnings",     val: sh.warning_checks ?? 0,     cls: "text-amber-400" },
                { label: "Failures",     val: sh.unhealthy_checks ?? 0,   cls: "text-red-400" },
              ].map(x => (
                <div key={x.label} className="bg-black/20 rounded-xl p-3 text-center">
                  <p className={`text-[22px] font-black ${x.cls}`}>{x.val}</p>
                  <p className="text-[10px] text-white/25 mt-0.5">{x.label}</p>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Detailed checks */}
      <Card>
        <CardBody>
          <SectionHead title="Component Checks" />
          <div className="space-y-0">
            {Object.entries(h.detailed_checks ?? {}).map(([key, check]) => (
              <div key={key}
                className="flex items-start gap-4 py-3.5 border-b border-white/[0.04] last:border-0">
                <span className="text-[16px] w-5 flex-shrink-0 mt-0.5">{checkIcon(check.status)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[12px] font-bold text-white capitalize">{key.replace(/_/g, " ")}</p>
                    <HealthDot status={check.status} />
                  </div>
                  <p className="text-[11px] text-white/35">{check.message}</p>
                  {check.details && (
                    <div className="mt-2 flex flex-wrap gap-3">
                      {Object.entries(check.details).map(([k, v]) => (
                        <span key={k} className="text-[10px] bg-white/[0.04] rounded px-2 py-0.5 text-white/30">
                          {k.replace(/_/g, " ")}: <b className="text-white/50">{typeof v === "number" ? v.toLocaleString() : String(v)}</b>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Recommendations */}
      {h.recommendations?.length > 0 && (
        <Card>
          <CardBody>
            <SectionHead title="Recommendations" />
            <div className="space-y-3">
              {h.recommendations.map((r, i) => (
                <div key={i} className={`rounded-xl border p-4
                  ${r.priority === "high" ? "bg-red-500/10 border-red-500/20" : "bg-amber-500/10 border-amber-500/20"}`}>
                  <p className={`text-[12px] font-bold mb-1 ${r.priority === "high" ? "text-red-400" : "text-amber-400"}`}>
                    {r.priority === "high" ? "🔴" : "🟡"} {r.action}
                  </p>
                  <p className="text-[11px] text-white/30">{r.reason}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <div className="text-center text-[11px] text-white/20">
        Next scheduled maintenance: <b className="text-white/40">{h.next_scheduled_maintenance}</b>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  TRENDS PANEL
// ─────────────────────────────────────────────
const TrendsPanel = ({ schoolId }) => {
  const METRICS = [
    { value: "students",        label: "Students",        fmt: fmt.num,   color: CHART_COLORS.primary },
    { value: "revenue",         label: "Revenue",         fmt: fmt.money, color: CHART_COLORS.emerald },
    { value: "completion_rate", label: "Completion Rate", fmt: fmt.pct,   color: CHART_COLORS.violet  },
    { value: "rating",          label: "Avg Rating",      fmt: fmt.rating,color: CHART_COLORS.amber   },
  ];
  const DAYS_OPTS = [7, 14, 30, 60, 90];

  const [metric, setMetric] = useState("students");
  const [days,   setDays  ] = useState(30);

  const { data, loading, error } = useTrends(schoolId, metric, days);
  const t = data ?? MOCK_TRENDS;
  const tData = t.trend_data ?? [];
  const summary = t.summary ?? {};
  const m = METRICS.find(x => x.value === metric);

  const dataKey = metric === "students" ? "active_students"
    : metric === "revenue" ? "revenue"
    : metric === "completion_rate" ? "completion_rate"
    : "average_rating";

    return (
    <div className="space-y-5">
      <SectionHead title="Trends Analysis" sub="Historical data across key metrics" />

      {/* Controls */}
      <Card>
        <CardBody className="flex flex-wrap items-center gap-4">
          <div className="flex gap-1 flex-wrap">
            {METRICS.map(met => (
              <Tab key={met.value} active={metric === met.value} onClick={() => setMetric(met.value)}>
                {met.label}
              </Tab>
            ))}
          </div>
          <div className="flex gap-1 ml-auto">
            {DAYS_OPTS.map(d => (
              <button key={d} onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors
                  ${days === d ? "bg-white/10 text-white" : "text-white/30 hover:text-white"}`}>
                {d}d
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {error && <ErrorBanner msg={error} />}

      {/* Summary row */}
      {metric === "students" && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Current Total",    value: fmt.num(summary.current_total) },
            { label: "Current Active",   value: fmt.num(summary.current_active) },
            { label: "New Students",     value: fmt.num(summary.total_new_students) },
            { label: "Avg Active",       value: fmt.num(Math.round(summary.average_active)) },
          ].map(s => <StatCard key={s.label} {...s} accent={CHART_COLORS.primary} />)}
        </div>
      )}
      {metric === "revenue" && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Revenue",  value: fmt.money(summary.total_revenue) },
            { label: "Daily Average",  value: fmt.money(Math.round(summary.average_daily_revenue)) },
            { label: "Peak Day",       value: fmt.money(summary.highest_revenue) },
            { label: "Lowest Day",     value: fmt.money(summary.lowest_revenue) },
          ].map(s => <StatCard key={s.label} {...s} accent={CHART_COLORS.emerald} />)}
        </div>
      )}
      {metric === "completion_rate" && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Current Rate",  value: fmt.pct(summary.current_rate) },
            { label: "Average",       value: fmt.pct(summary.average_rate) },
            { label: "Peak Rate",     value: fmt.pct(summary.highest_rate) },
            { label: "Lowest Rate",   value: fmt.pct(summary.lowest_rate) },
          ].map(s => <StatCard key={s.label} {...s} accent={CHART_COLORS.violet} />)}
        </div>
      )}
      {metric === "rating" && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Current Rating", value: fmt.rating(summary.current_rating) },
            { label: "Average",        value: fmt.rating(summary.average_rating) },
            { label: "Highest",        value: fmt.rating(summary.highest_rating) },
            { label: "Lowest",         value: fmt.rating(summary.lowest_rating) },
          ].map(s => <StatCard key={s.label} {...s} accent={CHART_COLORS.amber} />)}
        </div>
      )}

      {/* Main chart */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[13px] font-bold text-white">{m?.label} over {days} days</p>
              <p className="text-[11px] text-white/30 mt-0.5">{t.period?.start_date} → {t.period?.end_date} · {t.data_points} data points</p>
            </div>
            {loading && <Spinner />}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={tData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`trendGrad_${metric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={m?.color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={m?.color} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="date" tickFormatter={s => s.slice(5)} tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<ChartTip fmt={m?.fmt} />} />
              <Area type="monotone" dataKey={dataKey} stroke={m?.color} strokeWidth={2}
                fill={`url(#trendGrad_${metric})`} dot={false} activeDot={{ r: 4, fill: m?.color }} />
              {metric === "students" && (
                <Area type="monotone" dataKey="total_students" stroke={CHART_COLORS.violet} strokeWidth={1.5}
                  fill="none" strokeDasharray="4 2" dot={false} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────
//  SUMMARY PANEL
// ─────────────────────────────────────────────
const SummaryPanel = () => {
  const { data, loading, error } = useSummary();
  const s = data ?? MOCK_SUMMARY;
  const overall = s.overall_stats ?? {};
  const schools = s.school_summaries ?? [];

  return (
    <div className="space-y-5">
      <SectionHead title="Multi-School Summary" sub="Overview across all your schools" />

      {error && <ErrorBanner msg={error} />}

      {/* Overall KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Students"    value={fmt.num(overall.total_students)}    accent={CHART_COLORS.primary} icon="👥" loading={loading} />
        <StatCard label="Total Revenue"     value={fmt.money(overall.total_revenue)}   accent={CHART_COLORS.emerald} icon="💰" loading={loading} />
        <StatCard label="Avg Completion"    value={fmt.pct(overall.average_completion_rate)} accent={CHART_COLORS.violet} icon="✅" loading={loading} />
      </div>

      {/* School cards */}
      <div className="grid grid-cols-2 gap-4">
        {schools.map((sc) => (
          <Card key={sc.school_id} glow>
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[13px] font-bold text-white">{sc.school_name}</p>
                  {sc.new_students > 0 && (
                    <span className="text-[10px] text-emerald-400">+{sc.new_students} new students</span>
                  )}
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg
                  ${sc.completion_rate >= 70 ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                  {fmt.pct(sc.completion_rate)} complete
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total",   val: fmt.num(sc.total_students)  },
                  { label: "Active",  val: fmt.num(sc.active_students) },
                  { label: "Revenue", val: fmt.money(sc.revenue)       },
                ].map(x => (
                  <div key={x.label} className="bg-white/[0.03] rounded-xl p-3 text-center">
                    <p className="text-[14px] font-bold text-white">{x.val}</p>
                    <p className="text-[10px] text-white/25 mt-0.5">{x.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${sc.completion_rate}%`, background: sc.completion_rate >= 70 ? CHART_COLORS.emerald : CHART_COLORS.amber }} />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Best performer highlight */}
      {s.best_performing_school && (
        <Card>
          <CardBody className="flex items-center gap-4 bg-emerald-500/[0.04]">
            <span className="text-3xl">🏆</span>
            <div>
              <p className="text-[11px] text-white/30 uppercase tracking-wider">Best Performing School</p>
              <p className="text-[15px] font-bold text-white mt-0.5">{s.best_performing_school.school_name}</p>
              <p className="text-[12px] text-emerald-400 mt-0.5">{fmt.pct(s.best_performing_school.completion_rate)} completion rate</p>
            </div>
            {s.highest_revenue_school && (
              <>
                <div className="w-px h-12 bg-white/[0.06] mx-2" />
                <span className="text-3xl">💰</span>
                <div>
                  <p className="text-[11px] text-white/30 uppercase tracking-wider">Highest Revenue</p>
                  <p className="text-[15px] font-bold text-white mt-0.5">{s.highest_revenue_school.school_name}</p>
                  <p className="text-[12px] text-blue-400 mt-0.5">{fmt.money(s.highest_revenue_school.revenue)}</p>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────
const TABS = [
  { id: "overview",     label: "Overview"    },
  { id: "trends",       label: "Trends"      },
  { id: "instructors",  label: "Instructors" },
  { id: "students",     label: "Students"    },
  { id: "summary",      label: "Summary"     },
  { id: "comparison",   label: "Comparison"  },
  { id: "alerts",       label: "Alerts"      },
  { id: "system",       label: "System"      },
];

const RANGE_OPTS = [
  { value: "today",   label: "Today"   },
  { value: "week",    label: "Week"    },
  { value: "month",   label: "Month"   },
  { value: "year",    label: "Year"    },
];

const HORIZON_OPTS = [
  { value: "week",    label: "7d"  },
  { value: "month",   label: "30d" },
  { value: "quarter", label: "90d" },
];

const AnalyticsPage = () => {
  const [range, setRange]       = useState("month");
  const [horizon, setHorizon]   = useState("month");
  const [activeTab, setActiveTab] = useState("overview");
  const [showBulk, setShowBulk] = useState(false);
  const [toast, setToast]       = useState(null);

  const { data: schools, loading: schoolsLoading } = useSchools();
  const [schoolId, setSchoolId] = useState(null);

  // useEffect hook
  useEffect(() => {
    if (schools && schools.length > 0 && !schoolId) {
      setSchoolId(schools[0]?.id);
    }
  }, [schools, schoolId]);


  // ── Data ─────────────────────────────────────────────────────
  // Then use schoolId in all your hooks
  // These hooks are conditionally called - THIS IS THE PROBLEM!
  const { data: dash,   loading: dashLoading } = useDashboard(schoolId, range);
  const { data: alerts, refetch: refetchAlerts } = useAlerts(schoolId, 7);
  const { data: preds } = usePredictions(schoolId, horizon);
  const { generate, exportData, bulkGen, saving, error: mutErr, clearError, lastResult } = useAnalyticsMutations();

  if (schoolsLoading) {
    return <div className="flex h-screen bg-[#060B18] items-center justify-center text-white/40 text-sm">Loading…</div>;
  }

  if (!schoolId) {
    return <div className="flex h-screen bg-[#060B18] items-center justify-center text-white/40 text-sm">No schools found.</div>;
  }
  // Fallback to mock
  const d  = dash   ?? MOCK_DASHBOARD;
  const al  = alerts ?? MOCK_ALERTS;
  const pr  = preds  ?? MOCK_PREDICTIONS;

  const metrics    = d.current_metrics ?? {};
  const lessons    = d.lessons         ?? {};
  const revenue    = d.revenue         ?? {};
  const students   = d.students        ?? {};
  const revTrend   = revenue.trend     ?? [];
  const studTrend  = students.trend    ?? [];
  const topStuds   = students.top_performers ?? [];
  const instructors= d.instructors     ?? [];
  const recentFeed = d.recent_feedback ?? [];

  const alertsHigh = al.alerts_by_severity?.high   ?? [];
  const alertsMed  = al.alerts_by_severity?.medium  ?? [];
  const alertsLow  = al.alerts_by_severity?.low     ?? [];
  const allAlerts  = [...alertsHigh, ...alertsMed, ...alertsLow];

  const health     = al.overall_health ?? {};
  const hc         = healthColor[health.status] ?? healthColor.needs_attention;

  const predVals   = pr.predicted_metrics?.values           ?? {};
  const predDirs   = pr.predicted_metrics?.trend_directions ?? {};
  const recs       = pr.recommendations ?? [];

  // ── Toast helper ─────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Handlers ─────────────────────────────────────────────────
  const handleGenerate = async () => {
    try {
      await generate(SCHOOL_ID);
      showToast("Daily analytics generated successfully");
      refetchAlerts();
    } catch {}
  };

  const handleExport = async () => {
    try {
      const res = await exportData(SCHOOL_ID, null, null, "json");
      const blob = new Blob([JSON.stringify(res, null, 2)], { type: "application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `analytics_${SCHOOL_ID}_${new Date().toISOString().slice(0,10)}.json`;
      a.click(); URL.revokeObjectURL(url);
      showToast("Export downloaded");
    } catch {}
  };

  const handleBulk = async (payload) => {
    try {
      const res = await bulkGen(payload);
      setShowBulk(false);
      showToast(`Generated ${res.summary?.records_generated ?? 0} records`);
    } catch {}
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#060B18] overflow-hidden font-sans">
      <Sidebar />
      {/* Sidebar placeholder — import your actual Sidebar */}
      {/* <Sidebar /> */}

      <main className="flex-1 flex flex-col overflow-hidden">

        {/* ── Topbar ───────────────────────────────────────────── */}
        <header className="flex items-center justify-between px-6 py-3.5
          border-b border-white/[0.06] bg-[#0B1221] flex-shrink-0">
          <div>
            <h1 className="text-[16px] font-black text-white tracking-tight">Analytics</h1>
            <p className="text-[11px] text-white/30 mt-0.5">
              {d.school?.name ?? "Your School"} · {d.period?.start_date ?? "—"} – {d.period?.end_date ?? "—"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Range selector */}
            <div className="flex items-center gap-0.5 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
              {RANGE_OPTS.map(o => (
                <Tab key={o.value} active={range === o.value} onClick={() => setRange(o.value)}>{o.label}</Tab>
              ))}
            </div>

            {/* Horizon (for predictions) */}
            <div className="flex items-center gap-0.5 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
              {HORIZON_OPTS.map(o => (
                <Tab key={o.value} active={horizon === o.value} onClick={() => setHorizon(o.value)}>{o.label}</Tab>
              ))}
            </div>

            <button onClick={() => setShowBulk(true)}
              className="px-3 py-2 rounded-lg border border-white/[0.08] text-[11px] text-white/40 hover:text-white hover:border-white/20 transition-colors">
              Bulk Gen
            </button>

            <button onClick={handleGenerate} disabled={saving}
              className="px-3 py-2 rounded-lg border border-white/[0.08] text-[12px] text-white/40 hover:text-white hover:border-white/20 transition-colors disabled:opacity-40 flex items-center gap-2">
              {saving && <Spinner />} Generate
            </button>

            <button onClick={handleExport} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500
                text-[13px] font-bold text-white transition-colors disabled:opacity-40">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v7M3 5l3 4 3-4M1 10h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export
            </button>
          </div>
        </header>

        {/* ── Tab bar ──────────────────────────────────────────── */}
        <div className="flex items-center gap-1 px-6 py-2.5 border-b border-white/[0.04] bg-[#0B1221] flex-shrink-0 overflow-x-auto">
          {TABS.map(t => (
            <Tab key={t.id} active={activeTab === t.id} onClick={() => setActiveTab(t.id)}
              badge={t.id === "alerts" ? allAlerts.length : 0}>
              {t.label}
            </Tab>
          ))}
        </div>

        {/* ── Mutation error ─────────────────────────────────── */}
        {mutErr && (
          <div className="px-6 pt-3 flex-shrink-0">
            <ErrorBanner msg={mutErr} onDismiss={clearError} />
          </div>
        )}

        {/* ── Content ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ══════════════════════════════════════════════════
              OVERVIEW
          ══════════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <>
              {/* KPI row */}
              <div className="grid grid-cols-4 gap-4">
                <StatCard label="Total Students"   value={fmt.num(metrics.total_students)}          sub={`${metrics.active_students ?? 0} active`}         delta={8} deltaLabel="this period" accent={CHART_COLORS.primary} loading={dashLoading} icon="👥" />
                <StatCard label="Completion Rate"  value={fmt.pct(metrics.completion_rate)}         sub={`${lessons.completed ?? 0} / ${lessons.total ?? 0} lessons`}                         accent={CHART_COLORS.emerald} loading={dashLoading} icon="✅" />
                <StatCard label="Avg Rating"       value={fmt.rating(metrics.average_rating)}       sub="student feedback"                                                                     accent={CHART_COLORS.amber}   loading={dashLoading} icon="⭐" />
                <StatCard label="Instructor Load"  value={fmt.pct(metrics.instructor_utilization)}  sub={`${metrics.total_instructors ?? 0} instructors`}                                      accent={CHART_COLORS.violet}  loading={dashLoading} icon="🎓" />
              </div>

              {/* Revenue + Health */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="col-span-2">
                  <CardBody>
                    <SectionHead title="Revenue Trend"
                      sub={`Total: ${fmt.money(revenue.total)}`}
                      action={<Pill color="blue">30d</Pill>} />
                    <ResponsiveContainer width="100%" height={150}>
                      <AreaChart data={revTrend} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}   />
                          </linearGradient>
                        </defs>
                        <CartesianGrid {...gridStyle} />
                        <XAxis dataKey="date" tickFormatter={s => s.slice(5)} tick={axisStyle} />
                        <YAxis tick={axisStyle} />
                        <Tooltip content={<ChartTip fmt={fmt.money} />} />
                        <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS.primary}
                          strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>

                {/* Health */}
                <Card>
                  <CardBody className={hc.bg}>
                    <p className="text-[13px] font-bold text-white mb-1">School Health</p>
                    <div className="flex items-end gap-1 mb-2">
                      <span className="text-[44px] font-black text-white leading-none">{health.score ?? 74}</span>
                      <span className={`text-[14px] font-bold mb-2 ${hc.cls}`}>/100</span>
                    </div>
                    <div className="h-2 bg-black/30 rounded-full overflow-hidden mb-3">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${health.score ?? 74}%`, background: hc.bar }} />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${hc.bg} ${hc.cls}`}>
                      {hc.label}
                    </span>
                    <div className="mt-4 space-y-2">
                      {[
                        { label: "High",   count: alertsHigh.length, cls: "text-red-400"   },
                        { label: "Medium", count: alertsMed.length,  cls: "text-amber-400" },
                        { label: "Low",    count: alertsLow.length,  cls: "text-blue-400"  },
                      ].map(r => (
                        <div key={r.label} className="flex items-center justify-between">
                          <span className="text-[11px] text-white/30">{r.label} severity</span>
                          <span className={`text-[11px] font-bold ${r.cls}`}>{r.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Students trend + Lessons */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardBody>
                    <SectionHead title="Active Students" sub={`Rolling ${range} view`} />
                    <ResponsiveContainer width="100%" height={130}>
                      <LineChart data={studTrend} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                        <CartesianGrid {...gridStyle} />
                        <XAxis dataKey="date" tickFormatter={s => s.slice(5)} tick={axisStyle} />
                        <YAxis tick={axisStyle} />
                        <Tooltip content={<ChartTip fmt={fmt.num} />} />
                        <Line type="monotone" dataKey="active_students" stroke={CHART_COLORS.emerald}
                          strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                        <Line type="monotone" dataKey="new_students" stroke={CHART_COLORS.violet}
                          strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                        <Legend wrapperStyle={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <SectionHead title="Lesson Breakdown" />
                    <div className="space-y-4">
                      <HBar label="Completed"      value={lessons.completed ?? 0}  max={lessons.total ?? 100} color={CHART_COLORS.emerald} />
                      <HBar label="Scheduled"      value={lessons.scheduled ?? 0}  max={lessons.total ?? 100} color={CHART_COLORS.primary} />
                      <HBar label="Completion %"   value={+(lessons.completion_rate ?? 0).toFixed(1)} max={100} color={CHART_COLORS.violet} suffix="%" />
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/[0.04] flex justify-between">
                      <span className="text-[11px] text-white/30">Total lessons</span>
                      <span className="text-[15px] font-bold text-white">{fmt.num(lessons.total)}</span>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Predictions */}
              <Card>
                <CardBody>
                  <SectionHead title="AI Predictions"
                    sub={`Confidence: ${pr.predicted_metrics?.confidence ?? "—"} · Horizon: ${horizon}`}
                    action={<Pill color="violet">AI Forecast</Pill>} />
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <PredRow label="Total Students"  current={fmt.num(pr.current_metrics?.total_students)}  predicted={fmt.num(predVals.total_students)}  dir={predDirs.student_trend} />
                      <PredRow label="Active Students" current={fmt.num(pr.current_metrics?.active_students)} predicted={fmt.num(predVals.active_students)} dir={predDirs.student_trend} />
                      <PredRow label="Revenue"         current={fmt.money(pr.current_metrics?.revenue)}       predicted={fmt.money(predVals.revenue)}       dir={predDirs.revenue_trend} />
                      <PredRow label="Completion Rate" current={fmt.pct(pr.current_metrics?.completion_rate)} predicted={fmt.pct(predVals.completion_rate)} dir={predDirs.completion_trend} />

                      {/* Trend analysis micro-stats */}
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {[
                          { label: "Students/day", val: pr.trend_analysis?.student_growth_per_day?.toFixed(2) },
                          { label: "Revenue/day",  val: fmt.money(pr.trend_analysis?.revenue_growth_per_day) },
                          { label: "Rate/day",     val: `+${(pr.trend_analysis?.completion_change_per_day ?? 0).toFixed(3)}%` },
                        ].map(x => (
                          <div key={x.label} className="bg-white/[0.03] rounded-xl p-2.5 text-center">
                            <p className="text-[12px] font-bold text-white">{x.val}</p>
                            <p className="text-[10px] text-white/25 mt-0.5">{x.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white/30 uppercase tracking-wider mb-3">Recommendations</p>
                      <div className="space-y-3">
                        {recs.map((r, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0
                              ${r.priority === "high" ? "bg-red-400" : r.priority === "medium" ? "bg-amber-400" : "bg-blue-400"}`} />
                            <div>
                              <p className="text-[12px] font-semibold text-white/70">{r.title}</p>
                              <p className="text-[11px] text-white/30 mt-0.5">{r.action}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {pr.notes && (
                        <div className="mt-4 p-3 bg-white/[0.03] rounded-xl space-y-1">
                          {pr.notes.map((n, i) => <p key={i} className="text-[10px] text-white/20 italic">{n}</p>)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Recent Feedback */}
              {recentFeed.length > 0 && (
                <Card>
                  <CardBody>
                    <SectionHead title="Recent Feedback" />
                    <div className="space-y-0">
                      {recentFeed.map((fb) => (
                        <div key={fb.id} className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-0">
                          <div className="w-8 h-8 rounded-full bg-violet-700/50 flex items-center justify-center text-[11px] font-bold text-violet-300 flex-shrink-0">
                            {fb.student?.charAt(0) ?? "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[12px] font-semibold text-white">{fb.student}</p>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Stars rating={fb.rating} />
                                <span className="text-[11px] font-bold text-amber-400">{fb.rating}.0</span>
                              </div>
                            </div>
                            <p className="text-[11px] text-white/30">{fb.lesson}</p>
                            {fb.comment && <p className="text-[11px] text-white/50 mt-1 italic">"{fb.comment}"</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}
            </>
          )}

          {/* ══════════════════════════════════════════════════
              TRENDS
          ══════════════════════════════════════════════════ */}
          {activeTab === "trends" && <TrendsPanel schoolId={schoolId} />}


          {/* ══════════════════════════════════════════════════
              INSTRUCTORS
          ══════════════════════════════════════════════════ */}
          {activeTab === "instructors" && (
            <>
              <SectionHead title="Instructor Performance" sub="Lessons taught, ratings & team utilization" />
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardBody>
                    <SectionHead title="Lessons Taught" />
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={instructors} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                        <CartesianGrid {...gridStyle} horizontal={false} />
                        <XAxis type="number" tick={axisStyle} />
                        <YAxis type="category" dataKey="name" tick={{ ...axisStyle, fontSize: 11 }} width={130} />
                        <Tooltip content={<ChartTip fmt={fmt.num} />} />
                        <Bar dataKey="lessons_taught" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <SectionHead title="Ratings" />
                    <div className="space-y-3">
                      {instructors.map((ins) => (
                        <div key={ins.id} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-700/40 flex items-center justify-center text-[10px] font-bold text-blue-300 flex-shrink-0">
                              {ins.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-[12px] font-semibold text-white">{ins.name}</p>
                              <p className="text-[10px] text-white/30">{ins.lessons_taught} lessons</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Stars rating={ins.average_rating} />
                            <span className="text-[12px] font-bold text-amber-400">{fmt.rating(ins.average_rating)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>

              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[13px] font-bold text-white">Team Utilization</p>
                    <span className="text-[18px] font-black text-white">{fmt.pct(metrics.instructor_utilization)}</span>
                  </div>
                  <div className="h-3 bg-white/[0.05] rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${metrics.instructor_utilization ?? 0}%`,
                        background: (metrics.instructor_utilization ?? 0) >= 80 ? CHART_COLORS.emerald
                          : (metrics.instructor_utilization ?? 0) >= 60 ? CHART_COLORS.amber : CHART_COLORS.red,
                      }} />
                  </div>
                  <p className="text-[11px] text-white/30">
                    {(metrics.instructor_utilization ?? 0) >= 80
                      ? "High capacity — consider expanding the team."
                      : (metrics.instructor_utilization ?? 0) >= 60
                      ? "Moderate utilization — room to grow student intake."
                      : "Low utilization — review and optimize schedules."}
                  </p>
                </CardBody>
              </Card>
            </>
          )}

          {/* ══════════════════════════════════════════════════
              STUDENTS
          ══════════════════════════════════════════════════ */}
          {activeTab === "students" && (
            <>
              <SectionHead title="Student Analytics" sub="Progress, performance & enrollment" />
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Total"     value={fmt.num(metrics.total_students)}     accent={CHART_COLORS.primary} icon="👥" />
                <StatCard label="Active"    value={fmt.num(metrics.active_students)}    accent={CHART_COLORS.emerald} icon="🟢" />
                <StatCard label="Completed" value={fmt.num(metrics.completed_students)} accent={CHART_COLORS.violet}  icon="🎉" />
              </div>

              {/* Top performers */}
              <Card>
                <CardBody>
                  <SectionHead title="Top Performers" sub="By overall completion percentage" />
                  <div className="space-y-0">
                    {topStuds.map((s, i) => (
                      <div key={s.id} className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0">
                        <span className={`text-[14px] font-black w-6 text-center flex-shrink-0
                          ${i === 0 ? "text-amber-400" : i === 1 ? "text-white/40" : "text-white/20"}`}>
                          #{i+1}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-emerald-700/40 flex items-center justify-center text-[10px] font-bold text-emerald-300 flex-shrink-0">
                          {s.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-white truncate">{s.name}</p>
                          <p className="text-[10px] text-white/30">{s.total_hours}h total</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0 min-w-[120px]">
                          <span className="text-[12px] font-bold text-white">{fmt.pct(s.completion_percentage)}</span>
                          <div className="w-28 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${s.completion_percentage}%`,
                                background: s.completion_percentage >= 80 ? CHART_COLORS.emerald
                                  : s.completion_percentage >= 50 ? CHART_COLORS.amber : CHART_COLORS.red,
                              }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Enrollment trend */}
              <Card>
                <CardBody>
                  <SectionHead title="Enrollment Trend" sub="Active vs new students — last 30 days" />
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={studTrend} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="stuGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={CHART_COLORS.emerald} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={CHART_COLORS.emerald} stopOpacity={0}    />
                        </linearGradient>
                      </defs>
                      <CartesianGrid {...gridStyle} />
                      <XAxis dataKey="date" tickFormatter={s => s.slice(5)} tick={axisStyle} />
                      <YAxis tick={axisStyle} />
                      <Tooltip content={<ChartTip fmt={fmt.num} />} />
                      <Area type="monotone" dataKey="active_students" stroke={CHART_COLORS.emerald}
                        strokeWidth={2} fill="url(#stuGrad)" dot={false} />
                      <Line type="monotone" dataKey="new_students" stroke={CHART_COLORS.amber}
                        strokeWidth={1.5} dot={false} />
                      <Legend wrapperStyle={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </>
          )}

          {/* ══════════════════════════════════════════════════
              SUMMARY
          ══════════════════════════════════════════════════ */}
          {activeTab === "summary" && <SummaryPanel />}

          {/* ══════════════════════════════════════════════════
              COMPARISON
          ══════════════════════════════════════════════════ */}
          {activeTab === "comparison" && <ComparisonPanel />}

          {/* ══════════════════════════════════════════════════
              ALERTS
          ══════════════════════════════════════════════════ */}
          {activeTab === "alerts" && (
            <>
              <SectionHead title="Alerts & Recommendations" sub="Issues requiring your attention"
                action={<button onClick={refetchAlerts} className="text-[11px] text-white/30 hover:text-white px-3 py-1.5 rounded-lg border border-white/[0.06] hover:border-white/20 transition-colors">Refresh</button>} />

              {/* Health overview */}
              <Card>
                <CardBody className={`flex items-center gap-6 ${hc.bg}`}>
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Overall Health</p>
                    <p className="text-[44px] font-black text-white leading-none">{health.score ?? 74}</p>
                    <p className={`text-[12px] font-bold mt-1 ${hc.cls}`}>{hc.label}</p>
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    {[
                      { label: "Immediate", count: al.summary?.needs_immediate_attention ?? 0, cls: "text-red-400",   bg: "bg-red-500/10"   },
                      { label: "Address",   count: al.summary?.should_be_addressed ?? 0,       cls: "text-amber-400", bg: "bg-amber-500/10" },
                      { label: "Info",      count: al.summary?.for_information ?? 0,            cls: "text-blue-400",  bg: "bg-blue-500/10"  },
                    ].map(s => (
                      <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                        <p className={`text-[26px] font-black ${s.cls}`}>{s.count}</p>
                        <p className="text-[10px] text-white/25 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {alertsHigh.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-2">🔴 High Severity</p>
                  <div className="space-y-2">{alertsHigh.map((a, i) => <AlertBadge key={i} alert={a} sev="high" />)}</div>
                </div>
              )}
              {alertsMed.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2">🟡 Medium Severity</p>
                  <div className="space-y-2">{alertsMed.map((a, i) => <AlertBadge key={i} alert={a} sev="medium" />)}</div>
                </div>
              )}
              {alertsLow.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-2">🔵 Info</p>
                  <div className="space-y-2">{alertsLow.map((a, i) => <AlertBadge key={i} alert={a} sev="low" />)}</div>
                </div>
              )}
              {allAlerts.length === 0 && (
                <EmptyState icon="✅" title="All clear" sub="No alerts detected for this period." />
              )}
            </>
          )}

          {/* ══════════════════════════════════════════════════
              SYSTEM
          ══════════════════════════════════════════════════ */}
          {activeTab === "system" && <SystemHealthPanel />}

        </div>{/* end scrollable */}
      </main>

      {/* ── Bulk modal ───────────────────────────────────────── */}
      {showBulk && <BulkModal onClose={() => setShowBulk(false)} onSubmit={handleBulk} saving={saving} />}

      {/* ── Toast ────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl
          border shadow-2xl text-[13px] font-semibold animate-slide-up
          ${toast.type === "success"
            ? "bg-emerald-900/90 border-emerald-500/30 text-emerald-200"
            : "bg-red-900/90 border-red-500/30 text-red-200"}`}>
          <span>{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;