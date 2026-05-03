import { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

/* ─────────────────────────────────────────────
   Dashboard Components
   All sub-components for the Owner Dashboard.
   Uses Recharts for charts.
   Install: npm install recharts
───────────────────────────────────────────── */

// ── Shared primitives ─────────────────────────────────────────

export const CheckIcon = () => (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
    <path d="M1.5 4.5l2 2 4-4" stroke="currentColor" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowUp = () => (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
    <path d="M1.5 6l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Custom recharts tooltip
const ChartTooltip = ({ active, payload, label, suffix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E2D45] border border-white/[0.12] rounded-xl p-3 shadow-2xl">
      <div className="text-[10px] text-white/40 mb-1.5 font-dm">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-[12px] font-semibold text-white font-dm">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          {p.name}: {typeof p.value === 'number' && p.value >= 1000
            ? p.value.toLocaleString() : p.value}{suffix}
        </div>
      ))}
    </div>
  );
};

// ── Range data ────────────────────────────────────────────────
const RANGE_DATA = {
  '7d': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    lessons: [
      { day: 'Mon', scheduled: 28, completed: 25 },
      { day: 'Tue', scheduled: 31, completed: 28 },
      { day: 'Wed', scheduled: 29, completed: 26 },
      { day: 'Thu', scheduled: 35, completed: 32 },
      { day: 'Fri', scheduled: 31, completed: 28 },
      { day: 'Sat', scheduled: 18, completed: 15 },
      { day: 'Sun', scheduled: 12, completed: 10 },
    ],
    revenue: [
      { day: 'Mon', value: 5200 },
      { day: 'Tue', value: 6800 },
      { day: 'Wed', value: 7100 },
      { day: 'Thu', value: 9400 },
      { day: 'Fri', value: 8200 },
      { day: 'Sat', value: 7600 },
      { day: 'Sun', value: 3900 },
    ],
  },
  '30d': {
    lessons: [
      { day: 'W1', scheduled: 110, completed: 98 },
      { day: 'W2', scheduled: 125, completed: 112 },
      { day: 'W3', scheduled: 138, completed: 128 },
      { day: 'W4', scheduled: 145, completed: 138 },
    ],
    revenue: [
      { day: 'W1', value: 28000 },
      { day: 'W2', value: 34000 },
      { day: 'W3', value: 38500 },
      { day: 'W4', value: 48200 },
    ],
  },
  '90d': {
    lessons: [
      { day: 'Jan', scheduled: 380, completed: 340 },
      { day: 'Feb', scheduled: 420, completed: 385 },
      { day: 'Mar', scheduled: 480, completed: 445 },
    ],
    revenue: [
      { day: 'Jan', value: 95000 },
      { day: 'Feb', value: 118000 },
      { day: 'Mar', value: 155000 },
    ],
  },
};

// ─────────────────────────────────────────────────────────────
// KPI STRIP
// ─────────────────────────────────────────────────────────────
const KpiCard = ({ value, label, delta, deltaType = 'up', accentClass, iconBg, iconColor, icon }) => {
  const deltaColors = {
    up:   'bg-emerald-500/12 text-emerald-400',
    down: 'bg-red-500/12 text-red-400',
    neu:  'bg-blue-600/12 text-blue-400',
  };
  const borderColors = {
    blue:   'after:bg-gradient-to-r after:from-transparent after:via-blue-400 after:to-transparent',
    purple: 'after:bg-gradient-to-r after:from-transparent after:via-violet-400 after:to-transparent',
    green:  'after:bg-gradient-to-r after:from-transparent after:via-emerald-400 after:to-transparent',
    amber:  'after:bg-gradient-to-r after:from-transparent after:via-amber-400 after:to-transparent',
  };

  return (
    <div className={[
      'relative bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] px-5 py-4',
      'overflow-hidden cursor-default transition-all duration-250',
      'hover:border-white/[0.13] hover:-translate-y-0.5',
      'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5',
      borderColors[accentClass] || '',
    ].join(' ')}>
      {/* Glow orb */}
      <div className="absolute w-24 h-24 rounded-full -top-8 -right-5 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${iconColor.replace('text-', '').includes('blue') ? 'rgba(37,99,235,0.12)' : iconColor.includes('violet') ? 'rgba(124,58,237,0.12)' : iconColor.includes('emerald') ? 'rgba(16,185,129,0.10)' : 'rgba(245,158,11,0.10)'} 0%, transparent 70%)` }} />

      <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center mb-3 ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div className="font-sora text-[30px] font-black text-white tracking-[-1.2px] leading-none mb-1">
        {value}
      </div>
      <div className="text-[11px] text-white/30 font-dm mb-2">{label}</div>
      <div className={`inline-flex items-center gap-1 text-[10px] font-semibold
        px-2 py-0.5 rounded-full font-dm ${deltaColors[deltaType]}`}>
        {delta}
      </div>
    </div>
  );
};

