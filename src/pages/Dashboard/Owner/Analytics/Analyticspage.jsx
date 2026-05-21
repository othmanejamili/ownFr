// ─────────────────────────────────────────────
//  AnalyticsPage.jsx
//  Route: /dashboard/owner/analytics
//  Uses: analyticsApi.js, useAnalytics.js,
//        analyticsUtils.js, StatCard.jsx
// ─────────────────────────────────────────────
import React, { useState } from 'react';
import Sidebar from '../Sidebar'; // adjust to your actual Sidebar path

import {
  useDashboard,
  useAlerts,
  usePredictions,
  useSummary,
  useAnalyticsMutations,
} from './Useanalytics';

import StatCard from './Statcard';

import {
  fmt,
  severityColor,
  trendDir,
  healthColor,
  CHART_COLORS,
  MOCK_DASHBOARD,
  MOCK_ALERTS,
  MOCK_PREDICTIONS,
} from './Analyticsutils';

// ─────────────────────────────────────────────
//  Mini helpers
// ─────────────────────────────────────────────

const RANGE_OPTIONS = [
  { value: 'week',    label: 'Week'  },
  { value: 'month',   label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year',    label: 'Year'  },
];

const SectionHeading = ({ title, sub }) => (
  <div className="mb-4">
    <h2 className="text-[14px] font-bold text-white">{title}</h2>
    {sub && <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>}
  </div>
);

// ── Tiny sparkline (pure CSS bar chart) ──────────────────────────
const SparkBars = ({ data = [], color = '#3b82f6' }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[2px] h-10">
      {data.slice(-20).map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all duration-300"
          style={{
            height: `${Math.max(4, (v / max) * 40)}px`,
            background: color,
            opacity: 0.3 + (i / 20) * 0.7,
          }}
        />
      ))}
    </div>
  );
};

// ── Revenue trend chart (lightweight SVG line) ─────────────────
const LineChart = ({ data = [], color = '#3b82f6', height = 120 }) => {
  if (!data.length) return null;
  const vals   = data.map((d) => d.revenue ?? d.value ?? d.active_students ?? 0);
  const max    = Math.max(...vals, 1);
  const min    = Math.min(...vals, 0);
  const range  = max - min || 1;
  const W      = 600;
  const H      = height;
  const pts    = vals.map((v, i) => [
    (i / (vals.length - 1)) * W,
    H - ((v - min) / range) * H * 0.85 - H * 0.075,
  ]);
  const pathD  = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const areaD  = `${pathD} L${W},${H} L0,${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad_${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0"   />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad_${color.replace('#','')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) =>
        i === pts.length - 1 ? (
          <circle key={i} cx={x} cy={y} r="3.5" fill={color} />
        ) : null
      )}
    </svg>
  );
};

// ── Horizontal bar ────────────────────────────────────────────
const HBar = ({ label, value, max = 100, color = '#3b82f6', suffix = '' }) => (
  <div className="group">
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[12px] text-white/60 truncate max-w-[60%]">{label}</span>
      <span className="text-[12px] font-bold text-white">
        {value}{suffix}
      </span>
    </div>
    <div className="h-[5px] bg-white/[0.05] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }}
      />
    </div>
  </div>
);

// ── Star rating ───────────────────────────────────────────────
const Stars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg key={s} width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path
          d="M5 1l1.1 3H9L6.5 5.8l1 3L5 7 2.5 8.8l1-3L1 4h2.9z"
          fill={s <= Math.round(rating) ? '#f59e0b' : 'rgba(255,255,255,0.1)'}
        />
      </svg>
    ))}
  </div>
);

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
          {alert.suggestion && (
            <p className="text-[11px] text-white/25 mt-1.5 italic">{alert.suggestion}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Prediction metric row ─────────────────────────────────────
const PredRow = ({ label, current, predicted, dir }) => {
  const { icon, cls } = trendDir(dir);
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
      <span className="text-[12px] text-white/40">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-[12px] text-white/30">{current}</span>
        <span className="text-white/15 text-[10px]">→</span>
        <span className="text-[13px] font-bold text-white">{predicted}</span>
        <span className={`text-[12px] font-bold ${cls}`}>{icon}</span>
      </div>
    </div>
  );
};

// ── Tab button ────────────────────────────────────────────────
const Tab = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors
      ${active
        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
        : 'text-white/30 hover:text-white hover:bg-white/[0.04]'
      }`}
  >
    {children}
  </button>
);

// ─────────────────────────────────────────────
//  Main page
// ─────────────────────────────────────────────

// TODO: replace with your actual auth context / school selector
const SCHOOL_ID = 1;

