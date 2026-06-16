// src/pages/StudentAttendancePage/StudentAttendancePage.jsx
//
// Student-scoped attendance page.
// Students can: view their own attendance records only.
// Students CANNOT: create, edit, or delete records.
//
// APIs used:
//   GET    /api/attendance/my_attendance/   → personal records + stats
//   GET    /api/attendance/statistics/      → role-based stats

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../Dashboard/Sidebar';

const API = import.meta.env.VITE_API_URL;

/* ─── Auth header ────────────────────────────────────────────── */
const authHeader = () => {
  const token = localStorage.getItem('access') || sessionStorage.getItem('access');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* ─── API layer ──────────────────────────────────────────────── */
const attendanceApi = {
  myAttendance: () =>
    axios.get(`${API}/attendance/my_attendance/`, {
      headers: authHeader(),
    }).then(r => r.data),

  statistics: () =>
    axios.get(`${API}/attendance/statistics/`, {
      headers: authHeader(),
    }).then(r => r.data),
};

/* ─── Helpers ────────────────────────────────────────────────── */
const cls = (...a) => a.filter(Boolean).join(' ');

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const fmtTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  });
};

/* ─── Ring progress ──────────────────────────────────────────── */
const RingProgress = ({ rate = 0, size = 120, stroke = 10 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (rate / 100) * circ;
  const color = rate >= 80 ? '#34d399' : rate >= 60 ? '#f59e0b' : '#f87171';

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }} />
    </svg>
  );
};

/* ─── Spark bar (mini calendar heat strip) ───────────────────── */
const AttendanceStrip = ({ records }) => {
  const last20 = [...records].slice(0, 20).reverse();
  return (
    <div className="flex items-end gap-[3px] h-8">
      {last20.map((r, i) => (
        <div key={i}
          title={`${fmtDate(r.created_at)} — ${r.presence ? 'Present' : 'Absent'}`}
          className={cls(
            'flex-1 rounded-[2px] transition-all',
            r.presence ? 'bg-emerald-400/70' : 'bg-red-400/40',
          )}
          style={{ height: r.presence ? '100%' : '40%' }}
        />
      ))}
      {last20.length === 0 && (
        Array(20).fill(0).map((_, i) => (
          <div key={i} className="flex-1 h-[40%] rounded-[2px] bg-white/[0.05]" />
        ))
      )}
    </div>
  );
};

/* ─── Month tag ──────────────────────────────────────────────── */
const MonthDivider = ({ label }) => (
  <div className="flex items-center gap-3 py-2 px-1">
    <span className="text-[9px] font-black text-white/20 tracking-[1.2px] uppercase">{label}</span>
    <div className="flex-1 h-px bg-white/[0.05]" />
  </div>
);

/* ─── Record card ────────────────────────────────────────────── */
const RecordCard = ({ record }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded(v => !v)}
      className={cls(
        'group relative bg-[#0D1829] border rounded-2xl px-4 py-3.5 cursor-pointer',
        'transition-all duration-200 hover:border-white/[0.12]',
        record.presence
          ? 'border-white/[0.07] hover:bg-emerald-950/20'
          : 'border-white/[0.07] hover:bg-red-950/20',
      )}
    >
      {/* Left accent bar */}
      <div className={cls(
        'absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full',
        record.presence ? 'bg-emerald-400' : 'bg-red-400/60',
      )} />

      <div className="flex items-center gap-3 pl-2">

        {/* Presence dot + icon */}
        <div className={cls(
          'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base',
          record.presence
            ? 'bg-emerald-500/10 border border-emerald-500/20'
            : 'bg-red-500/10 border border-red-500/20',
        )}>
          {record.presence ? '✓' : '✗'}
        </div>

        {/* Lesson info */}
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-white truncate">
            {record.lesson_name || `Lesson #${record.lesson}`}
          </p>
          <p className="text-[10px] text-white/30 mt-0.5">
            {fmtDate(record.created_at)} · {fmtTime(record.created_at)}
          </p>
        </div>

        {/* Hours pill */}
        <div className={cls(
          'flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold',
          record.presence
            ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
            : 'bg-white/[0.04] text-white/20 border border-white/[0.06]',
        )}>
          {record.presence ? `${record.hours_completed}h` : '—'}
        </div>

        {/* Expand arrow */}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
          className={cls('text-white/20 transition-transform flex-shrink-0',
            expanded && 'rotate-180')}>
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Expanded notes */}
      {expanded && (
        <div className="pl-[52px] mt-3 pt-3 border-t border-white/[0.06]">
          {record.notes
            ? <p className="text-[11px] text-white/50 leading-relaxed italic">"{record.notes}"</p>
            : <p className="text-[10px] text-white/20">No notes for this lesson.</p>
          }
          <p className="text-[9px] text-white/15 mt-2 uppercase tracking-[0.6px]">
            Instructor: {record.instructor_name || '—'}
          </p>
        </div>
      )}
    </div>
  );
};

