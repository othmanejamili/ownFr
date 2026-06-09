import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

/* ═══════════════════════════════════════════════════════════════
   StudentDashboardComponents.jsx  —  Student Dashboard
   All data is live from the API via useDashboard():

   overview      → /api/dashboard/overview/  (_student_dashboard)
   ├─ overview.user.{ name, email, avatar }
   ├─ overview.enrollment.{ school_name, instructor_name, start_date,
   │                         expected_end_date, status }
   ├─ overview.progress.{ theory_completed, theory_total,
   │                       driving_completed, driving_total,
   │                       overall_percentage }
   ├─ overview.today.{ next_lesson, next_lesson_time, instructor,
   │                    lesson_type }
   ├─ overview.upcoming_lessons[].{ date, time, type, instructor,
   │                                 location, status }
   ├─ overview.achievements[].{ title, earned_at, icon }
   └─ overview.exam.{ theory_exam_date, driving_exam_date,
                       theory_passed, driving_passed }

   quickStats    → /api/dashboard/quick-stats/
   └─ quickStats.stats.{ theory_progress, driving_progress,
                          total_hours, achievements }

   notifications → /api/dashboard/notifications/
   └─ notifications[].{ type, title, message, priority, timestamp }
═══════════════════════════════════════════════════════════════ */

// ─── Skeleton ─────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`bg-white/[0.04] rounded-lg animate-pulse ${className}`} />
);

// ─── Tooltip ──────────────────────────────────────────────────
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

// ─── Helpers ──────────────────────────────────────────────────
const fmt  = (val, fallback = 0) => { const n = Number(val); return isNaN(n) ? fallback : n; };
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

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return dateStr; }
};

const avatarBgs = [
  'bg-blue-700','bg-violet-700','bg-emerald-700','bg-amber-700',
  'bg-teal-700','bg-rose-700','bg-cyan-700',
];

// ═════════════════════════════════════════════════════════════
// KPI STRIP  — 4 cards: Theory %, Driving %, Hours, Achievements
// ═════════════════════════════════════════════════════════════