const AnalyticsPage = () => {
  const [range,     setRange]     = useState('month');
  const [activeTab, setActiveTab] = useState('overview'); // overview | instructors | students | alerts

  // ── Data ─────────────────────────────────────────────────────
  const { data: dash,  loading: dashLoading  } = useDashboard(SCHOOL_ID, range);
  const { data: alerts                        } = useAlerts(SCHOOL_ID, 7);
  const { data: preds                         } = usePredictions(SCHOOL_ID, 'month');
  const { generate, exportData, saving        } = useAnalyticsMutations();

  // Fallback to mock when API hasn't responded yet
  const d  = dash   ?? MOCK_DASHBOARD;
  const al = alerts ?? MOCK_ALERTS;
  const pr = preds  ?? MOCK_PREDICTIONS;

  const metrics  = d.current_metrics ?? {};
  const lessons  = d.lessons         ?? {};
  const revenue  = d.revenue         ?? {};
  const students = d.students        ?? {};

  const revTrend     = revenue.trend     ?? [];
  const studTrend    = students.trend    ?? [];
  const topStudents  = students.top_performers ?? [];
  const instructors  = d.instructors    ?? [];
  const recentFeed   = d.recent_feedback ?? [];

  const alertsHigh   = al.alerts_by_severity?.high   ?? [];
  const alertsMed    = al.alerts_by_severity?.medium  ?? [];
  const alertsLow    = al.alerts_by_severity?.low     ?? [];
  const allAlerts    = [...alertsHigh, ...alertsMed, ...alertsLow];

  const health       = al.overall_health ?? {};
  const hc           = healthColor[health.status] ?? healthColor.needs_attention;

  const predVals     = pr.predicted_metrics?.values    ?? {};
  const predDirs     = pr.predicted_metrics?.trend_directions ?? {};
  const recommendations = pr.recommendations ?? [];

  // ── Handlers ─────────────────────────────────────────────────
  const handleGenerate = () => generate(SCHOOL_ID);
  const handleExport   = () => exportData(SCHOOL_ID, null, null, 'json');

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#060B18] overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">

        {/* ── Top bar ─────────────────────────────────────────── */}
        <header className="flex items-center justify-between px-6 py-3.5
          border-b border-white/[0.06] bg-[#0B1221] flex-shrink-0">
          <div>
            <h1 className="text-[16px] font-bold text-white">Analytics</h1>
            <p className="text-[11px] text-white/30 mt-0.5">
              {d.school?.name ?? 'Your School'} · {d.period?.start_date ?? ''} – {d.period?.end_date ?? ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Date range selector */}
            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
              {RANGE_OPTIONS.map((o) => (
                <Tab key={o.value} active={range === o.value} onClick={() => setRange(o.value)}>
                  {o.label}
                </Tab>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={saving}
              className="px-3 py-2 rounded-lg border border-white/[0.08] text-[12px]
                text-white/40 hover:text-white hover:border-white/20 transition-colors disabled:opacity-40"
            >
              {saving ? 'Generating…' : 'Generate'}
            </button>

            <button
              onClick={handleExport}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500
                text-[13px] font-semibold text-white transition-colors disabled:opacity-40"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v7M3 5l3 4 3-4M1 10h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Export
            </button>
          </div>
        </header>

        {/* ── View tabs ────────────────────────────────────────── */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-white/[0.04] bg-[#0B1221] flex-shrink-0">
          {['overview', 'instructors', 'students', 'alerts'].map((t) => (
            <Tab key={t} active={activeTab === t} onClick={() => setActiveTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'alerts' && allAlerts.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-500/20 text-red-400">
                  {allAlerts.length}
                </span>
              )}
            </Tab>
          ))}
        </div>

        {/* ── Scrollable content ───────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ════════════════════════════════════════════════════
              OVERVIEW TAB
          ════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <>
              {/* KPI row */}
              <div className="grid grid-cols-4 gap-4">
                <StatCard
                  label="Total Students"
                  value={fmt.num(metrics.total_students)}
                  sub={`${metrics.active_students ?? 0} active`}
                  delta={metrics.total_students - (metrics.total_students - 8)}
                  deltaLabel="new"
                  accent={CHART_COLORS.primary}
                  loading={dashLoading}
                  icon="👥"
                />
                <StatCard
                  label="Completion Rate"
                  value={fmt.pct(metrics.completion_rate)}
                  sub={`${lessons.completed ?? 0} of ${lessons.total ?? 0} lessons`}
                  accent={CHART_COLORS.emerald}
                  loading={dashLoading}
                  icon="✅"
                />
                <StatCard
                  label="Avg Rating"
                  value={fmt.rating(metrics.average_rating)}
                  sub="student feedback"
                  accent={CHART_COLORS.amber}
                  loading={dashLoading}
                  icon="⭐"
                />
                <StatCard
                  label="Instructor Load"
                  value={fmt.pct(metrics.instructor_utilization)}
                  sub={`${metrics.total_instructors ?? 0} instructors`}
                  accent={CHART_COLORS.violet}
                  loading={dashLoading}
                  icon="🎓"
                />
              </div>

              {/* Revenue chart + Health score */}
              <div className="grid grid-cols-3 gap-4">
                {/* Revenue */}
                <div className="col-span-2 bg-[#0D1828] border border-white/[0.06] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[13px] font-bold text-white">Revenue Trend</p>
                      <p className="text-[11px] text-white/30 mt-0.5">
                        Total: {fmt.money(revenue.total)}
                      </p>
                    </div>
                    <SparkBars
                      data={revTrend.slice(-10).map((r) => r.revenue)}
                      color={CHART_COLORS.primary}
                    />
                  </div>
                  <LineChart data={revTrend} color={CHART_COLORS.primary} height={120} />
                </div>

                {/* Health */}
                <div className={`bg-[#0D1828] border ${hc.bg} border-white/[0.06] rounded-2xl p-5`}>
                  <p className="text-[13px] font-bold text-white mb-1">School Health</p>
                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-[40px] font-bold text-white leading-none">
                      {health.score ?? 74}
                    </span>
                    <span className={`text-[13px] font-bold mb-1 ${hc.cls}`}>
                      / 100
                    </span>
                  </div>
                  {/* Radial-ish bar */}
                  <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${health.score ?? 74}%`, background: hc.bar }}
                    />
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${hc.bg} ${hc.cls}`}>
                    {(health.status ?? 'needs_attention').replace('_', ' ')}
                  </span>
                  <div className="mt-4 space-y-1.5">
                    <p className="text-[10px] text-white/20 uppercase tracking-wider mb-2">Alert summary</p>
                    {[
                      { sev: 'High',   count: alertsHigh.length,  color: 'text-red-400' },
                      { sev: 'Medium', count: alertsMed.length,   color: 'text-amber-400' },
                      { sev: 'Low',    count: alertsLow.length,   color: 'text-blue-400' },
                    ].map((row) => (
                      <div key={row.sev} className="flex items-center justify-between">
                        <span className="text-[11px] text-white/30">{row.sev}</span>
                        <span className={`text-[11px] font-bold ${row.color}`}>{row.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Students trend + Lesson stats */}
              <div className="grid grid-cols-2 gap-4">
                {/* Student trend */}
                <div className="bg-[#0D1828] border border-white/[0.06] rounded-2xl p-5">
                  <p className="text-[13px] font-bold text-white mb-1">Active Students</p>
                  <p className="text-[11px] text-white/30 mb-4">Rolling {range} view</p>
                  <LineChart data={studTrend} color={CHART_COLORS.emerald} height={100} />
                </div>

                {/* Lesson breakdown */}
                <div className="bg-[#0D1828] border border-white/[0.06] rounded-2xl p-5">
                  <p className="text-[13px] font-bold text-white mb-4">Lesson Breakdown</p>
                  <div className="space-y-4">
                    <HBar label="Completed"  value={lessons.completed  ?? 0} max={lessons.total ?? 100} color={CHART_COLORS.emerald} />
                    <HBar label="Scheduled"  value={lessons.scheduled  ?? 0} max={lessons.total ?? 100} color={CHART_COLORS.primary} />
                    <HBar label="Completion" value={fmt.pct(lessons.completion_rate ?? 0)} max={100}
                      color={CHART_COLORS.violet} suffix="" />
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center justify-between">
                    <span className="text-[11px] text-white/30">Total lessons</span>
                    <span className="text-[15px] font-bold text-white">{fmt.num(lessons.total)}</span>
                  </div>
                </div>
              </div>

              {/* Predictions */}
              <div className="bg-[#0D1828] border border-white/[0.06] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[13px] font-bold text-white">30-Day Predictions</p>
                    <p className="text-[11px] text-white/30 mt-0.5">
                      Confidence: {pr.predicted_metrics?.confidence ?? '—'}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-400">
                    AI Forecast
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <PredRow
                      label="Total Students"
                      current={fmt.num(pr.current_metrics?.total_students)}
                      predicted={fmt.num(predVals.total_students)}
                      dir={predDirs.student_trend}
                    />
                    <PredRow
                      label="Active Students"
                      current={fmt.num(pr.current_metrics?.active_students)}
                      predicted={fmt.num(predVals.active_students)}
                      dir={predDirs.student_trend}
                    />
                    <PredRow
                      label="Revenue"
                      current={fmt.money(pr.current_metrics?.revenue)}
                      predicted={fmt.money(predVals.revenue)}
                      dir={predDirs.revenue_trend}
                    />
                    <PredRow
                      label="Completion Rate"
                      current={fmt.pct(pr.current_metrics?.completion_rate)}
                      predicted={fmt.pct(predVals.completion_rate)}
                      dir={predDirs.completion_trend}
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white/30 uppercase tracking-wider mb-3">
                      Recommendations
                    </p>
                    <div className="space-y-3">
                      {recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0
                            ${rec.priority === 'high' ? 'bg-red-400'
                              : rec.priority === 'medium' ? 'bg-amber-400'
                              : 'bg-blue-400'}`}
                          />
                          <div>
                            <p className="text-[12px] font-semibold text-white/70">{rec.title}</p>
                            <p className="text-[11px] text-white/30 mt-0.5">{rec.action}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent feedback */}
              {recentFeed.length > 0 && (
                <div className="bg-[#0D1828] border border-white/[0.06] rounded-2xl p-5">
                  <p className="text-[13px] font-bold text-white mb-4">Recent Feedback</p>
                  <div className="space-y-3">
                    {recentFeed.map((fb) => (
                      <div key={fb.id}
                        className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-0">
                        <div className="w-8 h-8 rounded-full bg-violet-700/50 flex items-center
                          justify-center text-[11px] font-bold text-violet-300 flex-shrink-0">
                          {fb.student?.charAt(0) ?? '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[12px] font-semibold text-white">{fb.student}</p>
                            <Stars rating={fb.rating} />
                          </div>
                          <p className="text-[11px] text-white/30 mt-0.5">{fb.lesson}</p>
                          {fb.comment && (
                            <p className="text-[11px] text-white/50 mt-1 italic">"{fb.comment}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ════════════════════════════════════════════════════
              INSTRUCTORS TAB
          ════════════════════════════════════════════════════ */}
          {activeTab === 'instructors' && (
            <>
              <SectionHeading title="Instructor Performance" sub="Lessons taught & average ratings" />
              <div className="grid grid-cols-2 gap-4">
                {/* Bar chart */}
                <div className="bg-[#0D1828] border border-white/[0.06] rounded-2xl p-5">
                  <p className="text-[13px] font-bold text-white mb-4">Lessons Taught</p>
                  <div className="space-y-4">
                    {instructors.map((ins) => (
                      <HBar
                        key={ins.id}
                        label={ins.name}
                        value={ins.lessons_taught}
                        max={Math.max(...instructors.map((i) => i.lessons_taught), 1)}
                        color={CHART_COLORS.primary}
                      />
                    ))}
                  </div>
                </div>
                {/* Ratings */}
                <div className="bg-[#0D1828] border border-white/[0.06] rounded-2xl p-5">
                  <p className="text-[13px] font-bold text-white mb-4">Ratings</p>
                  <div className="space-y-3">
                    {instructors.map((ins) => (
                      <div key={ins.id}
                        className="flex items-center justify-between py-2.5
                          border-b border-white/[0.04] last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-700/40 flex items-center
                            justify-center text-[10px] font-bold text-blue-300 flex-shrink-0">
                            {ins.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-[12px] font-semibold text-white">{ins.name}</p>
                            <p className="text-[10px] text-white/30">{ins.lessons_taught} lessons</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Stars rating={ins.average_rating} />
                          <span className="text-[11px] font-bold text-amber-400">
                            {fmt.rating(ins.average_rating)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Utilization */}
              <div className="bg-[#0D1828] border border-white/[0.06] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[13px] font-bold text-white">Team Utilization</p>
                  <span className="text-[13px] font-bold text-white">
                    {fmt.pct(metrics.instructor_utilization)}
                  </span>
                </div>
                <div className="h-3 bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${metrics.instructor_utilization ?? 0}%`,
                      background: metrics.instructor_utilization >= 80
                        ? CHART_COLORS.emerald
                        : metrics.instructor_utilization >= 60
                        ? CHART_COLORS.amber
                        : CHART_COLORS.red,
                    }}
                  />
                </div>
                <p className="text-[11px] text-white/30 mt-2">
                  {metrics.instructor_utilization >= 80
                    ? 'Team is operating at high capacity — consider adding instructors.'
                    : metrics.instructor_utilization >= 60
                    ? 'Moderate utilization — room to take more students.'
                    : 'Low utilization — optimize instructor schedules.'}
                </p>
              </div>
            </>
          )}

          {/* ════════════════════════════════════════════════════
              STUDENTS TAB
          ════════════════════════════════════════════════════ */}
          {activeTab === 'students' && (
            <>
              <SectionHeading title="Student Analytics" sub="Progress & performance overview" />

              {/* KPIs */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Total"     value={fmt.num(metrics.total_students)}     accent={CHART_COLORS.primary} icon="👥" />
                <StatCard label="Active"    value={fmt.num(metrics.active_students)}    accent={CHART_COLORS.emerald} icon="🟢" />
                <StatCard label="Completed" value={fmt.num(metrics.completed_students)} accent={CHART_COLORS.violet}  icon="🎉" />
              </div>

              {/* Top performers */}
              <div className="bg-[#0D1828] border border-white/[0.06] rounded-2xl p-5">
                <p className="text-[13px] font-bold text-white mb-4">Top Performers</p>
                <div className="space-y-3">
                  {topStudents.map((s, idx) => (
                    <div key={s.id}
                      className="flex items-center gap-4 py-2.5 border-b border-white/[0.04] last:border-0">
                      <span className="text-[11px] font-bold text-white/20 w-5 text-center">
                        #{idx + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-emerald-700/40 flex items-center
                        justify-center text-[10px] font-bold text-emerald-300 flex-shrink-0">
                        {s.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-white truncate">{s.name}</p>
                        <p className="text-[10px] text-white/30">{s.total_hours}h completed</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-[12px] font-bold text-white">
                          {fmt.pct(s.completion_percentage)}
                        </span>
                        <div className="w-24 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${s.completion_percentage}%`,
                              background: s.completion_percentage >= 80
                                ? CHART_COLORS.emerald
                                : s.completion_percentage >= 50
                                ? CHART_COLORS.amber
                                : CHART_COLORS.red,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active student trend */}
              <div className="bg-[#0D1828] border border-white/[0.06] rounded-2xl p-5">
                <p className="text-[13px] font-bold text-white mb-1">Active Student Trend</p>
                <p className="text-[11px] text-white/30 mb-4">Last 30 days</p>
                <LineChart data={studTrend} color={CHART_COLORS.emerald} height={130} />
              </div>
            </>
          )}

          {/* ════════════════════════════════════════════════════
              ALERTS TAB
          ════════════════════════════════════════════════════ */}
          {activeTab === 'alerts' && (
            <>
              <SectionHeading title="Alerts & Recommendations" sub="Issues that need your attention" />

              {/* Health summary card */}
              <div className={`${hc.bg} border border-white/[0.06] rounded-2xl p-5
                flex items-center gap-5`}>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Overall Health</p>
                  <p className="text-[40px] font-bold text-white leading-none">{health.score ?? 74}</p>
                  <p className={`text-[12px] font-bold mt-1 ${hc.cls}`}>
                    {(health.status ?? 'needs_attention').replace('_', ' ')}
                  </p>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Immediate', count: al.summary?.needs_immediate_attention ?? 0, color: 'text-red-400',   bg: 'bg-red-500/10' },
                    { label: 'Address',   count: al.summary?.should_be_addressed ?? 0,       color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { label: 'Info',      count: al.summary?.for_information ?? 0,            color: 'text-blue-400',  bg: 'bg-blue-500/10' },
                  ].map((s) => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                      <p className={`text-[22px] font-bold ${s.color}`}>{s.count}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* High severity */}
              {alertsHigh.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-2">
                    🔴 High Severity
                  </p>
                  <div className="space-y-2">
                    {alertsHigh.map((a, i) => <AlertBadge key={i} alert={a} sev="high" />)}
                  </div>
                </div>
              )}

              {/* Medium severity */}
              {alertsMed.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2">
                    🟡 Medium Severity
                  </p>
                  <div className="space-y-2">
                    {alertsMed.map((a, i) => <AlertBadge key={i} alert={a} sev="medium" />)}
                  </div>
                </div>
              )}

              {/* Low severity */}
              {alertsLow.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-2">
                    🔵 Low / Info
                  </p>
                  <div className="space-y-2">
                    {alertsLow.map((a, i) => <AlertBadge key={i} alert={a} sev="low" />)}
                  </div>
                </div>
              )}

              {allAlerts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20
                    flex items-center justify-center text-2xl mb-4">
                    ✅
                  </div>
                  <p className="text-[14px] font-bold text-white mb-1">All clear</p>
                  <p className="text-[12px] text-white/30">No alerts detected for this period.</p>
                </div>
              )}
            </>
          )}

        </div>{/* end scrollable */}
      </main>
    </div>
  );
};

export default AnalyticsPage;