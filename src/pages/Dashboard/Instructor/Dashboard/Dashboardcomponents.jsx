import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

/* ═══════════════════════════════════════════════════════════════
   DashboardComponents.jsx — Instructor Dashboard
   Props from useDashboard() via InstructorDashboard.jsx:
     overview      → /api/dashboard/overview/  (dashboard_type: 'instructor')
     quickStats    → /api/dashboard/quick-stats/
     notifications → /api/dashboard/notifications/
     weeklyData    → /api/schoolanalytics/dashboard/?date_range=week
                     Shape: [{ date: 'YYYY-MM-DD', scheduled: N, completed: N }, ...]
                     Optional — WeeklyChart falls back gracefully if absent.
     loading       → boolean

   Instructor overview shape (from backend _instructor_dashboard):
   {
     dashboard_type, user, school,
     today: { total_lessons, completed, upcoming, lessons[] },
     this_week_performance: { total_lessons, completed_lessons, completion_rate, students_taught },
     upcoming_lessons: [{ id, title, date, time, duration }],
     performance_metrics: { average_rating, total_feedback, attendance_rate, total_students_taught },
     recent_feedback: [{ id, student, lesson, rating, comment, created_at }],
     timestamp
   }

   Quick stats shape (instructor):
   {
     user_role, stats: {
       today_lessons, today_completed,
       this_week_lessons, average_rating
     }
   }
═══════════════════════════════════════════════════════════════ */

// ─── Skeleton loader ──────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`bg-white/[0.04] rounded-lg animate-pulse ${className}`} />
);

// ─── Custom tooltip ───────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, suffix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E2D45] border border-white/[0.12] rounded-xl p-3 shadow-2xl z-50">
      <div className="text-[10px] text-white/40 mb-1.5 font-dm">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-[12px] font-semibold text-white font-dm">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          {p.name}: {typeof p.value === 'number' && p.value >= 1000 ? p.value.toLocaleString() : p.value}{suffix}
        </div>
      ))}
    </div>
  );
};

const fmt = (val, fallback = 0) => { const n = Number(val); return isNaN(n) ? fallback : n; };

const avatarBgs = [
  'bg-blue-700','bg-violet-700','bg-emerald-700','bg-amber-700',
  'bg-teal-700','bg-rose-700','bg-cyan-700',
];

const initials = (name = '') =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

const timeAgo = (timestamp) => {
  if (!timestamp) return '';
  const diff = Math.floor((Date.now() - new Date(timestamp)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ─────────────────────────────────────────────────────────────
// KPI STRIP — instructor-specific stats
// ─────────────────────────────────────────────────────────────

const KpiCard = ({ value, label, delta, deltaType = 'up', accentClass, iconBg, iconColor, icon, loading }) => {
  const glowMap  = { blue:'rgba(37,99,235,0.12)',purple:'rgba(124,58,237,0.12)',green:'rgba(16,185,129,0.10)',amber:'rgba(245,158,11,0.10)' };
  const lineMap  = { blue:'after:via-blue-400',purple:'after:via-violet-400',green:'after:via-emerald-400',amber:'after:via-amber-400' };
  const deltaStyle = { up:'bg-emerald-500/12 text-emerald-400', down:'bg-red-500/12 text-red-400', neu:'bg-blue-600/12 text-blue-400' };

  return (
    <div className={[
      'relative bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] px-5 py-4 overflow-hidden cursor-default',
      'transition-all duration-250 hover:border-white/[0.13] hover:-translate-y-0.5',
      'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5',
      'after:bg-gradient-to-r after:from-transparent after:to-transparent',
      lineMap[accentClass] ?? '',
    ].join(' ')}>
      <div className="absolute w-24 h-24 rounded-full -top-8 -right-5 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${glowMap[accentClass] ?? 'transparent'} 0%, transparent 70%)` }} />
      <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center mb-3 ${iconBg} ${iconColor}`}>{icon}</div>
      {loading ? (
        <><Skeleton className="h-8 w-20 mb-2" /><Skeleton className="h-3 w-28 mb-3" /><Skeleton className="h-4 w-16 rounded-full" /></>
      ) : (
        <>
          <div className="font-sora text-[30px] font-black text-white tracking-[-1.2px] leading-none mb-1">{value}</div>
          <div className="text-[11px] text-white/30 font-dm mb-2">{label}</div>
          <div className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full font-dm ${deltaStyle[deltaType]}`}>{delta}</div>
        </>
      )}
    </div>
  );
};