export const KpiStrip = ({ range }) => {
  const cards = [
    {
      value: '142', label: 'Total students', delta: '↑ +8 this week', deltaType: 'up',
      accentClass: 'blue', iconBg: 'bg-blue-600/18', iconColor: 'text-blue-400',
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="4.5" r="2.8" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 13c0-3 2.5-4.5 5.5-4.5S12 10 12 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
    },
    {
      value: '31', label: 'Lessons today', delta: '6 in progress', deltaType: 'neu',
      accentClass: 'purple', iconBg: 'bg-violet-600/18', iconColor: 'text-violet-400',
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 5h12M4 1v2M10 1v2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>,
    },
    {
      value: '97%', label: 'Pass rate', delta: '↑ +2% vs last month', deltaType: 'up',
      accentClass: 'green', iconBg: 'bg-emerald-600/15', iconColor: 'text-emerald-400',
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7.5l3 3 3-3 3-4 2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    },
    {
      value: '48.2k', label: 'Revenue (MAD)', delta: '↑ +34% this month', deltaType: 'up',
      accentClass: 'amber', iconBg: 'bg-amber-600/15', iconColor: 'text-amber-400',
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2v10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/></svg>,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => <KpiCard key={c.label} {...c} />)}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// LESSON ACTIVITY CHART
// ─────────────────────────────────────────────────────────────
export const LessonChart = ({ range }) => {
  const data = RANGE_DATA[range]?.lessons || RANGE_DATA['7d'].lessons;

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
          +18% this week
        </span>
      </div>

      <ResponsiveContainer width="100%" height={130}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: 'rgba(240,244,255,0.28)', fontSize: 10, fontFamily: 'DM Sans' }}
            axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgba(240,244,255,0.28)', fontSize: 10, fontFamily: 'DM Sans' }}
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
export const RevenueChart = ({ range }) => {
  const data = RANGE_DATA[range]?.revenue || RANGE_DATA['7d'].revenue;
  const maxVal = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4
      hover:border-white/[0.11] transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Revenue breakdown</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">Weekly earnings (MAD)</div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-1 rounded-lg
          bg-blue-600/12 text-blue-400 border border-blue-500/20 font-dm">
          48,200 MAD
        </span>
      </div>

      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
          barCategoryGap="30%">
          <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: 'rgba(240,244,255,0.28)', fontSize: 10, fontFamily: 'DM Sans' }}
            axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgba(240,244,255,0.28)', fontSize: 10, fontFamily: 'DM Sans' }}
            axisLine={false} tickLine={false}
            tickFormatter={v => v >= 1000 ? `${v / 1000}k` : v} />
          <Tooltip content={<ChartTooltip suffix=" MAD" />} />
          <Bar dataKey="value" name="Revenue" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i}
                fill={entry.value === maxVal ? 'rgba(37,99,235,0.9)' : 'rgba(37,99,235,0.3)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-white/30 font-dm">
          Peak: {data.find(d => d.value === maxVal)?.day} {maxVal.toLocaleString()} MAD
        </span>
        <span className="text-[10px] font-semibold text-emerald-400 font-dm">↑ +18% vs last week</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// TODAY'S SCHEDULE
// ─────────────────────────────────────────────────────────────
const SCHEDULE = [
  { initials: 'KB', name: 'Karim Benali',   time: '09:00 – 10:30 · Route A',  status: 'Done ✓',   statusClass: 'bg-emerald-500/15 text-emerald-300', barColor: 'bg-emerald-500', avatarBg: 'bg-emerald-700' },
  { initials: 'LO', name: 'Lina Oussama',   time: '11:00 – 12:30 · Highway',  status: 'Live ●',   statusClass: 'bg-violet-500/18 text-violet-300',   barColor: 'bg-violet-500',  avatarBg: 'bg-violet-700'  },
  { initials: 'YM', name: 'Yassir Moktari', time: '14:00 – 15:30 · City',     status: '14:00',    statusClass: 'bg-blue-600/15 text-blue-300',       barColor: 'bg-blue-500',    avatarBg: 'bg-blue-700'    },
  { initials: 'SM', name: 'Sara Moussaoui', time: '15:30 – 17:00 · Route B',  status: '15:30',    statusClass: 'bg-amber-500/15 text-amber-300',     barColor: 'bg-amber-500',   avatarBg: 'bg-amber-700'   },
];

export const TodaySchedule = () => (
  <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4
    hover:border-white/[0.11] transition-colors flex flex-col">
    <div className="flex items-start justify-between mb-3">
      <div>
        <div className="font-sora text-[13px] font-bold text-white">Today's schedule</div>
        <div className="text-[10px] text-white/30 mt-0.5 font-dm">31 lessons · 6 live</div>
      </div>
      <span className="text-[10px] font-semibold px-2 py-1 rounded-lg
        bg-emerald-500/12 text-emerald-400 border border-emerald-500/20 font-dm">
        90% done
      </span>
    </div>

    {/* Progress */}
    <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden mb-4">
      <div className="h-full w-[90%] rounded-full bg-gradient-to-r from-emerald-500 to-blue-500" />
    </div>

    {/* Rows */}
    <div className="flex flex-col flex-1">
      {SCHEDULE.map((s) => (
        <div key={s.name}
          className="flex items-center gap-2 py-2 border-b border-white/[0.04] last:border-0">
          <div className={`w-0.5 self-stretch rounded-full flex-shrink-0 ${s.barColor}`} />
          <div className={`w-6 h-6 rounded-[7px] flex items-center justify-center
            text-[9px] font-bold text-white flex-shrink-0 ${s.avatarBg}`}>
            {s.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-white/80 truncate font-dm">{s.name}</div>
            <div className="text-[9px] text-white/30 mt-0.5 font-dm">{s.time}</div>
          </div>
          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0 font-dm ${s.statusClass}`}>
            {s.status}
          </span>
        </div>
      ))}
    </div>

    <button className="mt-3 w-full py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl
      text-[11px] font-semibold text-blue-400 hover:bg-blue-600/18 hover:text-white
      transition-all duration-200 font-dm">
      View all 31 lessons →
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────
// STUDENT PROGRESS TABLE
// ─────────────────────────────────────────────────────────────
const STUDENTS = [
  { initials: 'KB', name: 'Karim B.',  lessons: 14, progress: 87,  status: 'On track',    statusClass: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20', barColor: 'bg-emerald-500', avatarBg: 'bg-blue-700'    },
  { initials: 'LO', name: 'Lina O.',   lessons: 8,  progress: 55,  status: 'In progress', statusClass: 'bg-blue-600/12 text-blue-400 border-blue-500/20',           barColor: 'bg-blue-500',    avatarBg: 'bg-violet-700'  },
  { initials: 'YM', name: 'Yassir M.', lessons: 20, progress: 100, status: 'Passed ✓',   statusClass: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20',   barColor: 'bg-emerald-500', avatarBg: 'bg-emerald-700' },
  { initials: 'SM', name: 'Sara M.',   lessons: 3,  progress: 18,  status: 'New',         statusClass: 'bg-amber-500/12 text-amber-400 border-amber-500/20',         barColor: 'bg-amber-500',   avatarBg: 'bg-amber-700'   },
  { initials: 'HA', name: 'Hassan A.', lessons: 11, progress: 70,  status: 'In progress', statusClass: 'bg-blue-600/12 text-blue-400 border-blue-500/20',           barColor: 'bg-blue-500',    avatarBg: 'bg-teal-700'    },
];

export const StudentTable = () => (
  <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4
    hover:border-white/[0.11] transition-colors">
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="font-sora text-[13px] font-bold text-white">Student progress</div>
        <div className="text-[10px] text-white/30 mt-0.5 font-dm">Top active this week</div>
      </div>
      <span className="text-[10px] font-semibold px-2 py-1 rounded-lg
        bg-blue-600/12 text-blue-400 border border-blue-500/20 font-dm">
        142 total
      </span>
    </div>

    <table className="w-full border-collapse">
      <thead>
        <tr>
          {['STUDENT', 'LESSONS', 'PROGRESS', 'STATUS'].map(h => (
            <th key={h} className="pb-2.5 text-left text-[9px] font-bold text-white/25
              tracking-[0.6px] border-b border-white/[0.06] px-2 font-dm">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {STUDENTS.map((s) => (
          <tr key={s.name}
            className="border-b border-white/[0.03] last:border-0
              hover:bg-white/[0.02] transition-colors group cursor-default">
            <td className="py-2.5 px-2">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-[6px] flex items-center justify-center
                  text-[8px] font-bold text-white flex-shrink-0 ${s.avatarBg}`}>
                  {s.initials}
                </div>
                <span className="text-[11px] font-semibold text-white font-dm">{s.name}</span>
              </div>
            </td>
            <td className="py-2.5 px-2 text-[11px] text-white/50 font-dm">{s.lessons}</td>
            <td className="py-2.5 px-2">
              <div className="flex items-center gap-2">
                <div className="w-12 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.barColor}`}
                    style={{ width: `${s.progress}%` }} />
                </div>
                <span className={`text-[10px] font-semibold font-dm
                  ${s.progress >= 90 ? 'text-emerald-400' : s.progress >= 50 ? 'text-blue-400' : 'text-amber-400'}`}>
                  {s.progress}%
                </span>
              </div>
            </td>
            <td className="py-2.5 px-2">
              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md border font-dm ${s.statusClass}`}>
                {s.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <button className="mt-4 w-full py-2 bg-white/[0.03] border border-white/[0.07]
      rounded-xl text-[11px] font-semibold text-white/40 hover:text-white/70
      hover:bg-white/[0.05] transition-all duration-200 font-dm">
      View all 142 students →
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────
// INSTRUCTORS PANEL
// ─────────────────────────────────────────────────────────────
const INSTRUCTORS = [
  { initials: 'MA', name: 'Mohamed A.', sub: '5 lessons today', rating: '4.9', avail: 'green',  bg: 'bg-blue-700'    },
  { initials: 'FA', name: 'Fatima A.',  sub: '4 lessons today', rating: '4.8', avail: 'green',  bg: 'bg-violet-700'  },
  { initials: 'YB', name: 'Youssef B.', sub: 'On break · 3 done',rating: '4.7',avail: 'amber',  bg: 'bg-emerald-700' },
  { initials: 'NM', name: 'Nadia M.',   sub: 'Available',       rating: '4.9', avail: 'green',  bg: 'bg-amber-700'   },
];

const AVAIL_COLORS = {
  green: 'bg-emerald-400',
  amber: 'bg-amber-400',
  red:   'bg-red-400',
};

const QUICK_ACTIONS = [
  { label: 'Add lesson',  cls: 'bg-blue-600/18 text-blue-300 hover:bg-blue-600/30 hover:text-white',
    icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { label: 'Add student', cls: 'bg-violet-600/18 text-violet-300 hover:bg-violet-600/30 hover:text-white',
    icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.3" stroke="currentColor" strokeWidth="1.2"/><path d="M1 11c0-2.5 2.2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
  { label: 'Schedule',    cls: 'bg-emerald-600/14 text-emerald-300 hover:bg-emerald-600/25 hover:text-white',
    icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1.5" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 4.5h10M3.5 1v1.5M8.5 1v1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg> },
  { label: 'Invoice',     cls: 'bg-amber-600/14 text-amber-300 hover:bg-amber-600/25 hover:text-white',
    icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1.5" y="1" width="9" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M3.5 4h5M3.5 6.5h5M3.5 9h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg> },
];

export const InstructorsPanel = () => (
  <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4
    hover:border-white/[0.11] transition-colors">
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="font-sora text-[13px] font-bold text-white">Instructors</div>
        <div className="text-[10px] text-white/30 mt-0.5 font-dm">6 active today</div>
      </div>
      <span className="text-[10px] font-semibold px-2 py-1 rounded-lg
        bg-emerald-500/12 text-emerald-400 border border-emerald-500/20 font-dm">
        All available
      </span>
    </div>

    <div className="flex flex-col gap-0">
      {INSTRUCTORS.map((inst) => (
        <div key={inst.name}
          className="flex items-center gap-3 py-2.5 border-b border-white/[0.04]
            last:border-0 hover:bg-white/[0.02] -mx-1 px-1 rounded-lg transition-colors cursor-default">
          <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center
            text-[10px] font-bold text-white flex-shrink-0 ${inst.bg}`}>
            {inst.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-white/80 font-dm">{inst.name}</div>
            <div className="text-[9px] text-white/30 mt-0.5 font-dm">{inst.sub}</div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-sora text-[12px] font-bold text-white">{inst.rating}★</div>
            <div className="text-[9px] text-white/25 font-dm">Rating</div>
          </div>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${AVAIL_COLORS[inst.avail]}`} />
        </div>
      ))}
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

// ─────────────────────────────────────────────────────────────
// COMPLETION DONUT
// ─────────────────────────────────────────────────────────────
export const CompletionDonut = () => (
  <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4
    hover:border-white/[0.11] transition-colors">
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="font-sora text-[13px] font-bold text-white">Completion rate</div>
        <div className="text-[10px] text-white/30 mt-0.5 font-dm">Today's lessons</div>
      </div>
      <span className="text-[10px] font-semibold px-2 py-1 rounded-lg
        bg-emerald-500/12 text-emerald-400 border border-emerald-500/20 font-dm">
        90%
      </span>
    </div>

    {/* SVG donut */}
    <div className="relative w-24 h-24 mx-auto mb-4">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="36" fill="none"
          stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
        {/* Completed — green */}
        <circle cx="48" cy="48" r="36" fill="none"
          stroke="#10B981" strokeWidth="12"
          strokeDasharray="204 226" strokeDashoffset="57"
          strokeLinecap="round" />
        {/* In progress — blue */}
        <circle cx="48" cy="48" r="36" fill="none"
          stroke="#3B82F6" strokeWidth="12"
          strokeDasharray="17 226" strokeDashoffset="-147"
          strokeLinecap="round" />
        {/* Pending — amber */}
        <circle cx="48" cy="48" r="36" fill="none"
          stroke="rgba(245,158,11,0.7)" strokeWidth="12"
          strokeDasharray="5 226" strokeDashoffset="-164"
          strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-sora text-[18px] font-black text-white tracking-tight">90%</span>
        <span className="text-[8px] text-white/30 font-dm">done</span>
      </div>
    </div>

    {/* Legend */}
    <div className="flex flex-col gap-2">
      {[
        { color: 'bg-emerald-500', label: 'Completed',   value: 28 },
        { color: 'bg-blue-500',    label: 'Live now',     value: 2  },
        { color: 'bg-amber-500/70',label: 'Upcoming',    value: 1  },
      ].map((item) => (
        <div key={item.label} className="flex items-center justify-between text-[10px] font-dm">
          <div className="flex items-center gap-2 text-white/50">
            <div className={`w-1.5 h-1.5 rounded-sm ${item.color}`} />
            {item.label}
          </div>
          <span className="font-semibold text-white">{item.value}</span>
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// LIVE ACTIVITY FEED
// ─────────────────────────────────────────────────────────────
const ACTIVITY = [
  { type: 'green',  title: 'Lesson completed',  desc: 'Karim B. finished Route A with Mohamed A.', time: '2m ago',
    icon: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { type: 'blue',   title: 'Payment received',  desc: 'Sara M. paid 850 MAD invoice', time: '14m ago',
    icon: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4h6M2 6.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
  { type: 'purple', title: 'New student',       desc: 'Hassan A. enrolled in the school', time: '1h ago',
    icon: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.1"/><path d="M1 9.5c0-2 1.8-3 4-3s4 1 4 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg> },
  { type: 'amber',  title: '5★ review',         desc: '"Best school in Casablanca!"', time: '2h ago',
    icon: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1l1.2 3.2H9L6.5 6l1 3L5 7.5 2.5 9l1-3L1 4.2h2.8z" stroke="currentColor" strokeWidth="1.1"/></svg> },
];

const ICON_STYLES = {
  green:  'bg-emerald-500/15 text-emerald-400',
  blue:   'bg-blue-600/18 text-blue-400',
  purple: 'bg-violet-600/18 text-violet-400',
  amber:  'bg-amber-500/15 text-amber-400',
};

export const ActivityFeed = () => (
  <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4
    hover:border-white/[0.11] transition-colors flex-1">
    <div className="flex items-center gap-2 mb-4">
      <div className="font-sora text-[13px] font-bold text-white">Live activity</div>
      <div className="flex items-center gap-1.5 ml-auto">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] text-emerald-400 font-semibold font-dm">Live</span>
      </div>
    </div>

    <div className="flex flex-col gap-0">
      {ACTIVITY.map((item) => (
        <div key={item.title}
          className="flex items-start gap-2.5 py-2.5 border-b border-white/[0.03]
            last:border-0">
          <div className={`w-6 h-6 rounded-[7px] flex items-center justify-center
            flex-shrink-0 mt-0.5 ${ICON_STYLES[item.type]}`}>
            {item.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-white/80 font-dm">{item.title}</div>
            <div className="text-[10px] text-white/40 mt-0.5 leading-relaxed font-dm truncate">{item.desc}</div>
          </div>
          <div className="text-[9px] text-white/25 flex-shrink-0 mt-0.5 font-dm">{item.time}</div>
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// PERFORMANCE SUMMARY
// ─────────────────────────────────────────────────────────────
export const PerformanceSummary = () => (
  <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4
    hover:border-white/[0.11] transition-colors">
    <div className="font-sora text-[13px] font-bold text-white mb-4">School performance</div>

    {/* Ring */}
    <div className="relative w-28 h-28 mx-auto mb-5">
      <svg width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r="44" fill="none"
          stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
        <circle cx="56" cy="56" r="44" fill="none"
          stroke="url(#perfGrad)" strokeWidth="10"
          strokeDasharray="247 276" strokeDashoffset="69"
          strokeLinecap="round" />
        <defs>
          <linearGradient id="perfGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-sora text-[22px] font-black text-white tracking-tight">97%</span>
        <span className="text-[9px] text-white/30 font-dm">pass rate</span>
      </div>
    </div>

    {/* Stats grid */}
    <div className="grid grid-cols-2 gap-2">
      {[
        { v: '#1', l: 'City rank', c: 'text-amber-400' },
        { v: '4.9★', l: 'Rating', c: 'text-white' },
        { v: '3 yrs', l: 'On DriveIQ', c: 'text-white' },
        { v: '142', l: 'Students', c: 'text-white' },
      ].map((s) => (
        <div key={s.l}
          className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2.5">
          <div className={`font-sora text-[14px] font-bold tracking-tight ${s.c}`}>{s.v}</div>
          <div className="text-[9px] text-white/25 mt-0.5 font-dm">{s.l}</div>
        </div>
      ))}
    </div>
  </div>
);