const KpiCard = ({ value, label, delta, deltaType = 'up', accentClass, iconBg, iconColor, icon, loading }) => {
  const glowMap = {
    blue:   'rgba(37,99,235,0.12)',
    purple: 'rgba(124,58,237,0.12)',
    green:  'rgba(16,185,129,0.10)',
    amber:  'rgba(245,158,11,0.10)',
  };
  const lineMap = {
    blue:   'after:via-blue-400',
    purple: 'after:via-violet-400',
    green:  'after:via-emerald-400',
    amber:  'after:via-amber-400',
  };
  const deltaStyle = {
    up:  'bg-emerald-500/12 text-emerald-400',
    down:'bg-red-500/12 text-red-400',
    neu: 'bg-blue-600/12 text-blue-400',
  };

  return (
    <div className={[
      'relative bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] px-5 py-4 overflow-hidden',
      'cursor-default transition-all duration-250 hover:border-white/[0.13] hover:-translate-y-0.5',
      'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5',
      'after:bg-gradient-to-r after:from-transparent after:to-transparent',
      lineMap[accentClass] ?? '',
    ].join(' ')}>
      <div className="absolute w-24 h-24 rounded-full -top-8 -right-5 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${glowMap[accentClass] ?? 'transparent'} 0%, transparent 70%)` }} />
      <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center mb-3 ${iconBg} ${iconColor}`}>
        {icon}
      </div>
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
  const stats         = quickStats?.stats ?? {};
  const theoryProg    = fmt(stats.theory_progress  ?? overview?.progress?.theory_completed   ?? 0);
  const theoryTotal   = fmt(overview?.progress?.theory_total ?? 100);
  const drivingProg   = fmt(stats.driving_progress ?? overview?.progress?.driving_completed  ?? 0);
  const drivingTotal  = fmt(overview?.progress?.driving_total ?? 100);
  const totalHours    = fmt(stats.total_hours ?? 0);
  const achievements  = fmt(stats.achievements ?? overview?.achievements?.length ?? 0);

  const theoryPct  = theoryTotal  > 0 ? Math.round((theoryProg  / theoryTotal)  * 100) : theoryProg;
  const drivingPct = drivingTotal > 0 ? Math.round((drivingProg / drivingTotal) * 100) : drivingProg;

  const cards = [
    {
      value:      `${theoryPct}%`,
      label:      'Theory progress',
      delta:      theoryTotal > 0 ? `${theoryProg}/${theoryTotal} lessons` : `${theoryPct}% done`,
      deltaType:  theoryPct >= 70 ? 'up' : 'neu',
      accentClass:'blue',
      iconBg:     'bg-blue-600/18',
      iconColor:  'text-blue-400',
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1.5" width="10" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4.5 5h5M4.5 7.5h5M4.5 10h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
    },
    {
      value:      `${drivingPct}%`,
      label:      'Driving progress',
      delta:      drivingTotal > 0 ? `${drivingProg}/${drivingTotal} sessions` : `${drivingPct}% done`,
      deltaType:  drivingPct >= 70 ? 'up' : 'neu',
      accentClass:'purple',
      iconBg:     'bg-violet-600/18',
      iconColor:  'text-violet-400',
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 9.5h10M3.5 9.5L5 5.5h4l1.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="4.5" cy="10.5" r="1" stroke="currentColor" strokeWidth="1"/><circle cx="9.5" cy="10.5" r="1" stroke="currentColor" strokeWidth="1"/></svg>,
    },
    {
      value:      totalHours > 0 ? `${totalHours}h` : '—',
      label:      'Total hours logged',
      delta:      totalHours > 0 ? 'behind the wheel' : 'No hours yet',
      deltaType:  'up',
      accentClass:'green',
      iconBg:     'bg-emerald-600/15',
      iconColor:  'text-emerald-400',
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M7 4v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
    },
    {
      value:      String(achievements),
      label:      'Achievements earned',
      delta:      achievements > 0 ? `${achievements} badge${achievements !== 1 ? 's' : ''} unlocked` : 'None yet',
      deltaType:  achievements > 0 ? 'up' : 'neu',
      accentClass:'amber',
      iconBg:     'bg-amber-600/15',
      iconColor:  'text-amber-400',
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 3.5H12L9 7l1 3.5L7 9l-3 1.5L5 7 2 4.5h3.5L7 1Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/></svg>,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(c => <KpiCard key={c.label} {...c} loading={loading} />)}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// PROGRESS OVERVIEW  — dual radial arcs (theory + driving)
// overview.progress.{ theory_completed, theory_total,
//                      driving_completed, driving_total, overall_percentage }
// ═════════════════════════════════════════════════════════════

export const ProgressOverview = ({ overview, loading }) => {
  const prog        = overview?.progress ?? {};
  const theoryDone  = fmt(prog.theory_completed  ?? 0);
  const theoryTotal = fmt(prog.theory_total       ?? 0);
  const drivDone    = fmt(prog.driving_completed  ?? 0);
  const drivTotal   = fmt(prog.driving_total      ?? 0);
  const overall     = fmt(prog.overall_percentage ?? (
    (theoryTotal + drivTotal > 0)
      ? Math.round(((theoryDone + drivDone) / (theoryTotal + drivTotal)) * 100)
      : 0
  ));

  const theoryPct  = theoryTotal > 0 ? Math.round((theoryDone  / theoryTotal)  * 100) : 0;
  const drivingPct = drivTotal   > 0 ? Math.round((drivDone    / drivTotal)    * 100) : 0;

  // SVG arcs — outer ring theory, inner ring driving
  const rOuter = 52, rInner = 38;
  const cOuter = 2 * Math.PI * rOuter;
  const cInner = 2 * Math.PI * rInner;
  const theoryArc  = (theoryPct  / 100) * cOuter;
  const drivingArc = (drivingPct / 100) * cInner;

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.11] transition-colors flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Overall progress</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">Theory & driving combined</div>
        </div>
        {!loading && (
          <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-blue-600/12 text-blue-400 border border-blue-500/20 font-dm">
            {overall}% total
          </span>
        )}
      </div>

      {loading ? (
        <Skeleton className="w-32 h-32 rounded-full mx-auto my-4" />
      ) : (
        <div className="relative w-32 h-32 mx-auto my-2">
          <svg width="128" height="128" viewBox="0 0 128 128">
            {/* Tracks */}
            <circle cx="64" cy="64" r={rOuter} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
            <circle cx="64" cy="64" r={rInner} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
            {/* Theory arc (blue, outer) */}
            {theoryArc > 0 && (
              <circle cx="64" cy="64" r={rOuter} fill="none" stroke="#3B82F6" strokeWidth="10"
                strokeDasharray={`${theoryArc} ${cOuter - theoryArc}`}
                strokeDashoffset={cOuter * 0.25} strokeLinecap="round" />
            )}
            {/* Driving arc (violet, inner) */}
            {drivingArc > 0 && (
              <circle cx="64" cy="64" r={rInner} fill="none" stroke="#8B5CF6" strokeWidth="10"
                strokeDasharray={`${drivingArc} ${cInner - drivingArc}`}
                strokeDashoffset={cInner * 0.25} strokeLinecap="round" />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-sora text-[22px] font-black text-white tracking-tight">{overall}%</span>
            <span className="text-[8px] text-white/30 font-dm">complete</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 mt-3">
        {[
          { color: 'bg-blue-500',   label: 'Theory',  pct: theoryPct,  done: theoryDone,  total: theoryTotal },
          { color: 'bg-violet-500', label: 'Driving', pct: drivingPct, done: drivDone,    total: drivTotal   },
        ].map(item => (
          <div key={item.label}>
            <div className="flex justify-between mb-1">
              <div className="flex items-center gap-1.5 text-[10px] text-white/50 font-dm">
                <div className={`w-1.5 h-1.5 rounded-sm ${item.color}`} />
                {item.label}
              </div>
              <span className="text-[10px] font-semibold text-white font-dm">
                {loading ? '—' : item.total > 0 ? `${item.done}/${item.total}` : `${item.pct}%`}
              </span>
            </div>
            <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${item.color} transition-all duration-700`}
                style={{ width: `${Math.min(item.pct, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// NEXT LESSON CARD
// overview.today.{ next_lesson, next_lesson_time, instructor, lesson_type }
// overview.upcoming_lessons[0]  — fallback
// ═════════════════════════════════════════════════════════════

export const NextLessonCard = ({ overview, loading }) => {
  const today    = overview?.today;
  const upcoming = overview?.upcoming_lessons ?? [];
  const next     = today?.next_lesson ? today : upcoming[0];

  const lessonType   = next?.lesson_type  ?? next?.type  ?? 'Lesson';
  const lessonTime   = next?.next_lesson_time ?? next?.time ?? null;
  const lessonDate   = next?.date ?? null;
  const instructor   = next?.instructor_name ?? next?.instructor ?? null;
  const location     = next?.location ?? null;
  const status       = (next?.status ?? '').toLowerCase();

  const typeColors = {
    theory:  { bg: 'bg-blue-600/18',   text: 'text-blue-300',   border: 'border-blue-500/20'   },
    driving: { bg: 'bg-violet-600/18', text: 'text-violet-300', border: 'border-violet-500/20' },
    exam:    { bg: 'bg-amber-600/15',  text: 'text-amber-300',  border: 'border-amber-500/20'  },
  };
  const typeKey   = lessonType.toLowerCase().includes('theory')  ? 'theory'
                  : lessonType.toLowerCase().includes('exam')    ? 'exam'
                  : 'driving';
  const typeStyle = typeColors[typeKey] ?? typeColors.driving;

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.11] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Next lesson</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">Coming up</div>
        </div>
        {!loading && next && (
          <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg border font-dm ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
            {lessonType}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </div>
      ) : next ? (
        <>
          {/* Time / date block */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 mb-3 flex items-center gap-4">
            <div className="flex-shrink-0 text-center">
              <div className="font-sora text-[26px] font-black text-white tracking-tight leading-none">
                {lessonTime ?? '—'}
              </div>
              {lessonDate && (
                <div className="text-[9px] text-white/30 mt-0.5 font-dm">{formatDate(lessonDate)}</div>
              )}
            </div>
            <div className="w-px h-10 bg-white/[0.07] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {instructor && (
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-5 h-5 rounded-[6px] flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0 ${avatarBgs[0]}`}>
                    {initials(instructor)}
                  </div>
                  <span className="text-[11px] font-semibold text-white/80 font-dm truncate">{instructor}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-1.5 text-[9px] text-white/30 font-dm">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M4 1C2.9 1 2 1.9 2 3c0 1.5 2 4 2 4s2-2.5 2-4c0-1.1-.9-2-2-2Z" stroke="currentColor" strokeWidth="1"/></svg>
                  {location}
                </div>
              )}
            </div>
          </div>

          {/* Status / action */}
          <div className="flex items-center justify-between">
            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md font-dm ${
              status === 'confirmed' ? 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20'
              : status === 'pending' ? 'bg-amber-500/12 text-amber-400 border border-amber-500/20'
              : 'bg-blue-600/12 text-blue-400 border border-blue-500/20'
            }`}>
              {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Scheduled'}
            </span>
            <button className="text-[10px] font-semibold text-blue-400 hover:text-white transition-colors font-dm">
              View details →
            </button>
          </div>
        </>
      ) : (
        <div className="py-8 flex flex-col items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-white/15">
            <rect x="3" y="4" width="22" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M3 10h22M9 3v3M19 3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-[11px] text-white/30 font-dm">No lessons scheduled</span>
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// UPCOMING LESSONS LIST
// overview.upcoming_lessons[].{ date, time, type, instructor,
//                                location, status }
// ═════════════════════════════════════════════════════════════

export const UpcomingLessons = ({ overview, loading }) => {
  const lessons = overview?.upcoming_lessons ?? [];

  const typeIcon = (type = '') => {
    const t = type.toLowerCase();
    if (t.includes('theory'))
      return { icon: '📖', bg: 'bg-blue-600/18', text: 'text-blue-300' };
    if (t.includes('exam'))
      return { icon: '📋', bg: 'bg-amber-600/15', text: 'text-amber-300' };
    return { icon: '🚗', bg: 'bg-violet-600/18', text: 'text-violet-300' };
  };

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.11] transition-colors lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Upcoming lessons</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">Your schedule</div>
        </div>
        {!loading && lessons.length > 0 && (
          <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-blue-600/12 text-blue-400 border border-blue-500/20 font-dm">
            {lessons.length} scheduled
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02]">
              <Skeleton className="w-10 h-10 rounded-[10px] flex-shrink-0" />
              <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-24" /><Skeleton className="h-2 w-32" /></div>
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
          ))
        ) : lessons.length > 0 ? (
          lessons.slice(0, 5).map((lesson, i) => {
            const ti = typeIcon(lesson.type);
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.03]
                hover:bg-white/[0.04] hover:border-white/[0.06] transition-all cursor-default">
                <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-[16px] flex-shrink-0 ${ti.bg}`}>
                  {ti.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold font-dm ${ti.text}`}>{lesson.type ?? 'Lesson'}</span>
                    {lesson.instructor && (
                      <span className="text-[9px] text-white/25 font-dm">· {lesson.instructor}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px] font-semibold text-white/70 font-dm">
                      {formatDate(lesson.date)}{lesson.time ? ` at ${lesson.time}` : ''}
                    </span>
                    {lesson.location && (
                      <span className="text-[9px] text-white/25 font-dm truncate">{lesson.location}</span>
                    )}
                  </div>
                </div>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md border font-dm flex-shrink-0 ${
                  (lesson.status ?? '').toLowerCase() === 'confirmed'
                    ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20'
                    : 'bg-blue-600/12 text-blue-400 border-blue-500/20'
                }`}>
                  {lesson.status ?? 'Scheduled'}
                </span>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-[11px] text-white/30 font-dm">No upcoming lessons</div>
        )}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// EXAM STATUS CARD
