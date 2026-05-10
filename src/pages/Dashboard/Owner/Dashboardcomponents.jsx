import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

/* ═══════════════════════════════════════════════════════════════
   DashboardComponents.jsx
   All props come from useDashboard() via OwnerDashboard.jsx:
     overview      → /api/dashboard/overview/
     quickStats    → /api/dashboard/quick-stats/
     analytics     → /api/schoolanalytics/dashboard/
     notifications → /api/dashboard/notifications/
     loading       → boolean
   Every component has a safe fallback so it never crashes on
   null/undefined data during the initial load.
═══════════════════════════════════════════════════════════════ */

// ─── Skeleton loader ──────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`bg-white/[0.04] rounded-lg animate-pulse ${className}`} />
);

// ─── Custom recharts tooltip ──────────────────────────────────
const ChartTooltip = ({ active, payload, label, suffix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E2D45] border border-white/[0.12] rounded-xl p-3 shadow-2xl z-50">
      <div className="text-[10px] text-white/40 mb-1.5 font-dm">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-[12px] font-semibold text-white font-dm">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          {p.name}:{' '}
          {typeof p.value === 'number' && p.value >= 1000
            ? p.value.toLocaleString()
            : p.value}
          {suffix}
        </div>
      ))}
    </div>
  );
};

// ─── Safe number formatter ────────────────────────────────────
const fmt = (val, fallback = 0) => {
  const n = Number(val);
  return isNaN(n) ? fallback : n;
};

const fmtK = (val, fallback = '0') => {
  const n = fmt(val);
  if (n === 0) return fallback;
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
};

// ─────────────────────────────────────────────────────────────
// KPI STRIP
// ─────────────────────────────────────────────────────────────

