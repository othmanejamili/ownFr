import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

/* ═══════════════════════════════════════════════════════════════
   DashboardComponents.jsx — School Owner Dashboard
   All data is dynamic; no static fallbacks in rendered output.

   API shapes used:
   ─ overview  (/api/dashboard/overview/)  dashboard_type: 'school_owner'
     {
       overview: { total_schools, total_students, active_students, total_instructors },
       this_week_performance: { total_lessons, completed_lessons, completion_rate,
                                 total_revenue, avg_completion_rate },
       today: { scheduled_lessons, completed_lessons },
       schools: [{ school_id, school_name, total_students, active_students,
                   completion_rate, average_rating, last_updated }],
       best_performing_school: { ... same shape ... },
       user: { id, name, role }
     }

   ─ quickStats  (/api/dashboard/quick-stats/)
     {
       user_role, stats: {
         my_schools, total_students, active_students, today_lessons
       }
     }

   ─ analytics  (/api/schoolanalytics/dashboard/?school_id=X&date_range=week)
     {
       lesson_trends: [{ day, scheduled, completed }],
       revenue_trends: [{ day, revenue }],
       top_students:   [{ student_name, lessons_completed, progress }],
       instructors:    [{ instructor_name, lessons_today, rating, status }],
       pass_rate, avg_rating, completion_rate, total_revenue,
       completed_today, in_progress_today, pending_today
     }

   ─ notifications  (/api/dashboard/notifications/)
     [{ type, title, message, priority, timestamp, school_id?, lesson_id? }]
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
            ? p.value.toLocaleString() : p.value}
          {suffix}
        </div>
      ))}
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────
const fmt = (val, fallback = 0) => { const n = Number(val); return isNaN(n) ? fallback : n; };
const fmtK = (val) => {
  const n = fmt(val);
  if (n === 0) return '0';
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
};
const timeAgo = (ts) => {
  if (!ts) return '';
  const d = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
};
const initials = (name = '') =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
const avatarBgs = [
  'bg-blue-700','bg-violet-700','bg-emerald-700','bg-amber-700',
  'bg-teal-700','bg-rose-700','bg-cyan-700',
];

// ═════════════════════════════════════════════════════════════
// KPI STRIP
// ═════════════════════════════════════════════════════════════
const KpiCard = ({ value, label, delta, deltaType = 'up', accentClass, iconBg, iconColor, icon, loading }) => {
  const glowMap  = { blue:'rgba(37,99,235,0.12)',purple:'rgba(124,58,237,0.12)',green:'rgba(16,185,129,0.10)',amber:'rgba(245,158,11,0.10)' };
  const lineMap  = { blue:'after:via-blue-400',purple:'after:via-violet-400',green:'after:via-emerald-400',amber:'after:via-amber-400' };
  const dStyle   = { up:'bg-emerald-500/12 text-emerald-400', down:'bg-red-500/12 text-red-400', neu:'bg-blue-600/12 text-blue-400' };
  return (
    <div className={[
      'relative bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] px-5 py-4 overflow-hidden cursor-default',
      'transition-all duration-250 hover:border-white/[0.13] hover:-translate-y-0.5',
      'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5',
      'after:bg-gradient-to-r after:from-transparent after:to-transparent',
      lineMap[accentClass] ?? '',
    ].join(' ')}>
      <div className="absolute w-24 h-24 rounded-full -top-8 -right-5 pointer-events-none"
        style={{ background:`radial-gradient(circle, ${glowMap[accentClass]??'transparent'} 0%, transparent 70%)` }} />
      <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center mb-3 ${iconBg} ${iconColor}`}>{icon}</div>
      {loading ? (
        <><Skeleton className="h-8 w-20 mb-2"/><Skeleton className="h-3 w-28 mb-3"/><Skeleton className="h-4 w-16 rounded-full"/></>
      ) : (
        <>
          <div className="font-sora text-[30px] font-black text-white tracking-[-1.2px] leading-none mb-1">{value}</div>
          <div className="text-[11px] text-white/30 font-dm mb-2">{label}</div>
          <div className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full font-dm ${dStyle[deltaType]}`}>{delta}</div>
        </>
      )}
    </div>
  );
};

export const KpiStrip = ({ quickStats, overview, loading }) => {
  const stats          = quickStats?.stats ?? {};
  const totalStudents  = fmt(stats.total_students   ?? overview?.overview?.total_students);
  const activeStudents = fmt(stats.active_students  ?? overview?.overview?.active_students);
  const mySchools      = fmt(stats.my_schools       ?? overview?.overview?.total_schools);
  const todayLessons   = fmt(stats.today_lessons    ?? overview?.today?.scheduled_lessons);
  const weekRevenue    = fmt(overview?.this_week_performance?.total_revenue);
  const weekCompletion = fmt(overview?.this_week_performance?.completion_rate);

  const cards = [
    {
      value: loading ? '—' : String(mySchools),
      label: 'My schools',
      delta: mySchools > 0 ? `${mySchools} active` : 'No schools yet',
      deltaType: 'neu',
      accentClass: 'blue',
      iconBg: 'bg-blue-600/18', iconColor: 'text-blue-400',
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 13V6l6-4 6 4v7" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><rect x="5" y="9" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.1"/></svg>,
    },
    {
      value: loading ? '—' : String(totalStudents),
      label: 'Total students',
      delta: activeStudents > 0 ? `${activeStudents} active` : '—',
      deltaType: 'up',
      accentClass: 'purple',
      iconBg: 'bg-violet-600/18', iconColor: 'text-violet-400',
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="4.5" r="2.8" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 13c0-3 2.5-4.5 5.5-4.5S12 10 12 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
    },
    {
      value: loading ? '—' : String(todayLessons),
      label: 'Lessons today',
      delta: overview?.today?.completed_lessons != null
        ? `${overview.today.completed_lessons} completed`
        : '—',
      deltaType: 'neu',
      accentClass: 'green',
      iconBg: 'bg-emerald-600/15', iconColor: 'text-emerald-400',
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 5h12M4 1v2M10 1v2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>,
    },
    {
      value: loading ? '—' : weekRevenue > 0 ? fmtK(weekRevenue) : '—',
      label: 'Revenue (MAD)',
      delta: weekCompletion > 0 ? `${weekCompletion}% completion` : '—',
      deltaType: 'up',
      accentClass: 'amber',
      iconBg: 'bg-amber-600/15', iconColor: 'text-amber-400',
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M7 4v6M5 8.5c0 .8.9 1.5 2 1.5s2-.7 2-1.5-1-1.5-2-1.5-2-.7-2-1.5S6.1 4 7 4s2 .7 2 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(c => <KpiCard key={c.label} {...c} loading={loading} />)}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// LESSON ACTIVITY CHART  — from analytics.lesson_trends
// ═════════════════════════════════════════════════════════════
export const LessonChart = ({ analytics, overview, loading }) => {
  const trends = analytics?.lesson_trends ?? [];
  const rate   = fmt(analytics?.lesson_completion_rate ?? overview?.this_week_performance?.completion_rate);

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.11] transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Lesson activity</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">Completed vs scheduled</div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-emerald-500/12 text-emerald-400 border border-emerald-500/20 font-dm">
          {loading ? '…' : rate > 0 ? `${rate}% completion` : '—'}
        </span>
      </div>

      {loading ? (
        <Skeleton className="w-full h-[130px] rounded-xl" />
      ) : trends.length > 0 ? (
        <ResponsiveContainer width="100%" height={130}>
          <LineChart data={trends} margin={{ top:5,right:5,bottom:0,left:-20 }}>
            <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.04)" vertical={false}/>
            <XAxis dataKey="day" tick={{ fill:'rgba(240,244,255,0.28)',fontSize:10,fontFamily:'DM Sans' }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill:'rgba(240,244,255,0.28)',fontSize:10,fontFamily:'DM Sans' }} axisLine={false} tickLine={false}/>
            <Tooltip content={<ChartTooltip/>}/>
            <Line type="monotone" dataKey="scheduled" name="Scheduled" stroke="#3B82F6" strokeWidth={2} dot={{ r:3,fill:'#3B82F6',strokeWidth:2,stroke:'#0F1A2E' }} activeDot={{ r:5 }}/>
            <Line type="monotone" dataKey="completed" name="Completed" stroke="#10B981" strokeWidth={2} dot={{ r:3,fill:'#10B981',strokeWidth:2,stroke:'#0F1A2E' }} activeDot={{ r:5 }}/>
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[130px] flex items-center justify-center text-[11px] text-white/25 font-dm">
          No lesson trend data yet
        </div>
      )}

      <div className="flex gap-4 mt-2">
        {[['#3B82F6','Scheduled'],['#10B981','Completed']].map(([color,label]) => (
          <div key={label} className="flex items-center gap-1.5 text-[10px] text-white/35 font-dm">
            <div className="w-4 h-0.5 rounded" style={{ background:color }}/>{label}
          </div>
        ))}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// REVENUE CHART  — from analytics.revenue_trends
// ═════════════════════════════════════════════════════════════
export const RevenueChart = ({ analytics, overview, loading }) => {
  const trends   = analytics?.revenue_trends ?? [];
  const totalRev = fmt(analytics?.total_revenue ?? overview?.this_week_performance?.total_revenue);
  const maxVal   = trends.length ? Math.max(...trends.map(d => fmt(d.revenue ?? d.value ?? d.amount))) : 0;

  const normalised = trends.map(d => ({
    day:   d.day ?? d.date ?? d.period ?? '—',
    value: fmt(d.revenue ?? d.value ?? d.amount),
  }));

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.11] transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Revenue breakdown</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">Earnings (MAD)</div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-blue-600/12 text-blue-400 border border-blue-500/20 font-dm">
          {loading ? '…' : totalRev > 0 ? `${totalRev.toLocaleString()} MAD` : '—'}
        </span>
      </div>

      {loading ? (
        <Skeleton className="w-full h-[130px] rounded-xl" />
      ) : normalised.length > 0 ? (
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={normalised} margin={{ top:5,right:5,bottom:0,left:-20 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.04)" vertical={false}/>
            <XAxis dataKey="day" tick={{ fill:'rgba(240,244,255,0.28)',fontSize:10,fontFamily:'DM Sans' }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill:'rgba(240,244,255,0.28)',fontSize:10,fontFamily:'DM Sans' }} axisLine={false} tickLine={false} tickFormatter={v => v>=1000?`${v/1000}k`:v}/>
            <Tooltip content={<ChartTooltip suffix=" MAD"/>}/>
            <Bar dataKey="value" name="Revenue" radius={[4,4,0,0]}>
              {normalised.map((entry,i) => (
                <Cell key={i} fill={entry.value===maxVal?'rgba(37,99,235,0.9)':'rgba(37,99,235,0.3)'}/>
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[130px] flex items-center justify-center text-[11px] text-white/25 font-dm">
          No revenue data yet
        </div>
      )}

      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-white/30 font-dm">
          {maxVal > 0 ? `Peak: ${normalised.find(d=>d.value===maxVal)?.day} · ${maxVal.toLocaleString()} MAD` : ''}
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

// ═════════════════════════════════════════════════════════════
// TODAY'S SCHEDULE  — from overview.today (owner has counts, not lesson list)
// ═════════════════════════════════════════════════════════════
export const TodaySchedule = ({ overview, loading }) => {
  const today          = overview?.today ?? {};
  const totalToday     = fmt(today.scheduled_lessons);
  const completedToday = fmt(today.completed_lessons);
  const pct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  // Owner overview doesn't return a lessons array — show per-school summary instead
  const schools = overview?.schools ?? [];

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.11] transition-colors flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Today's overview</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">
            {loading ? '…' : `${totalToday} lessons scheduled`}
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
            style={{ width:`${pct}%` }}/>
        </div>
      )}

      {/* Summary counts */}
      {!loading && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label:'Scheduled', value:totalToday,     color:'text-white' },
            { label:'Completed', value:completedToday, color:'text-emerald-400' },
          ].map(item => (
            <div key={item.label} className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2.5">
              <div className={`font-sora text-[20px] font-black tracking-tight ${item.color}`}>{item.value}</div>
              <div className="text-[9px] text-white/25 font-dm">{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Per-school breakdown */}
      <div className="flex flex-col flex-1">
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="flex items-center gap-2 py-2 border-b border-white/[0.04] last:border-0">
              <Skeleton className="w-0.5 h-8 rounded-full flex-shrink-0"/>
              <div className="flex-1 space-y-1"><Skeleton className="h-3 w-24"/><Skeleton className="h-2 w-32"/></div>
              <Skeleton className="h-4 w-12 rounded-md"/>
            </div>
          ))
        ) : schools.length > 0 ? (
          schools.slice(0,4).map((school, i) => (
            <div key={school.school_id ?? i} className="flex items-center gap-2 py-2 border-b border-white/[0.04] last:border-0">
              <div className={`w-0.5 self-stretch rounded-full flex-shrink-0 ${avatarBgs[i%avatarBgs.length].replace('bg-','bg-').replace('700','500')}`}
                style={{ background: ['#3B82F6','#8B5CF6','#10B981','#F59E0B'][i%4] }}/>
              <div className={`w-6 h-6 rounded-[7px] flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 ${avatarBgs[i%avatarBgs.length]}`}>
                {initials(school.school_name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-white/80 truncate font-dm">{school.school_name}</div>
                <div className="text-[9px] text-white/30 mt-0.5 font-dm">
                  {school.active_students} active · {fmt(school.completion_rate)}% completion
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-sora text-[11px] font-bold text-amber-400">
                  {school.average_rating > 0 ? `${fmt(school.average_rating).toFixed(1)}★` : '—'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center py-4">
            <div className="text-[11px] text-white/30 font-dm">No schools yet</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// SCHOOL PERFORMANCE TABLE  — from overview.schools[]
// ═════════════════════════════════════════════════════════════
const progressColor = (pct) => pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-500';
const progressTxt   = (pct) => pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-blue-400' : 'text-amber-400';

export const SchoolTable = ({ overview, loading }) => {
  const schools = overview?.schools ?? [];

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.11] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Schools performance</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">Ranked by completion</div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-blue-600/12 text-blue-400 border border-blue-500/20 font-dm">
          {loading ? '…' : `${schools.length} school${schools.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            {['SCHOOL','STUDENTS','COMPLETION','RATING'].map(h => (
              <th key={h} className="pb-2.5 text-left text-[9px] font-bold text-white/25 tracking-[0.6px] border-b border-white/[0.06] px-2 font-dm">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [1,2,3,4].map(i => (
              <tr key={i}>
                <td className="py-2.5 px-2"><div className="flex items-center gap-2"><Skeleton className="w-6 h-6 rounded-[6px]"/><Skeleton className="h-3 w-20"/></div></td>
                <td className="py-2.5 px-2"><Skeleton className="h-3 w-8"/></td>
                <td className="py-2.5 px-2"><Skeleton className="h-2 w-16 rounded-full"/></td>
                <td className="py-2.5 px-2"><Skeleton className="h-3 w-8"/></td>
              </tr>
            ))
          ) : schools.length > 0 ? (
            schools.map((school, i) => {
              const cr = fmt(school.completion_rate);
              return (
                <tr key={school.school_id ?? i}
                  className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors cursor-default">
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-[6px] flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0 ${avatarBgs[i%avatarBgs.length]}`}>
                        {initials(school.school_name)}
                      </div>
                      <span className="text-[11px] font-semibold text-white font-dm truncate max-w-[100px]">
                        {school.school_name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="text-[11px] text-white/70 font-dm">{school.active_students}<span className="text-white/30">/{school.total_students}</span></div>
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${progressColor(cr)}`} style={{ width:`${Math.min(cr,100)}%` }}/>
                      </div>
                      <span className={`text-[10px] font-semibold font-dm ${progressTxt(cr)}`}>{cr}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="text-[11px] font-semibold text-amber-400 font-dm">
                      {school.average_rating > 0 ? `${fmt(school.average_rating).toFixed(1)}★` : '—'}
                    </span>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr><td colSpan={4} className="py-8 text-center text-[11px] text-white/30 font-dm">No schools yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// STUDENT PROGRESS TABLE  — from analytics.top_students
// ═════════════════════════════════════════════════════════════
const studentStatus = (s) => {
  const p = fmt(s.progress ?? s.completion_rate ?? 0);
  if (p >= 100) return { label:'Passed ✓',    cls:'bg-emerald-500/12 text-emerald-400 border-emerald-500/20' };
  if (p >= 70)  return { label:'On track',    cls:'bg-emerald-500/12 text-emerald-400 border-emerald-500/20' };
  if (p >= 30)  return { label:'In progress', cls:'bg-blue-600/12 text-blue-400 border-blue-500/20' };
  return               { label:'Starting',    cls:'bg-amber-500/12 text-amber-400 border-amber-500/20' };
};

export const StudentTable = ({ analytics, loading }) => {
  const students = analytics?.top_students ?? analytics?.students ?? [];

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.11] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Top students</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">Active this week</div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-blue-600/12 text-blue-400 border border-blue-500/20 font-dm">
          {loading ? '…' : `${students.length} shown`}
        </span>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            {['STUDENT','LESSONS','PROGRESS','STATUS'].map(h => (
              <th key={h} className="pb-2.5 text-left text-[9px] font-bold text-white/25 tracking-[0.6px] border-b border-white/[0.06] px-2 font-dm">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [1,2,3,4,5].map(i => (
              <tr key={i}>
                <td className="py-2.5 px-2"><div className="flex items-center gap-2"><Skeleton className="w-6 h-6 rounded-[6px]"/><Skeleton className="h-3 w-20"/></div></td>
                <td className="py-2.5 px-2"><Skeleton className="h-3 w-6"/></td>
                <td className="py-2.5 px-2"><Skeleton className="h-2 w-16 rounded-full"/></td>
                <td className="py-2.5 px-2"><Skeleton className="h-4 w-16 rounded-md"/></td>
              </tr>
            ))
          ) : students.length > 0 ? (
            students.slice(0,5).map((s,i) => {
              const name    = s.student_name ?? s.name ?? `Student ${i+1}`;
              const lessons = fmt(s.lessons_completed ?? s.total_lessons ?? 0);
              const prog    = fmt(s.progress ?? s.completion_rate ?? 0);
              const st      = studentStatus(s);
              return (
                <tr key={s.id??i} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors cursor-default">
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-[6px] flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0 ${avatarBgs[i%avatarBgs.length]}`}>
                        {initials(name)}
                      </div>
                      <span className="text-[11px] font-semibold text-white font-dm">
                        {name.split(' ')[0]} {name.split(' ')[1]?.[0]??''}.
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-[11px] text-white/50 font-dm">{lessons}</td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${progressColor(prog)}`} style={{ width:`${Math.min(prog,100)}%` }}/>
                      </div>
                      <span className={`text-[10px] font-semibold font-dm ${progressTxt(prog)}`}>{prog}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md border font-dm ${st.cls}`}>{st.label}</span>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr><td colSpan={4} className="py-8 text-center text-[11px] text-white/30 font-dm">No student data yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// INSTRUCTORS PANEL  — from analytics.instructors
// ═════════════════════════════════════════════════════════════
const availColor = (inst) => {
  const s = (inst.status ?? inst.availability ?? '').toLowerCase();
  if (s.includes('break') || s.includes('busy')) return 'bg-amber-400';
  if (s.includes('unavail') || s.includes('off')) return 'bg-red-400';
  return 'bg-emerald-400';
};

const QUICK_ACTIONS = [
  { label:'Add lesson',   cls:'bg-blue-600/18 text-blue-300 hover:bg-blue-600/30 hover:text-white',
    icon:<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { label:'Add student',  cls:'bg-violet-600/18 text-violet-300 hover:bg-violet-600/30 hover:text-white',
    icon:<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.3" stroke="currentColor" strokeWidth="1.2"/><path d="M1 11c0-2.5 2.2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
  { label:'Schedule',     cls:'bg-emerald-600/14 text-emerald-300 hover:bg-emerald-600/25 hover:text-white',
    icon:<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1.5" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 4.5h10M3.5 1v1.5M8.5 1v1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg> },
  { label:'Invoice',      cls:'bg-amber-600/14 text-amber-300 hover:bg-amber-600/25 hover:text-white',
    icon:<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1.5" y="1" width="9" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M3.5 4h5M3.5 6.5h5M3.5 9h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg> },
];

export const InstructorsPanel = ({ analytics, loading }) => {
  const instructors = analytics?.instructors ?? analytics?.top_instructors ?? [];

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.11] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Instructors</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">
            {loading ? '…' : `${instructors.length} active`}
          </div>
        </div>
        {!loading && instructors.length > 0 && (
          <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-emerald-500/12 text-emerald-400 border border-emerald-500/20 font-dm">
            {instructors.filter(i => availColor(i) === 'bg-emerald-400').length} available
          </span>
        )}
      </div>

      <div className="flex flex-col">
        {loading ? (
          [1,2,3,4].map(i => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
              <Skeleton className="w-8 h-8 rounded-[9px] flex-shrink-0"/>
              <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-24"/><Skeleton className="h-2 w-28"/></div>
              <Skeleton className="h-4 w-8"/>
              <Skeleton className="w-2 h-2 rounded-full flex-shrink-0"/>
            </div>
          ))
        ) : instructors.length > 0 ? (
          instructors.slice(0,4).map((inst,i) => {
            const name    = inst.instructor_name ?? inst.name ?? `Instructor ${i+1}`;
            const lessons = fmt(inst.lessons_today ?? inst.today_lessons ?? 0);
            const rating  = inst.rating ?? inst.avg_rating;
            return (
              <div key={inst.id??i}
                className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] -mx-1 px-1 rounded-lg transition-colors cursor-default">
                <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${avatarBgs[i%avatarBgs.length]}`}>
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
                    {rating != null ? `${Number(rating).toFixed(1)}★` : '—'}
                  </div>
                  <div className="text-[9px] text-white/25 font-dm">Rating</div>
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${availColor(inst)}`}/>
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center text-[11px] text-white/30 font-dm">No instructors yet</div>
        )}
      </div>

      <div className="mt-4 pt-3.5 border-t border-white/[0.05]">
        <div className="text-[9px] font-bold text-white/20 tracking-[0.7px] mb-2.5 font-dm">QUICK ACTIONS</div>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map(qa => (
            <button key={qa.label}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-[10px] font-semibold transition-all duration-200 font-dm ${qa.cls}`}>
              {qa.icon}{qa.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// COMPLETION DONUT  — from analytics or overview
// ═════════════════════════════════════════════════════════════
export const CompletionDonut = ({ overview, analytics, loading }) => {
  const completed  = fmt(analytics?.completed_today  ?? overview?.today?.completed_lessons);
  const inProgress = fmt(analytics?.in_progress_today ?? 0);
  const scheduled  = fmt(analytics?.pending_today ?? overview?.today?.scheduled_lessons);
  const pending    = Math.max(0, scheduled - completed - inProgress);
  const total      = completed + inProgress + pending;
  const pct        = total > 0 ? Math.round((completed / total) * 100) : 0;

  const r = 36, circ = 2 * Math.PI * r;
  const compArc = total > 0 ? (completed  / total) * circ : 0;
  const progArc = total > 0 ? (inProgress / total) * circ : 0;
  const gap = 2;

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.11] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">Completion rate</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">Today's lessons</div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-emerald-500/12 text-emerald-400 border border-emerald-500/20 font-dm">
          {loading ? '…' : `${pct}%`}
        </span>
      </div>

      {loading ? (
        <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4"/>
      ) : (
        <div className="relative w-24 h-24 mx-auto mb-4">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12"/>
            {compArc > 0 && (
              <circle cx="48" cy="48" r={r} fill="none" stroke="#10B981" strokeWidth="12"
                strokeDasharray={`${compArc-gap} ${circ-compArc+gap}`}
                strokeDashoffset={circ*0.25} strokeLinecap="round"/>
            )}
            {progArc > 0 && (
              <circle cx="48" cy="48" r={r} fill="none" stroke="#3B82F6" strokeWidth="12"
                strokeDasharray={`${progArc-gap} ${circ-progArc+gap}`}
                strokeDashoffset={-(compArc-circ*0.25-gap)} strokeLinecap="round"/>
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
          { color:'bg-emerald-500', label:'Completed',  value:completed  },
          { color:'bg-blue-500',    label:'In progress', value:inProgress },
          { color:'bg-amber-500/70',label:'Upcoming',   value:pending    },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between text-[10px] font-dm">
            <div className="flex items-center gap-2 text-white/50">
              <div className={`w-1.5 h-1.5 rounded-sm ${item.color}`}/>{item.label}
            </div>
            <span className="font-semibold text-white">{loading ? '—' : item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// PERFORMANCE SUMMARY  — from analytics + overview
// ═════════════════════════════════════════════════════════════
export const PerformanceSummary = ({ analytics, overview, loading }) => {
  const passRate   = fmt(analytics?.pass_rate   ?? overview?.this_week_performance?.completion_rate ?? 0);
  const avgRating  = analytics?.avg_rating      ?? overview?.schools?.[0]?.average_rating  ?? null;
  const totalStud  = fmt(analytics?.total_students ?? overview?.overview?.total_students);
  const totalSchools = fmt(overview?.overview?.total_schools);
  const bestSchool   = overview?.best_performing_school?.school_name ?? '—';

  const r = 44, circ = 2 * Math.PI * r;
  const arc = passRate > 0 ? (passRate / 100) * circ : 0;

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.11] transition-colors">
      <div className="font-sora text-[13px] font-bold text-white mb-4">School performance</div>

      {loading ? (
        <Skeleton className="w-28 h-28 rounded-full mx-auto mb-5"/>
      ) : (
        <div className="relative w-28 h-28 mx-auto mb-5">
          <svg width="112" height="112" viewBox="0 0 112 112">
            <defs>
              <linearGradient id="perfGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6"/>
                <stop offset="100%" stopColor="#10B981"/>
              </linearGradient>
            </defs>
            <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10"/>
            {arc > 0 && (
              <circle cx="56" cy="56" r={r} fill="none" stroke="url(#perfGrad)" strokeWidth="10"
                strokeDasharray={`${arc} ${circ-arc}`}
                strokeDashoffset={circ*0.25} strokeLinecap="round"/>
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-sora text-[22px] font-black text-white tracking-tight">
              {passRate > 0 ? `${passRate}%` : '—'}
            </span>
            <span className="text-[9px] text-white/30 font-dm">completion</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {[
          { v:avgRating != null ? `${Number(avgRating).toFixed(1)}★` : '—', l:'Avg rating',   c:'text-amber-400' },
          { v:String(totalStud),                                              l:'Students',     c:'text-white' },
          { v:String(totalSchools),                                           l:'Schools',      c:'text-blue-400' },
          { v:bestSchool.split(' ')[0],                                       l:'Top school',   c:'text-emerald-400' },
        ].map(s => (
          <div key={s.l} className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2.5">
            <div className={`font-sora text-[14px] font-bold tracking-tight ${s.c}`}>{loading?'—':s.v}</div>
            <div className="text-[9px] text-white/25 mt-0.5 font-dm">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// RECENT PAYMENTS  — from overview (owner doesn't have a payments array
//                    in the current backend; we show week revenue summary)
// ═════════════════════════════════════════════════════════════
export const RevenueCard = ({ overview, analytics, loading }) => {
  const weekPerf     = overview?.this_week_performance ?? {};
  const totalRevWeek = fmt(weekPerf.total_revenue);
  const weekLessons  = fmt(weekPerf.total_lessons);
  const weekDone     = fmt(weekPerf.completed_lessons);
  const avgCR        = fmt(weekPerf.avg_completion_rate ?? weekPerf.completion_rate);
  const perLesson    = weekDone > 0 && totalRevWeek > 0
    ? Math.round(totalRevWeek / weekDone)
    : null;

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.11] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-sora text-[13px] font-bold text-white">This week revenue</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-dm">Across all schools</div>
        </div>
      </div>

      {/* Big number */}
      <div className="flex items-baseline gap-2 mb-4 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
        <div>
          <div className="font-sora text-[28px] font-black text-white tracking-tight">
            {loading ? '—' : totalRevWeek > 0 ? totalRevWeek.toLocaleString() : '—'}
          </div>
          <div className="text-[9px] text-white/30 font-dm">MAD this week</div>
        </div>
        {!loading && avgCR > 0 && (
          <div className="ml-auto text-right">
            <div className="font-sora text-[16px] font-black text-emerald-400">{avgCR}%</div>
            <div className="text-[9px] text-white/30 font-dm">avg completion</div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { v:loading?'—':String(weekLessons),       l:'Lessons',       c:'text-white' },
          { v:loading?'—':String(weekDone),            l:'Completed',     c:'text-emerald-400' },
          { v:loading?'—':perLesson ? `${perLesson}` : '—', l:'MAD/lesson', c:'text-blue-400' },
        ].map(s => (
          <div key={s.l} className="bg-white/[0.02] border border-white/[0.04] rounded-xl px-2 py-2">
            <div className={`font-sora text-[14px] font-bold ${s.c}`}>{s.v}</div>
            <div className="text-[9px] text-white/25 font-dm">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Per-school revenue if analytics available */}
      {!loading && analytics?.school_revenue?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/[0.05]">
          <div className="text-[9px] font-bold text-white/20 tracking-[0.7px] mb-2 font-dm">BY SCHOOL</div>
          {analytics.school_revenue.slice(0,3).map((sr, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0">
              <span className="text-[10px] text-white/60 font-dm truncate max-w-[120px]">{sr.school_name ?? sr.name}</span>
              <span className="font-sora text-[12px] font-bold text-emerald-400">
                +{fmt(sr.revenue ?? sr.amount).toLocaleString()} MAD
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// ACTIVITY FEED  — from notifications
// ═════════════════════════════════════════════════════════════
const notifIcon = (type, priority) => {
  const t = (type ?? '').toLowerCase();
  if (t.includes('risk') || priority === 'high')
    return { style:'bg-red-500/15 text-red-400',
      svg:<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1L9.5 9H.5L5 1Z" stroke="currentColor" strokeWidth="1.2"/><path d="M5 4v2M5 7.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> };
  if (t.includes('completion') || t.includes('low') || priority === 'medium')
    return { style:'bg-amber-500/15 text-amber-400',
      svg:<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> };
  return { style:'bg-blue-600/18 text-blue-400',
    svg:<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.1"/><path d="M5 3.5v2M5 7v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> };
};

export const ActivityFeed = ({ notifications, loading }) => {
  const items = notifications ?? [];

  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.11] transition-colors flex-1">
      <div className="flex items-center gap-2 mb-4">
        <div className="font-sora text-[13px] font-bold text-white">Live activity</div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
          <span className="text-[10px] text-emerald-400 font-semibold font-dm">Live</span>
        </div>
      </div>

      <div className="flex flex-col">
        {loading ? (
          [1,2,3,4].map(i => (
            <div key={i} className="flex items-start gap-2.5 py-2.5 border-b border-white/[0.03] last:border-0">
              <Skeleton className="w-6 h-6 rounded-[7px] flex-shrink-0 mt-0.5"/>
              <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-24"/><Skeleton className="h-2 w-36"/></div>
              <Skeleton className="h-2 w-10 flex-shrink-0 mt-1"/>
            </div>
          ))
        ) : items.length > 0 ? (
          items.slice(0,6).map((notif,i) => {
            const ic      = notifIcon(notif.type ?? notif.title, notif.priority);
            const title   = notif.title ?? 'Notification';
            const message = notif.message ?? '';
            const time    = notif.timestamp ? timeAgo(notif.timestamp) : '';
            return (
              <div key={notif.id??i} className="flex items-start gap-2.5 py-2.5 border-b border-white/[0.03] last:border-0">
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