/* ─── Skeleton ───────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-[#0D1829] border border-white/[0.06] rounded-2xl px-4 py-3.5 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-white/[0.05]" />
      <div className="flex-1">
        <div className="h-3 w-48 bg-white/[0.06] rounded-full mb-2" />
        <div className="h-2.5 w-28 bg-white/[0.04] rounded-full" />
      </div>
      <div className="w-10 h-6 rounded-lg bg-white/[0.04]" />
    </div>
  </div>
);

/* ─── Empty ──────────────────────────────────────────────────── */
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
    <div className="text-4xl opacity-30">🎓</div>
    <p className="text-[13px] font-bold text-white/30">No attendance records yet</p>
    <p className="text-[11px] text-white/15 max-w-[240px]">
      Your attendance will appear here once your instructor marks you for a lesson.
    </p>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
const StudentAttendancePage = () => {
  const [records,    setRecords]    = useState([]);
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [filter,     setFilter]     = useState('all'); // 'all' | 'present' | 'absent'
  const [search,     setSearch]     = useState('');

  /* ── fetch ── */
  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await attendanceApi.myAttendance();
      const list = data?.attendance_records ?? [];
      setRecords(list);
      if (data?.statistics) setStats(data.statistics);
    } catch {
      setError('Could not load your attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── derived ── */
  const totalLessons   = stats?.total_lessons   ?? records.length;
  const attended       = stats?.attended        ?? records.filter(r => r.presence).length;
  const missed         = stats?.missed          ?? records.filter(r => !r.presence).length;
  const rate           = stats?.attendance_rate ?? (totalLessons > 0 ? Math.round((attended / totalLessons) * 100) : 0);
  const totalHours     = stats?.total_hours_completed ?? records.filter(r => r.presence).reduce((s, r) => s + Number(r.hours_completed || 0), 0);

  const rateColor      = rate >= 80 ? 'text-emerald-400' : rate >= 60 ? 'text-amber-400' : 'text-red-400';
  const rateLabel      = rate >= 80 ? 'Great attendance' : rate >= 60 ? 'Needs improvement' : 'At risk';

  /* ── filtered ── */
  const filtered = records.filter(r => {
    if (filter === 'present' && !r.presence) return false;
    if (filter === 'absent'  &&  r.presence) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = (r.lesson_name || `Lesson #${r.lesson}`).toLowerCase();
      const notes = (r.notes || '').toLowerCase();
      if (!name.includes(q) && !notes.includes(q)) return false;
    }
    return true;
  });

  /* ── group by month ── */
  const grouped = filtered.reduce((acc, r) => {
    const key = r.created_at
      ? new Date(r.created_at).toLocaleString('en-GB', { month: 'long', year: 'numeric' })
      : 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <div className="flex h-screen bg-[#060B18] overflow-hidden font-dm">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Top bar ── */}
        <header className="h-[52px] flex-shrink-0 bg-[#0B1221] border-b border-white/[0.06]
          flex items-center gap-3 px-5">
          <span className="font-sora text-[14px] font-bold text-white">My Attendance</span>
          <span className="text-[11px] text-white/30">Your personal lesson history</span>
          <div className="flex-1" />
          <button onClick={fetchData}
            className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]
              text-white/30 hover:text-white flex items-center justify-center transition-all"
            title="Refresh">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M11 6.5A4.5 4.5 0 112 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M11 3v3.5H7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

          {error && (
            <div className="flex items-center gap-3 bg-red-500/[0.07] border border-red-500/20
              rounded-xl px-4 py-3">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2L13 12H1L7 2z" stroke="#f87171" strokeWidth="1.2"/>
                <path d="M7 6v3" stroke="#f87171" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="7" cy="10.5" r="0.6" fill="#f87171"/>
              </svg>
              <p className="text-[12px] text-red-400">{error}</p>
            </div>
          )}

          {/* ── Hero stats panel ── */}
          <div className="bg-[#0D1829] border border-white/[0.07] rounded-[20px] p-5
            flex flex-col gap-5 lg:flex-row lg:items-stretch">

            {/* Ring + rate */}
            <div className="flex flex-col items-center justify-center gap-2 px-4">
              <div className="relative">
                <RingProgress rate={Number(rate)} size={128} stroke={10} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`font-sora text-[22px] font-black ${rateColor}`}>
                    {rate}%
                  </span>
                </div>
              </div>
              <p className={`text-[10px] font-bold tracking-[0.5px] uppercase ${rateColor}`}>
                {rateLabel}
              </p>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px bg-white/[0.06] my-2" />
            <div className="lg:hidden h-px bg-white/[0.06]" />

            {/* Stat grid */}
            <div className="flex-1 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: 'Total Lessons', value: totalLessons, emoji: '📚', color: 'text-white' },
                { label: 'Attended',      value: attended,     emoji: '✅', color: 'text-emerald-400' },
                { label: 'Missed',        value: missed,       emoji: '❌', color: 'text-red-400' },
                { label: 'Hours Logged',  value: `${Number(totalHours).toFixed(1)}h`, emoji: '⏱', color: 'text-blue-400' },
              ].map(s => (
                <div key={s.label}
                  className="bg-white/[0.02] border border-white/[0.05] rounded-[14px] px-4 py-3.5 flex flex-col gap-1">
                  <span className="text-xl">{s.emoji}</span>
                  <span className={`font-sora text-[26px] font-black leading-none ${s.color}`}>
                    {s.value ?? '—'}
                  </span>
                  <span className="text-[9px] text-white/25 uppercase tracking-[0.6px]">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px bg-white/[0.06] my-2" />
            <div className="lg:hidden h-px bg-white/[0.06]" />

            {/* Activity strip */}
            <div className="flex flex-col justify-between gap-3 px-1 min-w-[160px]">
              <div>
                <p className="text-[9px] font-bold text-white/25 uppercase tracking-[0.6px] mb-2">
                  Last 20 lessons
                </p>
                <AttendanceStrip records={records} />
              </div>
              <div className="flex items-center gap-3 text-[9px] text-white/20">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-[2px] bg-emerald-400/70 inline-block" />Present
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-[2px] bg-red-400/40 inline-block" />Absent
                </span>
              </div>
            </div>
          </div>

          {/* ── Filter + search bar ── */}
          <div className="flex items-center gap-3 flex-wrap">

            {/* Search */}
            <div className="relative w-[220px]">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">
                <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <input type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search lessons…"
                className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl
                  pl-9 pr-4 py-2 text-[12px] text-white placeholder:text-white/20
                  outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all"
              />
            </div>

            {/* Tabs */}
            <div className="flex bg-white/[0.04] rounded-[8px] p-0.5 gap-0.5">
              {[
                { v: 'all',     l: 'All',        count: records.length },
                { v: 'present', l: '✓ Present',   count: attended },
                { v: 'absent',  l: '✗ Absent',    count: missed },
              ].map(({ v, l, count }) => (
                <button key={v} onClick={() => setFilter(v)}
                  className={cls(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[10px] font-semibold transition-all',
                    filter === v ? 'bg-white/[0.10] text-white' : 'text-white/30 hover:text-white/60',
                  )}>
                  {l}
                  <span className={cls(
                    'text-[9px] rounded-md px-1.5 py-0.5',
                    filter === v ? 'bg-white/[0.12] text-white/70' : 'bg-white/[0.04] text-white/20',
                  )}>
                    {count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex-1" />
            <span className="text-[10px] text-white/20">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* ── Record list ── */}
          <div className="flex flex-col gap-0.5">
            {loading
              ? Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : filtered.length === 0
              ? <EmptyState />
              : Object.entries(grouped).map(([month, recs]) => (
                  <div key={month}>
                    <MonthDivider label={month} />
                    <div className="flex flex-col gap-2">
                      {recs.map(r => <RecordCard key={r.id} record={r} />)}
                    </div>
                  </div>
                ))
            }
          </div>

        </main>
      </div>
    </div>
  );
};

export default StudentAttendancePage;