const KpiCard = ({ value, label, delta, deltaType = 'up', accentClass, iconBg, iconColor, icon, loading }) => {
  const glowMap = {
    blue:   'rgba(37,99,235,0.12)',
    purple: 'rgba(124,58,237,0.12)',
    green:  'rgba(16,185,129,0.10)',
    amber:  'rgba(245,158,11,0.10)',
  };
  const bottomLine = {
    blue:   'after:via-blue-400',
    purple: 'after:via-violet-400',
    green:  'after:via-emerald-400',
    amber:  'after:via-amber-400',
  };
  const deltaStyle = {
    up:   'bg-emerald-500/12 text-emerald-400',
    down: 'bg-red-500/12 text-red-400',
    neu:  'bg-blue-600/12 text-blue-400',
  };

  return (
    <div className={[
      'relative bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] px-5 py-4',
      'overflow-hidden cursor-default transition-all duration-250',
      'hover:border-white/[0.13] hover:-translate-y-0.5',
      'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5',
      'after:bg-gradient-to-r after:from-transparent after:to-transparent',
      bottomLine[accentClass] ?? '',
    ].join(' ')}>
      {/* Glow orb */}
      <div className="absolute w-24 h-24 rounded-full -top-8 -right-5 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${glowMap[accentClass] ?? 'transparent'} 0%, transparent 70%)` }} />

      <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center mb-3 ${iconBg} ${iconColor}`}>
        {icon}
      </div>

      {loading ? (
        <>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-28 mb-3" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </>
      ) : (
        <>
          <div className="font-sora text-[30px] font-black text-white tracking-[-1.2px] leading-none mb-1">
            {value}
          </div>
          <div className="text-[11px] text-white/30 font-dm mb-2">{label}</div>
          <div className={`inline-flex items-center gap-1 text-[10px] font-semibold
            px-2 py-0.5 rounded-full font-dm ${deltaStyle[deltaType]}`}>
            {delta}
          </div>
        </>
      )}
    </div>
  );
};

export const KpiStrip = ({ quickStats, overview, loading }) => {
  // ── Map API fields ─────────────────────────────────────────
  // quickStats: { total_students, active_students, total_instructors,
  //               lessons_today, completed_today, pass_rate, ... }
  // overview:   { overview: { total_revenue_month, ... }, today: { scheduled_lessons, ... } }

  const totalStudents  = fmt(quickStats?.total_students   ?? overview?.overview?.total_students);
  const lessonsToday   = fmt(quickStats?.lessons_today    ?? overview?.today?.scheduled_lessons);
  const passRate       = fmt(quickStats?.pass_rate        ?? overview?.overview?.pass_rate);
  const revMonth       = fmt(quickStats?.total_revenue    ?? overview?.overview?.total_revenue_month);

  const cards = [
    {
      value:      loading ? '—' : String(totalStudents),
      label:      'Total students',
      delta:      quickStats?.new_students_week
                    ? `↑ +${quickStats.new_students_week} this week`
                    : '—',
      deltaType:  'up',
      accentClass:'blue',
      iconBg:     'bg-blue-600/18',
      iconColor:  'text-blue-400',
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="4.5" r="2.8" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M1.5 13c0-3 2.5-4.5 5.5-4.5S12 10 12 13"
            stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      value:      loading ? '—' : String(lessonsToday),
      label:      'Lessons today',
      delta:      quickStats?.lessons_in_progress != null
                    ? `${quickStats.lessons_in_progress} in progress`
                    : overview?.today?.completed_lessons != null
                    ? `${overview.today.completed_lessons} completed`
                    : '—',
      deltaType:  'neu',
      accentClass:'purple',
      iconBg:     'bg-violet-600/18',
      iconColor:  'text-violet-400',
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M1 5h12M4 1v2M10 1v2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      value:      loading ? '—' : passRate > 0 ? `${passRate}%` : '—',
      label:      'Pass rate',
      delta:      quickStats?.pass_rate_change != null
                    ? `↑ +${quickStats.pass_rate_change}% vs last month`
                    : 'This period',
      deltaType:  'up',
      accentClass:'green',
      iconBg:     'bg-emerald-600/15',
      iconColor:  'text-emerald-400',
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 7.5l3 3 3-3 3-4 2 2"
            stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      value:      loading ? '—' : revMonth > 0 ? `${fmtK(revMonth)}` : '—',
      label:      'Revenue (MAD)',
      delta:      quickStats?.revenue_change != null
                    ? `↑ +${quickStats.revenue_change}% this month`
                    : overview?.overview?.total_revenue_month != null
                    ? `${fmt(overview.overview.total_revenue_month).toLocaleString()} MAD`
                    : '—',
      deltaType:  'up',
      accentClass:'amber',
      iconBg:     'bg-amber-600/15',
      iconColor:  'text-amber-400',
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7h10M7 2v10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => <KpiCard key={c.label} {...c} loading={loading} />)}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// LESSON ACTIVITY CHART
// ─────────────────────────────────────────────────────────────

// Build chart data from analytics.lesson_trends or analytics.daily_lessons
const buildLessonData = (analytics, range) => {
  // Try analytics.lesson_trends (array of { date/day, scheduled, completed })
  if (analytics?.lesson_trends?.length) {
    return analytics.lesson_trends.map((d) => ({
      day:       d.day ?? d.date ?? d.period ?? '—',
      scheduled: fmt(d.scheduled),
      completed: fmt(d.completed),
    }));
  }
  // Try analytics.daily_lessons
  if (analytics?.daily_lessons?.length) {
    return analytics.daily_lessons.map((d) => ({
      day:       d.day ?? d.date ?? '—',
      scheduled: fmt(d.total),
      completed: fmt(d.completed),
    }));
  }
  // Fallback static
  const fallbacks = {
    '7d':  [
      { day:'Mon',scheduled:28,completed:25 },{ day:'Tue',scheduled:31,completed:28 },
      { day:'Wed',scheduled:29,completed:26 },{ day:'Thu',scheduled:35,completed:32 },
      { day:'Fri',scheduled:31,completed:28 },{ day:'Sat',scheduled:18,completed:15 },
      { day:'Sun',scheduled:12,completed:10 },
    ],
    '30d': [
      { day:'W1',scheduled:110,completed:98  },{ day:'W2',scheduled:125,completed:112 },
      { day:'W3',scheduled:138,completed:128 },{ day:'W4',scheduled:145,completed:138 },
    ],
    '90d': [
      { day:'Jan',scheduled:380,completed:340 },{ day:'Feb',scheduled:420,completed:385 },
      { day:'Mar',scheduled:480,completed:445 },
    ],
  };
  return fallbacks[range] ?? fallbacks['7d'];
};

export const LessonChart = ({ range, analytics, loading }) => {
  const data     = buildLessonData(analytics, range);
  const pctDelta = analytics?.lesson_completion_rate
    ? `${analytics.lesson_completion_rate}% completion`
    : '+18% this week';

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4
      hover:border-white/[0.11] transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Lesson activity</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">Completed vs scheduled</div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-1 rounded-lg
          bg-emerald-500/12 text-emerald-400 border border-emerald-500/20 font-dm">
          {pctDelta}
        </span>
      </div>

      {loading ? (
        <Skeleton className="w-full h-[130px] rounded-xl" />
      ) : (
        <ResponsiveContainer width="100%" height={130}>
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="day"
              tick={{ fill: 'rgba(240,244,255,0.28)', fontSize: 10, fontFamily: 'DM Sans' }}
              axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: 'rgba(240,244,255,0.28)', fontSize: 10, fontFamily: 'DM Sans' }}
              axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="scheduled" name="Scheduled" stroke="#3B82F6"
              strokeWidth={2} dot={{ r: 3, fill: '#3B82F6', strokeWidth: 2, stroke: '#0F1A2E' }}
              activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="completed" name="Completed" stroke="#10B981"
              strokeWidth={2} dot={{ r: 3, fill: '#10B981', strokeWidth: 2, stroke: '#0F1A2E' }}
              activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      )}

      <div className="flex gap-4 mt-2">
        {[['#3B82F6', 'Scheduled'], ['#10B981', 'Completed']].map(([color, label]) => (
          <div key={label} className="flex items-center gap-1.5 text-[10px] text-white/35 font-dm">
            <div className="w-4 h-0.5 rounded" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// REVENUE CHART
// ─────────────────────────────────────────────────────────────

const buildRevenueData = (analytics, range) => {
  if (analytics?.revenue_trends?.length) {
    return analytics.revenue_trends.map((d) => ({
      day:   d.day ?? d.date ?? d.period ?? '—',
      value: fmt(d.revenue ?? d.amount ?? d.value),
    }));
  }
  if (analytics?.weekly_revenue?.length) {
    return analytics.weekly_revenue.map((d) => ({
      day:   d.week ?? d.day ?? d.period ?? '—',
      value: fmt(d.revenue ?? d.total),
    }));
  }
  const fallbacks = {
    '7d':  [
      { day:'Mon',value:5200 },{ day:'Tue',value:6800 },{ day:'Wed',value:7100 },
      { day:'Thu',value:9400 },{ day:'Fri',value:8200 },{ day:'Sat',value:7600 },
      { day:'Sun',value:3900 },
    ],
    '30d': [
      { day:'W1',value:28000 },{ day:'W2',value:34000 },
      { day:'W3',value:38500 },{ day:'W4',value:48200 },
    ],
    '90d': [
      { day:'Jan',value:95000 },{ day:'Feb',value:118000 },{ day:'Mar',value:155000 },
    ],
  };
  return fallbacks[range] ?? fallbacks['7d'];
};

export const RevenueChart = ({ range, analytics, loading }) => {
  const data    = buildRevenueData(analytics, range);
  const maxVal  = data.length ? Math.max(...data.map((d) => d.value)) : 0;
  const totalRev = analytics?.total_revenue
    ?? data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4
      hover:border-white/[0.11] transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Revenue breakdown</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">Earnings (MAD)</div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-1 rounded-lg
          bg-blue-600/12 text-blue-400 border border-blue-500/20 font-dm">
          {totalRev > 0 ? `${totalRev.toLocaleString()} MAD` : '—'}
        </span>
      </div>

      {loading ? (
        <Skeleton className="w-full h-[130px] rounded-xl" />
      ) : (
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
            barCategoryGap="30%">
            <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="day"
              tick={{ fill: 'rgba(240,244,255,0.28)', fontSize: 10, fontFamily: 'DM Sans' }}
              axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: 'rgba(240,244,255,0.28)', fontSize: 10, fontFamily: 'DM Sans' }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
            <Tooltip content={<ChartTooltip suffix=" MAD" />} />
            <Bar dataKey="value" name="Revenue" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i}
                  fill={entry.value === maxVal
                    ? 'rgba(37,99,235,0.9)'
                    : 'rgba(37,99,235,0.3)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-white/30 font-dm">
          {maxVal > 0
            ? `Peak: ${data.find((d) => d.value === maxVal)?.day} ${maxVal.toLocaleString()} MAD`
            : 'No data yet'}
        </span>
        {analytics?.revenue_change != null && (
          <span className="text-[10px] font-semibold text-emerald-400 font-dm">
            ↑ +{analytics.revenue_change}% vs last period
          </span>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// TODAY'S SCHEDULE
// ─────────────────────────────────────────────────────────────

// Status display helper
const lessonStatus = (lesson) => {
  const s = lesson.status?.toLowerCase() ?? '';
  if (s === 'completed' || s === 'done')
    return { label: 'Done ✓', cls: 'bg-emerald-500/15 text-emerald-300', bar: 'bg-emerald-500' };
  if (s === 'in_progress' || s === 'live' || s === 'ongoing')
    return { label: 'Live ●', cls: 'bg-violet-500/18 text-violet-300',   bar: 'bg-violet-500'  };
  if (s === 'cancelled')
    return { label: 'Cancelled', cls: 'bg-red-500/15 text-red-300',      bar: 'bg-red-500'     };
  // scheduled / upcoming — show time
  const time = lesson.start_time ?? lesson.scheduled_time ?? '';
  const disp = time ? time.slice(0, 5) : 'Soon';
  return { label: disp, cls: 'bg-blue-600/15 text-blue-300', bar: 'bg-blue-500' };
};

const avatarBgs = [
  'bg-blue-700','bg-violet-700','bg-emerald-700','bg-amber-700',
  'bg-teal-700','bg-rose-700','bg-cyan-700',
];

const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

export const TodaySchedule = ({ overview, loading }) => {
  // API: overview.today.lessons (array) or overview.schedule (array)
  const lessons = overview?.today?.lessons ?? overview?.schedule ?? [];
  const totalToday    = overview?.today?.scheduled_lessons ?? lessons.length ?? 0;
  const completedToday= overview?.today?.completed_lessons ?? 0;
  const pct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  const displayLessons = lessons.slice(0, 4);

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4
      hover:border-white/[0.11] transition-colors flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Today's schedule</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">
            {loading ? '…' : `${totalToday} lessons`}
          </div>
        </div>
        {!loading && totalToday > 0 && (
          <span className="text-[10px] font-semibold px-2 py-1 rounded-lg
            bg-emerald-500/12 text-emerald-400 border border-emerald-500/20 font-dm">
            {pct}% done
          </span>
        )}
      </div>

      {/* Progress bar */}
      {!loading && totalToday > 0 && (
        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden mb-4">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500
            transition-all duration-700"
            style={{ width: `${pct}%` }} />
        </div>
      )}

      {/* Rows */}
      <div className="flex flex-col flex-1">
        {loading ? (
          [1,2,3,4].map((i) => (
            <div key={i} className="flex items-center gap-2 py-2 border-b border-white/[0.04] last:border-0">
              <Skeleton className="w-0.5 h-8 rounded-full flex-shrink-0" />
              <Skeleton className="w-6 h-6 rounded-[7px] flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-32" />
              </div>
              <Skeleton className="h-4 w-12 rounded-md" />
            </div>
          ))
        ) : displayLessons.length > 0 ? (
          displayLessons.map((lesson, i) => {
            const st       = lessonStatus(lesson);
            const name     = lesson.student_name ?? lesson.student ?? `Student ${i + 1}`;
            const route    = lesson.route ?? lesson.lesson_type ?? 'Lesson';
            const time     = lesson.start_time
              ? `${lesson.start_time.slice(0,5)} – ${lesson.end_time?.slice(0,5) ?? ''} · ${route}`
              : route;

            return (
              <div key={lesson.id ?? i}
                className="flex items-center gap-2 py-2 border-b border-white/[0.04] last:border-0">
                <div className={`w-0.5 self-stretch rounded-full flex-shrink-0 ${st.bar}`} />
                <div className={`w-6 h-6 rounded-[7px] flex items-center justify-center
                  text-[9px] font-bold text-white flex-shrink-0
                  ${avatarBgs[i % avatarBgs.length]}`}>
                  {initials(name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-white/80 truncate font-dm">
                    {name}
                  </div>
                  <div className="text-[9px] text-white/30 mt-0.5 font-dm">{time}</div>
                </div>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md
                  flex-shrink-0 font-dm ${st.cls}`}>
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

      {!loading && totalToday > 4 && (
        <button className="mt-3 w-full py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl
          text-[11px] font-semibold text-blue-400 hover:bg-blue-600/18 hover:text-white
          transition-all duration-200 font-dm">
          View all {totalToday} lessons →
        </button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// STUDENT PROGRESS TABLE
// ─────────────────────────────────────────────────────────────

const studentStatus = (s) => {
  const prog = fmt(s.progress ?? s.completion_rate ?? s.lessons_completed_pct ?? 0);
  if (s.status === 'passed' || prog === 100)
    return { label: 'Passed ✓',    cls: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20' };
  if (prog >= 70)
    return { label: 'On track',    cls: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20' };
  if (prog >= 30)
    return { label: 'In progress', cls: 'bg-blue-600/12 text-blue-400 border-blue-500/20' };
  if (prog > 0)
    return { label: 'Starting',    cls: 'bg-amber-500/12 text-amber-400 border-amber-500/20' };
  return   { label: 'New',         cls: 'bg-amber-500/12 text-amber-400 border-amber-500/20' };
};

const progressBarColor = (pct) => {
  if (pct >= 90) return 'bg-emerald-500';
  if (pct >= 50) return 'bg-blue-500';
  return 'bg-amber-500';
};

const progressTxtColor = (pct) => {
  if (pct >= 90) return 'text-emerald-400';
  if (pct >= 50) return 'text-blue-400';
  return 'text-amber-400';
};

export const StudentTable = ({ analytics, loading }) => {
  // API: analytics.top_students or analytics.students
  const students = analytics?.top_students ?? analytics?.students ?? [];
  const totalStudents = analytics?.total_students ?? students.length;

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4
      hover:border-white/[0.11] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Student progress</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">Top active this week</div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-1 rounded-lg
          bg-blue-600/12 text-blue-400 border border-blue-500/20 font-dm">
          {loading ? '…' : `${totalStudents} total`}
        </span>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            {['STUDENT', 'LESSONS', 'PROGRESS', 'STATUS'].map((h) => (
              <th key={h} className="pb-2.5 text-left text-[9px] font-bold text-white/25
                tracking-[0.6px] border-b border-white/[0.06] px-2 font-dm">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [1,2,3,4,5].map((i) => (
              <tr key={i}>
                <td className="py-2.5 px-2"><div className="flex items-center gap-2"><Skeleton className="w-6 h-6 rounded-[6px]" /><Skeleton className="h-3 w-20" /></div></td>
                <td className="py-2.5 px-2"><Skeleton className="h-3 w-6" /></td>
                <td className="py-2.5 px-2"><Skeleton className="h-2 w-16 rounded-full" /></td>
                <td className="py-2.5 px-2"><Skeleton className="h-4 w-16 rounded-md" /></td>
              </tr>
            ))
          ) : students.length > 0 ? (
            students.slice(0, 5).map((s, i) => {
              const name    = s.student_name ?? s.name ?? `Student ${i + 1}`;
              const lessons = fmt(s.lessons_completed ?? s.total_lessons ?? s.lessons ?? 0);
              const prog    = fmt(s.progress ?? s.completion_rate ?? s.lessons_completed_pct ?? 0);
              const st      = studentStatus(s);

              return (
                <tr key={s.id ?? i}
                  className="border-b border-white/[0.03] last:border-0
                    hover:bg-white/[0.02] transition-colors cursor-default">
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-[6px] flex items-center justify-center
                        text-[8px] font-bold text-white flex-shrink-0
                        ${avatarBgs[i % avatarBgs.length]}`}>
                        {initials(name)}
                      </div>
                      <span className="text-[11px] font-semibold text-white font-dm">
                        {name.split(' ')[0]} {name.split(' ')[1]?.[0] ?? ''}.
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-[11px] text-white/50 font-dm">{lessons}</td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${progressBarColor(prog)}`}
                          style={{ width: `${Math.min(prog, 100)}%` }} />
                      </div>
                      <span className={`text-[10px] font-semibold font-dm ${progressTxtColor(prog)}`}>
                        {prog}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className={`text-[9px] font-semibold px-2 py-0.5
                      rounded-md border font-dm ${st.cls}`}>
                      {st.label}
                    </span>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4} className="py-8 text-center text-[11px] text-white/30 font-dm">
                No students found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {!loading && totalStudents > 5 && (
        <button className="mt-4 w-full py-2 bg-white/[0.03] border border-white/[0.07]
          rounded-xl text-[11px] font-semibold text-white/40 hover:text-white/70
          hover:bg-white/[0.05] transition-all duration-200 font-dm">
          View all {totalStudents} students →
        </button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// INSTRUCTORS PANEL
// ─────────────────────────────────────────────────────────────

const availStatus = (inst) => {
  const s = inst.status?.toLowerCase() ?? inst.availability?.toLowerCase() ?? '';
  if (s.includes('break') || s.includes('busy'))    return 'amber';
  if (s.includes('unavail') || s.includes('off'))   return 'red';
  return 'green';
};

const availColors = { green: 'bg-emerald-400', amber: 'bg-amber-400', red: 'bg-red-400' };

const QUICK_ACTIONS = [
  {
    label: 'Add lesson', cls: 'bg-blue-600/18 text-blue-300 hover:bg-blue-600/30 hover:text-white',
    icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  },
  {
    label: 'Add student', cls: 'bg-violet-600/18 text-violet-300 hover:bg-violet-600/30 hover:text-white',
    icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.3" stroke="currentColor" strokeWidth="1.2"/><path d="M1 11c0-2.5 2.2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  },
  {
    label: 'Schedule', cls: 'bg-emerald-600/14 text-emerald-300 hover:bg-emerald-600/25 hover:text-white',
    icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1.5" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 4.5h10M3.5 1v1.5M8.5 1v1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>,
  },
  {
    label: 'Invoice', cls: 'bg-amber-600/14 text-amber-300 hover:bg-amber-600/25 hover:text-white',
    icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1.5" y="1" width="9" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M3.5 4h5M3.5 6.5h5M3.5 9h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
  },
];

export const InstructorsPanel = ({ analytics, loading }) => {
  // API: analytics.instructors or analytics.top_instructors
  const instructors = analytics?.instructors ?? analytics?.top_instructors ?? [];

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4
      hover:border-white/[0.11] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Instructors</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">
            {loading ? '…' : `${instructors.length} active today`}
          </div>
        </div>
        {!loading && instructors.length > 0 && (
          <span className="text-[10px] font-semibold px-2 py-1 rounded-lg
            bg-emerald-500/12 text-emerald-400 border border-emerald-500/20 font-dm">
            {instructors.filter((i) => availStatus(i) === 'green').length} available
          </span>
        )}
      </div>

      <div className="flex flex-col">
        {loading ? (
          [1,2,3,4].map((i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
              <Skeleton className="w-8 h-8 rounded-[9px] flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-28" />
              </div>
              <Skeleton className="h-4 w-8" />
              <Skeleton className="w-2 h-2 rounded-full flex-shrink-0" />
            </div>
          ))
        ) : instructors.length > 0 ? (
          instructors.slice(0, 4).map((inst, i) => {
            const name    = inst.instructor_name ?? inst.name ?? `Instructor ${i + 1}`;
            const lessons = fmt(inst.lessons_today ?? inst.today_lessons ?? 0);
            const rating  = inst.rating ?? inst.avg_rating ?? '—';
            const avail   = availStatus(inst);

            return (
              <div key={inst.id ?? i}
                className="flex items-center gap-3 py-2.5 border-b border-white/[0.04]
                  last:border-0 hover:bg-white/[0.02] -mx-1 px-1 rounded-lg transition-colors cursor-default">
                <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center
                  text-[10px] font-bold text-white flex-shrink-0
                  ${avatarBgs[i % avatarBgs.length]}`}>
                  {initials(name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-white/80 font-dm">{name}</div>
                  <div className="text-[9px] text-white/30 mt-0.5 font-dm">
                    {lessons > 0 ? `${lessons} lessons today` : 'Available'}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-sora text-[12px] font-bold text-white">
                    {rating !== '—' ? `${Number(rating).toFixed(1)}★` : '—'}
                  </div>
                  <div className="text-[9px] text-white/25 font-dm">Rating</div>
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${availColors[avail]}`} />
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center text-[11px] text-white/30 font-dm">
            No instructors yet
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="mt-4 pt-3.5 border-t border-white/[0.05]">
        <div className="text-[9px] font-bold text-white/20 tracking-[0.7px] mb-2.5 font-dm">
          QUICK ACTIONS
        </div>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map((qa) => (
            <button key={qa.label}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl
                text-[10px] font-semibold transition-all duration-200 font-dm ${qa.cls}`}>
              {qa.icon}
              {qa.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// COMPLETION DONUT
// ─────────────────────────────────────────────────────────────

export const CompletionDonut = ({ overview, analytics, loading }) => {
  const completed  = fmt(overview?.today?.completed_lessons ?? analytics?.completed_today ?? 28);
  const inProgress = fmt(overview?.today?.in_progress       ?? analytics?.in_progress_today ?? 2);
  const pending    = fmt(overview?.today?.scheduled_lessons
    ? overview.today.scheduled_lessons - completed - inProgress
    : analytics?.pending_today ?? 1);

  const total = completed + inProgress + pending;
  const pct   = total > 0 ? Math.round((completed / total) * 100) : 0;

  // SVG arc calculations
  const r    = 36;
  const circ = 2 * Math.PI * r;  // ≈ 226
  const compArc  = total > 0 ? (completed  / total) * circ : 0;
  const progArc  = total > 0 ? (inProgress / total) * circ : 0;
  const pendArc  = total > 0 ? (pending    / total) * circ : 0;
  const gap = 2;
  const compOffset = circ * 0.25; // start at top

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4
      hover:border-white/[0.11] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Completion rate</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">Today's lessons</div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-1 rounded-lg
          bg-emerald-500/12 text-emerald-400 border border-emerald-500/20 font-dm">
          {loading ? '…' : `${pct}%`}
        </span>
      </div>

      {loading ? (
        <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
      ) : (
        <div className="relative w-24 h-24 mx-auto mb-4">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r={r} fill="none"
              stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
            {compArc > 0 && (
              <circle cx="48" cy="48" r={r} fill="none" stroke="#10B981" strokeWidth="12"
                strokeDasharray={`${compArc - gap} ${circ - compArc + gap}`}
                strokeDashoffset={compOffset}
                strokeLinecap="round" />
            )}
            {progArc > 0 && (
              <circle cx="48" cy="48" r={r} fill="none" stroke="#3B82F6" strokeWidth="12"
                strokeDasharray={`${progArc - gap} ${circ - progArc + gap}`}
                strokeDashoffset={-(compArc - compOffset - gap)}
                strokeLinecap="round" />
            )}
            {pendArc > 0 && (
              <circle cx="48" cy="48" r={r} fill="none"
                stroke="rgba(245,158,11,0.7)" strokeWidth="12"
                strokeDasharray={`${pendArc - gap} ${circ - pendArc + gap}`}
                strokeDashoffset={-(compArc + progArc - compOffset - gap * 2)}
                strokeLinecap="round" />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-sora text-[18px] font-black text-white tracking-tight">
              {pct}%
            </span>
            <span className="text-[8px] text-white/30 font-dm">done</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {[
          { color: 'bg-emerald-500', label: 'Completed',   value: completed  },
          { color: 'bg-blue-500',    label: 'Live now',     value: inProgress },
          { color: 'bg-amber-500/70',label: 'Upcoming',    value: pending    },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between text-[10px] font-dm">
            <div className="flex items-center gap-2 text-white/50">
              <div className={`w-1.5 h-1.5 rounded-sm ${item.color}`} />
              {item.label}
            </div>
            <span className="font-semibold text-white">
              {loading ? '—' : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// LIVE ACTIVITY FEED
// ─────────────────────────────────────────────────────────────

const notifIcon = (type) => {
  const t = type?.toLowerCase() ?? '';
  if (t.includes('lesson') || t.includes('complete'))
    return { style: 'bg-emerald-500/15 text-emerald-400',
      svg: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> };
  if (t.includes('payment') || t.includes('invoice') || t.includes('paid'))
    return { style: 'bg-blue-600/18 text-blue-400',
      svg: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4h6M2 6.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> };
  if (t.includes('student') || t.includes('enroll'))
    return { style: 'bg-violet-600/18 text-violet-400',
      svg: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.1"/><path d="M1 9.5c0-2 1.8-3 4-3s4 1 4 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg> };
  return { style: 'bg-amber-500/15 text-amber-400',
    svg: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1l1.2 3.2H9L6.5 6l1 3L5 7.5 2.5 9l1-3L1 4.2h2.8z" stroke="currentColor" strokeWidth="1.1"/></svg> };
};

const timeAgo = (timestamp) => {
  if (!timestamp) return '';
  const diff = Math.floor((Date.now() - new Date(timestamp)) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const ActivityFeed = ({ notifications, loading }) => {
  const items = notifications ?? [];

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4
      hover:border-white/[0.11] transition-colors flex-1">
      <div className="flex items-center gap-2 mb-4">
        <div className="font-sora text-[13px] font-bold text-white">Live activity</div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-semibold font-dm">Live</span>
        </div>
      </div>

      <div className="flex flex-col">
        {loading ? (
          [1,2,3,4].map((i) => (
            <div key={i} className="flex items-start gap-2.5 py-2.5 border-b border-white/[0.03] last:border-0">
              <Skeleton className="w-6 h-6 rounded-[7px] flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-36" />
              </div>
              <Skeleton className="h-2 w-10 flex-shrink-0 mt-1" />
            </div>
          ))
        ) : items.length > 0 ? (
          items.slice(0, 5).map((notif, i) => {
            const ic      = notifIcon(notif.notification_type ?? notif.type ?? '');
            const title   = notif.title ?? notif.notification_type ?? 'Notification';
            const message = notif.message ?? notif.description ?? '';
            const time    = notif.created_at ? timeAgo(notif.created_at) : '';

            return (
              <div key={notif.id ?? i}
                className="flex items-start gap-2.5 py-2.5 border-b border-white/[0.03] last:border-0">
                <div className={`w-6 h-6 rounded-[7px] flex items-center justify-center
                  flex-shrink-0 mt-0.5 ${ic.style}`}>
                  {ic.svg}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-white/80 font-dm">{title}</div>
                  <div className="text-[10px] text-white/40 mt-0.5 leading-relaxed font-dm truncate">
                    {message}
                  </div>
                </div>
                <div className="text-[9px] text-white/25 flex-shrink-0 mt-0.5 font-dm">{time}</div>
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center text-[11px] text-white/30 font-dm">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PERFORMANCE SUMMARY
// ─────────────────────────────────────────────────────────────

export const PerformanceSummary = ({ analytics, overview, loading }) => {
  const passRate   = fmt(analytics?.pass_rate   ?? overview?.overview?.pass_rate   ?? 0);
  const cityRank   = analytics?.city_rank       ?? overview?.overview?.city_rank   ?? '—';
  const rating     = analytics?.avg_rating      ?? overview?.overview?.avg_rating  ?? '—';
  const years      = analytics?.years_on_platform ?? overview?.school?.years ?? '—';
  const totalStud  = analytics?.total_students  ?? overview?.overview?.total_students ?? '—';

  // Arc for the ring — passRate / 100
  const r     = 44;
  const circ  = 2 * Math.PI * r; // ≈ 276
  const arc   = passRate > 0 ? (passRate / 100) * circ : 0;

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4
      hover:border-white/[0.11] transition-colors">
      <div className="font-sora text-[13px] font-bold text-white mb-4">School performance</div>

      {loading ? (
        <Skeleton className="w-28 h-28 rounded-full mx-auto mb-5" />
      ) : (
        <div className="relative w-28 h-28 mx-auto mb-5">
          <svg width="112" height="112" viewBox="0 0 112 112">
            <defs>
              <linearGradient id="perfGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
            <circle cx="56" cy="56" r={r} fill="none"
              stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
            {arc > 0 && (
              <circle cx="56" cy="56" r={r} fill="none"
                stroke="url(#perfGrad)" strokeWidth="10"
                strokeDasharray={`${arc} ${circ - arc}`}
                strokeDashoffset={circ * 0.25}
                strokeLinecap="round" />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-sora text-[22px] font-black text-white tracking-tight">
              {passRate > 0 ? `${passRate}%` : '—'}
            </span>
            <span className="text-[9px] text-white/30 font-dm">pass rate</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {[
          { v: cityRank !== '—' ? `#${cityRank}` : '—', l: 'City rank',    c: 'text-amber-400' },
          { v: rating   !== '—' ? `${Number(rating).toFixed(1)}★` : '—', l: 'Rating', c: 'text-white' },
          { v: years    !== '—' ? `${years} yrs` : '—', l: 'On DriveIQ',   c: 'text-white' },
          { v: String(totalStud),                        l: 'Students',     c: 'text-white' },
        ].map((s) => (
          <div key={s.l}
            className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2.5">
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
// UPCOMING EXAMS  (no real API field yet — static placeholder)
// ─────────────────────────────────────────────────────────────
export const UpcomingExams = () => {
  const exams = [
    { name: 'Yassir Moktari', date: 'May 5',  type: 'Code exam',  status: 'Ready',      sc: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20' },
    { name: 'Lina Oussama',   date: 'May 7',  type: 'Road test',  status: 'Needs prep', sc: 'bg-amber-500/12 text-amber-400 border-amber-500/20' },
    { name: 'Hassan Amrani',  date: 'May 9',  type: 'Code exam',  status: 'Ready',      sc: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20' },
    { name: 'Sara Moussaoui', date: 'May 12', type: 'Road test',  status: 'Too early',  sc: 'bg-white/[0.06] text-white/35 border-white/[0.08]' },
  ];

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4
      hover:border-white/[0.11] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Upcoming exams</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">Next 7 days</div>
        </div>
        <button className="text-[10px] text-white/30 hover:text-white/60 transition-colors font-dm
          flex items-center gap-1">
          Calendar
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {exams.map((e) => {
          const [mon, day] = e.date.split(' ');
          return (
            <div key={e.name}
              className="flex items-center gap-3 p-2.5 bg-white/[0.02]
                border border-white/[0.04] rounded-xl hover:bg-white/[0.04]
                transition-colors cursor-default">
              <div className="w-9 h-9 flex-shrink-0 bg-[#162035] rounded-lg
                flex flex-col items-center justify-center">
                <span className="text-[8px] font-bold text-white/50 font-dm leading-none">
                  {mon.toUpperCase()}
                </span>
                <span className="font-sora text-[13px] font-black text-white leading-none">{day}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-white/80 truncate font-dm">{e.name}</div>
                <div className="text-[9px] text-white/30 mt-0.5 font-dm">{e.type}</div>
              </div>
              <span className={`text-[9px] font-semibold px-2 py-0.5
                rounded-md border flex-shrink-0 font-dm ${e.sc}`}>
                {e.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// RECENT PAYMENTS
// ─────────────────────────────────────────────────────────────
export const RecentPayments = ({ overview, loading }) => {
  // API: overview.recent_payments (array of { student_name, amount, date, status })
  const payments = overview?.recent_payments ?? [];
  const totalRev = fmt(overview?.overview?.total_revenue_month ?? 0);
  const collectedPct = fmt(overview?.overview?.collection_rate ?? 78);

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4
      hover:border-white/[0.11] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Recent payments</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">Last transactions</div>
        </div>
        <button className="text-[10px] text-white/30 hover:text-white/60 transition-colors font-dm">
          View all →
        </button>
      </div>

      {/* Revenue mini bar */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-white/[0.02]
        border border-white/[0.04] rounded-xl">
        <div>
          <div className="font-sora text-[20px] font-black text-white tracking-tight">
            {loading ? '—' : totalRev > 0 ? fmtK(totalRev) : '—'}
          </div>
          <div className="text-[9px] text-white/30 font-dm">MAD this month</div>
        </div>
        <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500
            transition-all duration-700"
            style={{ width: `${collectedPct}%` }} />
        </div>
        <span className="text-[10px] font-semibold text-emerald-400 font-dm">
          {collectedPct}%
        </span>
      </div>

      <div className="flex flex-col">
        {loading ? (
          [1,2,3,4,5].map((i) => (
            <div key={i} className="flex items-center justify-between py-2.5
              border-b border-white/[0.03] last:border-0">
              <div className="space-y-1.5"><Skeleton className="h-3 w-24" /><Skeleton className="h-2 w-16" /></div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))
        ) : payments.length > 0 ? (
          payments.slice(0, 5).map((p, i) => {
            const name   = p.student_name ?? p.student ?? `Student ${i + 1}`;
            const amount = fmt(p.amount ?? 0);
            const isNeg  = p.type === 'refund' || amount < 0;
            const when   = p.created_at ? timeAgo(p.created_at) : p.date ?? '';

            return (
              <div key={p.id ?? i}
                className="flex items-center justify-between py-2.5
                  border-b border-white/[0.03] last:border-0
                  hover:bg-white/[0.02] -mx-1 px-1 rounded-lg transition-colors">
                <div>
                  <div className="text-[11px] font-semibold text-white/75 font-dm">{name}</div>
                  <div className="text-[9px] text-white/25 mt-0.5 font-dm">{when}</div>
                </div>
                <span className={`font-sora text-[13px] font-bold ${isNeg ? 'text-red-400' : 'text-emerald-400'}`}>
                  {isNeg ? '-' : '+'}{Math.abs(amount).toLocaleString()} MAD
                </span>
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center text-[11px] text-white/30 font-dm">
            No payments yet
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DASHBOARD ERROR BANNER  (used in OwnerDashboard.jsx)
// ─────────────────────────────────────────────────────────────
export const DashboardError = ({ message, onRetry }) => (
  <div className="flex items-center gap-3 bg-red-500/08 border border-red-500/25
    rounded-xl px-4 py-3">
    <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M6.5 1L12 11H1L6.5 1Z" stroke="#EF4444" strokeWidth="1.2"/>
        <path d="M6.5 5v3M6.5 9.5v.5" stroke="#EF4444" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    </div>
    <span className="flex-1 text-[12px] text-red-400 font-dm">{message}</span>
    {onRetry && (
      <button onClick={onRetry}
        className="text-[11px] font-semibold text-red-400 hover:text-red-300
          px-3 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 transition-colors font-dm">
        Retry
      </button>
    )}
  </div>
);