// overview.exam.{ theory_exam_date, driving_exam_date,
//                  theory_passed, driving_passed }
// ═════════════════════════════════════════════════════════════

export const ExamStatusCard = ({ overview, loading }) => {
  const exam = overview?.exam ?? {};
  const theoryPassed  = exam.theory_passed  ?? false;
  const drivingPassed = exam.driving_passed ?? false;
  const theoryDate    = exam.theory_exam_date  ?? null;
  const drivingDate   = exam.driving_exam_date ?? null;

  const ExamRow = ({ label, date, passed, icon }) => (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
      <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center text-[14px] flex-shrink-0
        ${passed ? 'bg-emerald-500/15' : 'bg-white/[0.04]'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold text-white/80 font-dm">{label}</div>
        {date && (
          <div className="text-[9px] text-white/30 mt-0.5 font-dm">
            {passed ? 'Passed' : `Scheduled: ${formatDate(date)}`}
          </div>
        )}
      </div>
      <div className={`flex items-center gap-1.5 text-[9px] font-semibold px-2 py-0.5 rounded-md border font-dm flex-shrink-0 ${
        passed
          ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20'
          : date
            ? 'bg-blue-600/12 text-blue-400 border-blue-500/20'
            : 'bg-white/[0.04] text-white/25 border-white/[0.06]'
      }`}>
        {passed ? '✓ Passed' : date ? 'Upcoming' : 'Not set'}
      </div>
    </div>
  );

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.11] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Exam status</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">Theory & driving</div>
        </div>
        {!loading && (theoryPassed || drivingPassed) && (
          <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-emerald-500/12 text-emerald-400 border border-emerald-500/20 font-dm">
            {theoryPassed && drivingPassed ? 'All passed ✓' : '1/2 passed'}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}
        </div>
      ) : (
        <>
          <ExamRow label="Theory exam"  date={theoryDate}  passed={theoryPassed}  icon="📖" />
          <ExamRow label="Driving exam" date={drivingDate} passed={drivingPassed} icon="🚗" />
        </>
      )}

      {!loading && theoryPassed && drivingPassed && (
        <div className="mt-3 p-3 bg-emerald-500/08 border border-emerald-500/20 rounded-xl text-center">
          <div className="text-[12px] font-semibold text-emerald-400 font-sora">🎉 Congratulations!</div>
          <div className="text-[10px] text-emerald-400/70 mt-0.5 font-dm">You've passed all exams</div>
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// ENROLLMENT INFO CARD
// overview.enrollment.{ school_name, instructor_name, start_date,
//                         expected_end_date, status }
// ═════════════════════════════════════════════════════════════

export const EnrollmentCard = ({ overview, loading }) => {
  const enroll = overview?.enrollment ?? {};
  const school     = enroll.school_name     ?? null;
  const instructor = enroll.instructor_name ?? null;
  const startDate  = enroll.start_date      ?? null;
  const endDate    = enroll.expected_end_date ?? null;
  const status     = enroll.status ?? 'active';

  const statusStyle = {
    active:    'bg-emerald-500/12 text-emerald-400 border-emerald-500/20',
    completed: 'bg-blue-600/12 text-blue-400 border-blue-500/20',
    suspended: 'bg-amber-500/12 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.11] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Enrollment</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">Your driving school</div>
        </div>
        {!loading && (
          <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg border font-dm capitalize ${statusStyle[status] ?? statusStyle.active}`}>
            {status}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-10 rounded-xl" />)}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {[
            {
              label: 'School',
              value: school,
              icon: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1" y="3" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1"/><path d="M5 1L1 3h8L5 1Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/></svg>,
            },
            {
              label: 'Instructor',
              value: instructor,
              icon: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="3.5" r="2" stroke="currentColor" strokeWidth="1"/><path d="M1 9.5c0-2 1.8-3 4-3s4 1 4 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
            },
            {
              label: 'Started',
              value: formatDate(startDate),
              icon: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1" y="1.5" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="1"/><path d="M1 4h8M3 1v1.5M7 1v1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
            },
            {
              label: 'Expected end',
              value: formatDate(endDate),
              icon: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1"/><path d="M5 3v2.5l1.5 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
            },
          ].map(row => (
            <div key={row.label} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-xl px-3 py-2">
              <div className="w-5 h-5 rounded-[6px] bg-white/[0.04] flex items-center justify-center text-white/30 flex-shrink-0">
                {row.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] text-white/25 font-dm">{row.label}</div>
                <div className="text-[11px] font-semibold text-white/80 font-dm truncate">{row.value ?? '—'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// ACHIEVEMENTS PANEL
// overview.achievements[].{ title, earned_at, icon }
// ═════════════════════════════════════════════════════════════

const BADGE_FALLBACKS = ['🌟', '🏆', '🎯', '🚀', '💎', '🔥', '⭐', '🎖️'];

export const AchievementsPanel = ({ overview, loading }) => {
  const achievements = overview?.achievements ?? [];

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.11] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Achievements</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">Badges earned</div>
        </div>
        {!loading && achievements.length > 0 && (
          <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-amber-600/12 text-amber-400 border border-amber-500/20 font-dm">
            {achievements.length} earned
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-2">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : achievements.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {achievements.slice(0, 6).map((ach, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 p-2.5 bg-white/[0.02] border border-white/[0.04]
              rounded-xl hover:bg-white/[0.04] hover:border-amber-500/20 transition-all cursor-default group">
              <div className="text-[22px] group-hover:scale-110 transition-transform duration-200">
                {ach.icon ?? BADGE_FALLBACKS[i % BADGE_FALLBACKS.length]}
              </div>
              <div className="text-[9px] font-semibold text-white/60 text-center font-dm leading-tight line-clamp-2">{ach.title}</div>
              {ach.earned_at && (
                <div className="text-[8px] text-white/20 font-dm">{formatDate(ach.earned_at)}</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 flex flex-col items-center gap-2">
          <span className="text-[32px] opacity-20">🏆</span>
          <span className="text-[11px] text-white/30 font-dm">No achievements yet</span>
          <span className="text-[10px] text-white/20 font-dm">Complete lessons to earn badges</span>
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// ACTIVITY FEED
// notifications[].{ type, title, message, priority, timestamp }
// ═════════════════════════════════════════════════════════════

const notifIcon = (type, priority) => {
  const t = (type ?? '').toLowerCase();
  const p = (priority ?? '').toLowerCase();
  if (p === 'high' || t.includes('error') || t.includes('fail'))
    return { style: 'bg-red-500/15 text-red-400',
      svg: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1L9 8H1L5 1Z" stroke="currentColor" strokeWidth="1.2"/><path d="M5 4v2M5 7v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> };
  if (t.includes('lesson') || t.includes('schedule'))
    return { style: 'bg-violet-600/18 text-violet-400',
      svg: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1" y="1.5" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="1.1"/><path d="M1 4h8M3 1v1.5M7 1v1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg> };
  if (t.includes('exam') || t.includes('test'))
    return { style: 'bg-amber-500/15 text-amber-400',
      svg: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1.5" y="1" width="7" height="8" rx="1" stroke="currentColor" strokeWidth="1.1"/><path d="M3 3.5h4M3 5.5h4M3 7.5h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg> };
  return { style: 'bg-blue-600/18 text-blue-400',
    svg: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.1"/><path d="M5 3.5v2M5 6.5v.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg> };
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
          items.slice(0, 6).map((notif, i) => {
            const ic    = notifIcon(notif.type, notif.priority);
            const title = notif.title ?? 'Notification';
            const msg   = notif.message ?? '';
            const time  = notif.timestamp ? timeAgo(notif.timestamp) : '';

            return (
              <div key={notif.id ?? i}
                className="flex items-start gap-2.5 py-2.5 border-b border-white/[0.03] last:border-0">
                <div className={`w-6 h-6 rounded-[7px] flex items-center justify-center flex-shrink-0 mt-0.5 ${ic.style}`}>
                  {ic.svg}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-white/80 font-dm">{title}</div>
                  <div className="text-[10px] text-white/40 mt-0.5 leading-relaxed font-dm truncate">{msg}</div>
                </div>
                <div className="text-[9px] text-white/25 flex-shrink-0 mt-0.5 font-dm">{time}</div>
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center text-[11px] text-white/30 font-dm">No recent activity</div>
        )}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// ERROR BANNER
// ═════════════════════════════════════════════════════════════

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