export const KpiStrip = ({ quickStats, overview, loading }) => {
  const stats = quickStats?.stats ?? {};
  const todayLessons   = fmt(stats.today_lessons   ?? overview?.today?.total_lessons);
  const todayCompleted = fmt(stats.today_completed  ?? overview?.today?.completed);
  const weekLessons    = fmt(stats.this_week_lessons ?? overview?.this_week_performance?.total_lessons);
  const avgRating      = fmt(stats.average_rating   ?? overview?.performance_metrics?.average_rating);
  const studentsTaught = fmt(overview?.this_week_performance?.students_taught ?? overview?.performance_metrics?.total_students_taught);

  const cards = [
    {
      value: loading ? '—' : String(todayLessons),
      label: 'Lessons today',
      delta: todayCompleted > 0 ? `${todayCompleted} completed` : 'No completions yet',
      deltaType: 'neu',
      accentClass: 'blue',
      iconBg: 'bg-blue-600/18',
      iconColor: 'text-blue-400',
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 5h12M4 1v2M10 1v2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>,
    },
    {
      value: loading ? '—' : String(weekLessons),
      label: 'This week',
      delta: overview?.this_week_performance?.completion_rate != null
        ? `↑ ${overview.this_week_performance.completion_rate}% completion`
        : '—',
      deltaType: 'up',
      accentClass: 'purple',
      iconBg: 'bg-violet-600/18',
      iconColor: 'text-violet-400',
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 10.5l3-4 3 2 3-5 2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    },
    {
      value: loading ? '—' : avgRating > 0 ? `${avgRating.toFixed(1)}★` : '—',
      label: 'Average rating',
      delta: overview?.performance_metrics?.total_feedback != null
        ? `${overview.performance_metrics.total_feedback} reviews`
        : 'No reviews yet',
      deltaType: 'up',
      accentClass: 'amber',
      iconBg: 'bg-amber-600/15',
      iconColor: 'text-amber-400',
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 4H13l-3.5 2.5 1.5 4L7 9 3 11.5l1.5-4L1 5h4.5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/></svg>,
    },
    {
      value: loading ? '—' : String(studentsTaught),
      label: 'Students taught',
      delta: overview?.performance_metrics?.attendance_rate != null
        ? `${overview.performance_metrics.attendance_rate}% attendance`
        : '—',
      deltaType: 'up',
      accentClass: 'green',
      iconBg: 'bg-emerald-600/15',
      iconColor: 'text-emerald-400',
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="4.5" r="2.8" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 13c0-3 2.5-4.5 5.5-4.5S12 10 12 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(c => <KpiCard key={c.label} {...c} loading={loading} />)}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// TODAY'S LESSONS — instructor-specific list with status
// ─────────────────────────────────────────────────────────────

const lessonStatus = (lesson) => {
  const s = (lesson.status_display ?? lesson.status ?? '').toLowerCase();
  if (s.includes('complet') || s === 'done' || s === 'c')
    return { label: 'Done ✓', cls: 'bg-emerald-500/15 text-emerald-300', bar: 'bg-emerald-500' };
  if (s.includes('cancel') || s === 'x')
    return { label: 'Cancelled', cls: 'bg-red-500/15 text-red-300', bar: 'bg-red-500' };
  const time = lesson.time ?? '';
  const disp = time ? time.slice(0, 5) : 'Soon';
  return { label: disp, cls: 'bg-blue-600/15 text-blue-300', bar: 'bg-blue-500' };
};

export const TodaySchedule = ({ overview, loading }) => {
  const lessons        = overview?.today?.lessons ?? [];
  const totalToday     = overview?.today?.total_lessons ?? lessons.length;
  const completedToday = overview?.today?.completed ?? 0;
  const upcomingCount  = overview?.today?.upcoming ?? 0;
  const pct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.11] transition-colors flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Today's lessons</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">
            {loading ? '…' : `${totalToday} scheduled · ${upcomingCount} upcoming`}
          </div>
        </div>
        {!loading && totalToday > 0 && (
          <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-emerald-500/12 text-emerald-400 border border-emerald-500/20 font-dm">
            {pct}% done
          </span>
        )}
      </div>

      {!loading && totalToday > 0 && (
        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden mb-4">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-700"
            style={{ width: `${pct}%` }} />
        </div>
      )}

      <div className="flex flex-col flex-1">
        {loading ? (
          [1,2,3,4].map(i => (
            <div key={i} className="flex items-center gap-2 py-2 border-b border-white/[0.04] last:border-0">
              <Skeleton className="w-0.5 h-8 rounded-full flex-shrink-0" />
              <Skeleton className="w-6 h-6 rounded-[7px] flex-shrink-0" />
              <div className="flex-1 space-y-1"><Skeleton className="h-3 w-24" /><Skeleton className="h-2 w-32" /></div>
              <Skeleton className="h-4 w-12 rounded-md" />
            </div>
          ))
        ) : lessons.length > 0 ? (
          lessons.slice(0, 5).map((lesson, i) => {
            const st = lessonStatus(lesson);
            return (
              <div key={lesson.id ?? i} className="flex items-center gap-2 py-2 border-b border-white/[0.04] last:border-0">
                <div className={`w-0.5 self-stretch rounded-full flex-shrink-0 ${st.bar}`} />
                <div className={`w-6 h-6 rounded-[7px] flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 ${avatarBgs[i % avatarBgs.length]}`}>
                  {lesson.title?.[0] ?? (i + 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-white/80 truncate font-dm">{lesson.title}</div>
                  <div className="text-[9px] text-white/30 mt-0.5 font-dm">
                    {lesson.time ? `at ${lesson.time}` : 'Time TBD'}
                  </div>
                </div>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0 font-dm ${st.cls}`}>
                  {st.label}
                </span>
              </div>
            );
          })
        ) : (
          <div className="flex-1 flex items-center justify-center py-6">
            <div className="text-center">
              <div className="text-2xl mb-2">📅</div>
              <div className="text-[11px] text-white/30 font-dm">No lessons scheduled today</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// UPCOMING LESSONS — next 7 days
// ─────────────────────────────────────────────────────────────

export const UpcomingLessons = ({ overview, loading }) => {
  const lessons = overview?.upcoming_lessons ?? [];

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.11] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Upcoming lessons</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">Next 7 days</div>
        </div>
        {!loading && (
          <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-blue-600/12 text-blue-400 border border-blue-500/20 font-dm">
            {lessons.length} scheduled
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {loading ? (
          [1,2,3,4].map(i => (
            <div key={i} className="flex items-center gap-3 p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-xl">
              <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-24" /><Skeleton className="h-2 w-16" /></div>
              <Skeleton className="h-4 w-12 rounded-md" />
            </div>
          ))
        ) : lessons.length > 0 ? (
          lessons.slice(0, 5).map((lesson, i) => {
            const [, month, day] = (lesson.date ?? '').split('-');
            const monthName = lesson.date
              ? new Date(lesson.date).toLocaleString('en-US', { month: 'short' })
              : '—';

            return (
              <div key={lesson.id ?? i}
                className="flex items-center gap-3 p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:bg-white/[0.04] transition-colors cursor-default">
                <div className="w-9 h-9 flex-shrink-0 bg-[#162035] rounded-lg flex flex-col items-center justify-center">
                  <span className="text-[8px] font-bold text-white/50 font-dm leading-none">{monthName.toUpperCase()}</span>
                  <span className="font-sora text-[13px] font-black text-white leading-none">{day ?? '—'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-white/80 truncate font-dm">{lesson.title}</div>
                  <div className="text-[9px] text-white/30 mt-0.5 font-dm">
                    {lesson.time} · {lesson.duration} min
                  </div>
                </div>
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md border font-dm bg-blue-600/12 text-blue-300 border-blue-500/20">
                  Scheduled
                </span>
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center text-[11px] text-white/30 font-dm">
            No upcoming lessons
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// WEEKLY PERFORMANCE CHART
// ─────────────────────────────────────────────────────────────

/**
 * Convert an ISO date string (YYYY-MM-DD) to a short day label (Mon, Tue…).
 * Returns the raw string unchanged if it can't be parsed.
 */
const toDayLabel = (dateStr) => {
  if (!dateStr) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Normalise a single analytics row into the shape the chart expects.
 * The backend may use different key names, so we accept several variants.
 */
const normaliseRow = (row) => ({
  day:       toDayLabel(row.date ?? row.day ?? row.period),
  scheduled: fmt(row.scheduled ?? row.total_lessons ?? row.scheduled_lessons ?? row.total),
  completed: fmt(row.completed ?? row.completed_lessons ?? row.done),
});

/**
 * Build a stable 7-day skeleton (Mon → Sun of the current week) and merge in
 * any real rows from the API so days with no data show as zero rather than
 * being omitted from the chart.
 */
const buildChartData = (weeklyData, overview) => {
  // If the analytics endpoint returned per-day rows, use them.
  if (weeklyData?.length) {
    return weeklyData.map(normaliseRow);
  }

  // No per-day data yet — build a 7-day frame using only the week aggregate
  // so the axis labels are always present and meaningful.
  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const perf       = overview?.this_week_performance ?? {};
  const total      = fmt(perf.total_lessons);
  const done       = fmt(perf.completed_lessons);

  // Spread the aggregate evenly across Mon-Fri as a best-effort placeholder.
  // These values are clearly marked "estimated" via the subtitle.
  const weekdayShare = (v) => Math.round(v / 5);

  return DAY_LABELS.map((day, i) => ({
    day,
    scheduled: i < 5 ? weekdayShare(total) : 0,
    completed: i < 5 ? weekdayShare(done)  : 0,
  }));
};

export const WeeklyChart = ({ overview, weeklyData, loading }) => {
  const perf = overview?.this_week_performance ?? {};
  const total = fmt(perf.total_lessons);
  const done  = fmt(perf.completed_lessons);
  const rate  = fmt(perf.completion_rate);

  const hasRealData   = Boolean(weeklyData?.length);
  const chartData     = buildChartData(weeklyData, overview);
  const subtitleLabel = hasRealData ? 'Completed vs scheduled' : 'Estimated (daily breakdown loading…)';

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.11] transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Weekly lessons</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">{subtitleLabel}</div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-emerald-500/12 text-emerald-400 border border-emerald-500/20 font-dm">
          {loading ? '…' : `${rate}% done`}
        </span>
      </div>

      {loading ? (
        <Skeleton className="w-full h-[130px] rounded-xl" />
      ) : (
        <ResponsiveContainer width="100%" height={130}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: 'rgba(240,244,255,0.28)', fontSize: 10, fontFamily: 'DM Sans' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'rgba(240,244,255,0.28)', fontSize: 10, fontFamily: 'DM Sans' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="scheduled"
              name="Scheduled"
              stroke="#3B82F6"
              strokeWidth={2}
              strokeDasharray={hasRealData ? undefined : '4 3'}   // dashed when estimated
              dot={{ r: 3, fill: '#3B82F6', strokeWidth: 2, stroke: '#0F1A2E' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              name="Completed"
              stroke="#10B981"
              strokeWidth={2}
              strokeDasharray={hasRealData ? undefined : '4 3'}
              dot={{ r: 3, fill: '#10B981', strokeWidth: 2, stroke: '#0F1A2E' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-4">
          {[['#3B82F6', 'Scheduled'], ['#10B981', 'Completed']].map(([color, label]) => (
            <div key={label} className="flex items-center gap-1.5 text-[10px] text-white/35 font-dm">
              <div className="w-4 h-0.5 rounded" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>
        <div className="text-[10px] text-white/30 font-dm">
          {!loading && total > 0 ? `${done}/${total} this week` : ''}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PERFORMANCE METRICS RING
// ─────────────────────────────────────────────────────────────

export const PerformanceRing = ({ overview, loading }) => {
  const metrics    = overview?.performance_metrics ?? {};
  const rating     = fmt(metrics.average_rating);
  const attendance = fmt(metrics.attendance_rate);
  const feedback   = fmt(metrics.total_feedback);
  const students   = fmt(metrics.total_students_taught);
  const school     = overview?.school;

  const r     = 36;
  const circ  = 2 * Math.PI * r;
  const arc   = attendance > 0 ? (attendance / 100) * circ : 0;

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.11] transition-colors">
      <div className="font-sora text-[13px] font-bold text-white mb-4">Performance</div>

      {loading ? (
        <Skeleton className="w-24 h-24 rounded-full mx-auto mb-5" />
      ) : (
        <div className="relative w-24 h-24 mx-auto mb-4">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <defs>
              <linearGradient id="perfGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
            <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
            {arc > 0 && (
              <circle cx="48" cy="48" r={r} fill="none" stroke="url(#perfGrad)" strokeWidth="10"
                strokeDasharray={`${arc} ${circ - arc}`}
                strokeDashoffset={circ * 0.25}
                strokeLinecap="round" />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-sora text-[18px] font-black text-white tracking-tight">
              {attendance > 0 ? `${attendance}%` : '—'}
            </span>
            <span className="text-[8px] text-white/30 font-dm">attendance</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {[
          { v: rating > 0 ? `${rating.toFixed(1)}★` : '—', l: 'Rating',   c: 'text-amber-400' },
          { v: String(feedback),                             l: 'Reviews',  c: 'text-white' },
          { v: String(students),                             l: 'Students', c: 'text-white' },
          { v: school?.name?.split(' ')[0] ?? '—',           l: 'School',   c: 'text-blue-400' },
        ].map(s => (
          <div key={s.l} className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2.5">
            <div className={`font-sora text-[14px] font-bold tracking-tight ${s.c}`}>
              {loading ? '—' : s.v}
            </div>
            <div className="text-[9px] text-white/25 mt-0.5 font-dm">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// RECENT FEEDBACK — from students
// ─────────────────────────────────────────────────────────────

const StarRating = ({ rating }) => {
  const stars = Math.round(fmt(rating));
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <div key={i} className={`text-[11px] ${i <= stars ? 'text-amber-400' : 'text-white/15'}`}>★</div>
      ))}
    </div>
  );
};

export const RecentFeedback = ({ overview, loading }) => {
  const feedback = overview?.recent_feedback ?? [];

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.11] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Student feedback</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">Recent reviews</div>
        </div>
      </div>

      <div className="flex flex-col">
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="py-3 border-b border-white/[0.04] last:border-0">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-2 w-full mt-1" />
              <Skeleton className="h-2 w-3/4 mt-1" />
            </div>
          ))
        ) : feedback.length > 0 ? (
          feedback.slice(0, 4).map((f, i) => (
            <div key={f.id ?? i} className="py-3 border-b border-white/[0.04] last:border-0">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-[5px] flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0 ${avatarBgs[i % avatarBgs.length]}`}>
                    {initials(f.student)}
                  </div>
                  <span className="text-[11px] font-semibold text-white/80 font-dm">{f.student}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StarRating rating={f.rating} />
                  <span className="text-[9px] text-white/25 font-dm">{timeAgo(f.created_at)}</span>
                </div>
              </div>
              <div className="text-[9px] text-white/30 font-dm mb-1">{f.lesson}</div>
              {f.comment && (
                <div className="text-[10px] text-white/50 font-dm leading-relaxed italic">
                  "{f.comment.slice(0, 80)}{f.comment.length > 80 ? '…' : ''}"
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-[11px] text-white/30 font-dm">No feedback yet</div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// COMPLETION DONUT
// ─────────────────────────────────────────────────────────────

export const CompletionDonut = ({ overview, loading }) => {
  const today      = overview?.today ?? {};
  const completed  = fmt(today.completed);
  const upcoming   = fmt(today.upcoming);
  const total      = fmt(today.total_lessons);
  const cancelled  = total > 0 ? Math.max(0, total - completed - upcoming) : 0;
  const pct        = total > 0 ? Math.round((completed / total) * 100) : 0;

  const r    = 36;
  const circ = 2 * Math.PI * r;
  const compArc = total > 0 ? (completed / total) * circ : 0;
  const upArc   = total > 0 ? (upcoming  / total) * circ : 0;
  const gap = 2;

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.11] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Today's progress</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">Lesson status</div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-emerald-500/12 text-emerald-400 border border-emerald-500/20 font-dm">
          {loading ? '…' : `${pct}%`}
        </span>
      </div>

      {loading ? (
        <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
      ) : (
        <div className="relative w-24 h-24 mx-auto mb-4">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
            {compArc > 0 && (
              <circle cx="48" cy="48" r={r} fill="none" stroke="#10B981" strokeWidth="12"
                strokeDasharray={`${compArc - gap} ${circ - compArc + gap}`}
                strokeDashoffset={circ * 0.25} strokeLinecap="round" />
            )}
            {upArc > 0 && (
              <circle cx="48" cy="48" r={r} fill="none" stroke="#3B82F6" strokeWidth="12"
                strokeDasharray={`${upArc - gap} ${circ - upArc + gap}`}
                strokeDashoffset={-(compArc - circ * 0.25 - gap)} strokeLinecap="round" />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-sora text-[18px] font-black text-white tracking-tight">{pct}%</span>
            <span className="text-[8px] text-white/30 font-dm">done</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {[
          { color: 'bg-emerald-500', label: 'Completed', value: completed  },
          { color: 'bg-blue-500',    label: 'Upcoming',  value: upcoming   },
          { color: 'bg-white/20',    label: 'Other',     value: cancelled  },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between text-[10px] font-dm">
            <div className="flex items-center gap-2 text-white/50">
              <div className={`w-1.5 h-1.5 rounded-sm ${item.color}`} />
              {item.label}
            </div>
            <span className="font-semibold text-white">{loading ? '—' : item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// NOTIFICATIONS / ACTIVITY FEED
// ─────────────────────────────────────────────────────────────

const notifIcon = (type) => {
  const t = (type ?? '').toLowerCase();
  if (t.includes('lesson') || t.includes('upcoming'))
    return { style: 'bg-blue-600/18 text-blue-400',
      svg: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1" y="1.5" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="1.1"/><path d="M1 3.5h8M3 1v1M7 1v1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg> };
  if (t.includes('feedback') || t.includes('pending'))
    return { style: 'bg-amber-500/15 text-amber-400',
      svg: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 7.5V9l1.5-1.5H8a1 1 0 001-1V3a1 1 0 00-1-1H2a1 1 0 00-1 1v3.5a1 1 0 001 1z" stroke="currentColor" strokeWidth="1.1"/></svg> };
  return { style: 'bg-emerald-500/15 text-emerald-400',
    svg: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> };
};

export const ActivityFeed = ({ notifications, loading }) => {
  const items = notifications ?? [];

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.11] transition-colors flex-1">
      <div className="flex items-center gap-2 mb-4">
        <div className="font-sora text-[13px] font-bold text-white">Notifications</div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-semibold font-dm">Live</span>
        </div>
      </div>

      <div className="flex flex-col">
        {loading ? (
          [1,2,3,4].map(i => (
            <div key={i} className="flex items-start gap-2.5 py-2.5 border-b border-white/[0.03] last:border-0">
              <Skeleton className="w-6 h-6 rounded-[7px] flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-24" /><Skeleton className="h-2 w-36" /></div>
              <Skeleton className="h-2 w-10 flex-shrink-0 mt-1" />
            </div>
          ))
        ) : items.length > 0 ? (
          items.slice(0, 5).map((notif, i) => {
            const ic      = notifIcon(notif.type ?? notif.title ?? '');
            const title   = notif.title ?? 'Notification';
            const message = notif.message ?? '';
            const time    = notif.timestamp ? timeAgo(notif.timestamp) : '';

            return (
              <div key={notif.id ?? i} className="flex items-start gap-2.5 py-2.5 border-b border-white/[0.03] last:border-0">
                <div className={`w-6 h-6 rounded-[7px] flex items-center justify-center flex-shrink-0 mt-0.5 ${ic.style}`}>
                  {ic.svg}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-white/80 font-dm">{title}</div>
                  <div className="text-[10px] text-white/40 mt-0.5 leading-relaxed font-dm truncate">{message}</div>
                </div>
                <div className="text-[9px] text-white/25 flex-shrink-0 mt-0.5 font-dm">{time}</div>
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center text-[11px] text-white/30 font-dm">All caught up!</div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// ERROR BANNER
// ─────────────────────────────────────────────────────────────

export const DashboardError = ({ message, onRetry }) => (
  <div className="flex items-center gap-3 bg-red-500/08 border border-red-500/25 rounded-xl px-4 py-3">
    <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M6.5 1L12 11H1L6.5 1Z" stroke="#EF4444" strokeWidth="1.2"/>
        <path d="M6.5 5v3M6.5 9.5v.5" stroke="#EF4444" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    </div>
    <span className="flex-1 text-[12px] text-red-400 font-dm">{message}</span>
    {onRetry && (
      <button onClick={onRetry}
        className="text-[11px] font-semibold text-red-400 hover:text-red-300 px-3 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 transition-colors font-dm">
        Retry
      </button>
    )}
  </div>
);