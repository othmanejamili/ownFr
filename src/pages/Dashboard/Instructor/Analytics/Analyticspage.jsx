// ─────────────────────────────────────────────
//  InstructorAnalyticsPage.jsx
//  Route: /dashboard/owner/analytics
//  Uses: ALL schoolanalytics endpoints
//  Tabs: Overview · Trends · Instructors
//        Students · Comparison · Alerts · System
// ─────────────────────────────────────────────
import React, { useState, useCallback, useMemo, useEffect } from "react";
import Sidebar from '../Dashboard/Sidebar';
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
//  MAIN PAGE
// ─────────────────────────────────────────────
const TABS = [
  { id: "overview",     label: "Overview"    },

];

const RANGE_OPTS = [
  { value: "month",   label: "Month"   },
];

const HORIZON_OPTS = [
  { value: "month",   label: "30d" },
];

const InstructorAnalyticsPage = () => {
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

  const metrics    = d.current_metrics ?? {};
  const lessons    = d.lessons         ?? {};
  const revenue    = d.revenue         ?? {};
  const students   = d.students        ?? {};
  const revTrend   = revenue.trend     ?? [];
  const studTrend  = students.trend    ?? [];

  const recentFeed = d.recent_feedback ?? [];

  const alertsHigh = al.alerts_by_severity?.high   ?? [];
  const alertsMed  = al.alerts_by_severity?.medium  ?? [];
  const alertsLow  = al.alerts_by_severity?.low     ?? [];
  const allAlerts  = [...alertsHigh, ...alertsMed, ...alertsLow];

  const health     = al.overall_health ?? {};
  const hc         = healthColor[health.status] ?? healthColor.needs_attention;



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

        </div>{/* end scrollable */}
      </main>


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

export default InstructorAnalyticsPage;