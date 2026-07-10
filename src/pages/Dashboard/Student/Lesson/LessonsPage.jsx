// src/pages/LessonsPageStudent/LessonsPageStudent.jsx
import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../Dashboard/Sidebar';
import { api } from './Lessonapi';

/* ─── Helpers ────────────────────────────────────────────────── */
const cls = (...a) => a.filter(Boolean).join(' ');

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};


const fmtDateInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/* ─── Constants ──────────────────────────────────────────────── */
const STATUSES = {
  S: { label: 'Scheduled', cls: 'bg-blue-600/12 text-blue-400 border-blue-500/20' },
  C: { label: 'Completed', cls: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20' },
  P: { label: 'Paused',    cls: 'bg-amber-500/12 text-amber-400 border-amber-500/20' },
  X: { label: 'Cancelled', cls: 'bg-red-500/12 text-red-400 border-red-500/20' },
};

/* ─── Icons ──────────────────────────────────────────────────── */
const Icon = {
  search:  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  refresh: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11 6.5A4.5 4.5 0 112 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M11 3v3.5H7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  close:   <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  book:    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 4h6M4 7h6M4 10h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
  clock:   <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6 3.5V6l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  car:     <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 8h9M3.5 8V10M9.5 8V10M2.5 8l1.5-4h5l1.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  warn:    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2L13 12H1L7 2z" stroke="#f87171" strokeWidth="1.2"/><path d="M7 6v3" stroke="#f87171" strokeWidth="1.2" strokeLinecap="round"/><circle cx="7" cy="10.5" r="0.6" fill="#f87171"/></svg>,
  lock:    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="2.5" y="5.5" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M4 5.5V4a2 2 0 014 0v1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
};

/* ─── Primitives ─────────────────────────────────────────────── */
const StatusBadge = ({ s }) => {
  const info = STATUSES[s] || { label: s, cls: 'bg-white/[0.06] text-white/40 border-white/[0.08]' };
  return (
    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${info.cls}`}>
      {info.label}
    </span>
  );
};

const TypePill = ({ t }) => (
  <span className={cls(
    'text-[9px] font-bold px-2 py-0.5 rounded-md border',
    t === 'T'
      ? 'bg-violet-600/12 text-violet-400 border-violet-500/20'
      : 'bg-teal-500/12 text-teal-400 border-teal-500/20',
  )}>
    {t === 'T' ? '📖 Theory' : '🚗 Driving'}
  </span>
);

const SkeletonRow = () => (
  <tr>
    {[60, 100, 80, 70, 60, 60].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-3 rounded-full bg-white/[0.05] animate-pulse" style={{ width: w }} />
      </td>
    ))}
  </tr>
);

const EmptyState = () => (
  <tr><td colSpan={7}>
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07]
        flex items-center justify-center text-3xl">📚</div>
      <div className="text-center">
        <p className="font-sora text-[14px] font-bold text-white/60">No lessons assigned</p>
        <p className="text-[11px] text-white/25 mt-1">Your lessons will appear here once scheduled.</p>
      </div>
    </div>
  </td></tr>
);

/* ─── Read-only info row used inside the edit modal ─────────── */
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
    <span className="text-[10px] font-bold text-white/25 uppercase tracking-[0.5px] flex items-center gap-1.5">
      {Icon.lock} {label}
    </span>
    <span className="text-[12px] text-white/40">{value ?? '—'}</span>
  </div>
);

/* ─── Form Field ─────────────────────────────────────────────── */
const Field = ({ label, children, error }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-white/40 tracking-[0.5px] uppercase">{label}</label>
    {children}
    {error && <p className="text-[10px] text-red-400">{error}</p>}
  </div>
);

const inputCls = `w-full bg-white/[0.04] border border-white/[0.08] rounded-xl
  px-3 py-2.5 text-[12px] text-white placeholder:text-white/20
  outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all`;

const selectCls = `w-full bg-[#0B1221] border border-white/[0.08] rounded-xl
  px-3 py-2.5 text-[12px] text-white
  outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer`;


/* ─── Lesson Row ─────────────────────────────────────────────── */
const LessonRow = ({ lesson, onEdit }) => (
  <tr className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group cursor-default">
    <td className="px-4 py-3.5">
      <div className="flex items-center gap-2.5">
        <div className={cls(
          'w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0 text-sm',
          lesson.lesson_type === 'T'
            ? 'bg-violet-600/15 border border-violet-500/20'
            : 'bg-teal-600/15 border border-teal-500/20',
        )}>
          {lesson.lesson_type === 'T' ? '📖' : '🚗'}
        </div>
        <div>
          <div className="text-[12px] font-semibold text-white leading-tight">{lesson.title || '—'}</div>
          <div className="mt-0.5"><TypePill t={lesson.lesson_type} /></div>
        </div>
      </div>
    </td>
    <td className="px-4 py-3.5">
      <div className="text-[11px] text-white/50">{lesson.school_name || '—'}</div>
    </td>
    <td className="px-4 py-3.5">
      <div className="flex items-center gap-1.5 text-[10px] text-white/40">
        {Icon.clock}
        {fmtDate(lesson.date)}
      </div>
    </td>
    <td className="px-4 py-3.5">
      <div className="flex items-center gap-1 text-[11px] text-white/50">
        <span className="text-white/25">{Icon.car}</span>
        {lesson.duration}m
      </div>
    </td>
    <td className="px-4 py-3.5">
      {lesson.lesson_type === 'D' ? (
        <div className="flex items-center gap-1.5">
          <div className="w-14 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.min(100, ((lesson.enrolled_count || 0) / (lesson.max_students || 1)) * 100)}%` }} />
          </div>
          <span className="text-[10px] text-white/40">
            {lesson.enrolled_count || 0}/{lesson.max_students || 1}
          </span>
        </div>
      ) : (
        <span className="text-[10px] text-white/20">Auto</span>
      )}
    </td>
    <td className="px-4 py-3.5">
      <StatusBadge s={lesson.status} />
    </td>

  </tr>
);


/* ─── Toast ──────────────────────────────────────────────────── */
const Toast = ({ msg, type, onDone }) => {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [msg]);
  if (!msg) return null;
  return (
    <div className={cls(
      'fixed bottom-6 right-6 z-[80] flex items-center gap-3 px-4 py-3 rounded-2xl border',
      'shadow-2xl text-[12px] font-semibold',
      type === 'error'
        ? 'bg-red-950 border-red-500/30 text-red-300'
        : 'bg-[#0B2A1A] border-emerald-500/30 text-emerald-300',
    )}
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
      <span>{type === 'error' ? '❌' : '✅'}</span>
      {msg}
    </div>
  );
};

/* ─── Stat Card ──────────────────────────────────────────────── */
const StatCard = ({ emoji, label, value, accent }) => {
  const accents = {
    blue:    'from-blue-600/10 to-transparent border-blue-500/10',
    violet:  'from-violet-600/10 to-transparent border-violet-500/10',
    teal:    'from-teal-600/10 to-transparent border-teal-500/10',
    emerald: 'from-emerald-600/10 to-transparent border-emerald-500/10',
    amber:   'from-amber-600/10 to-transparent border-amber-500/10',
  };
  return (
    <div className={cls(
      'bg-[#0F1A2E] rounded-[14px] px-4 py-3.5 border bg-gradient-to-br',
      'hover:border-white/[0.12] transition-colors',
      accents[accent] || 'border-white/[0.07]',
    )}>
      <div className="text-xl mb-2">{emoji}</div>
      <div className="font-sora text-[26px] font-black text-white tracking-tight">{value}</div>
      <div className="text-[10px] text-white/30 mt-0.5">{label}</div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
const LessonsPageStudent = () => {
  const [lessons,      setLessons]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [typeFilter,   setTypeFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error,        setError]        = useState('');


  const fetchLessons = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (search)       params.set('search', search);
      if (typeFilter)   params.set('lesson_type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);
      const data = await api.getLessons(params.toString());
      const list = Array.isArray(data) ? data : data?.results || [];
      setLessons(list);
    } catch {
      setError('Failed to load lessons.');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter]);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);




  const total     = lessons.length;
  const scheduled = lessons.filter(l => l.status === 'S').length;
  const completed = lessons.filter(l => l.status === 'C').length;
  const theory    = lessons.filter(l => l.lesson_type === 'T').length;
  const driving   = lessons.filter(l => l.lesson_type === 'D').length;

  const TABLE_HEADS = ['Lesson', 'School', 'Date', 'Duration', 'Enrolled', 'Status', ''];

  return (
    <div className="flex h-screen bg-[#060B18] overflow-hidden font-dm">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header — no "New Lesson" button */}
        <header className="h-[52px] flex-shrink-0 bg-[#0B1221] border-b border-white/[0.06]
          flex items-center gap-3 px-5">
          <div className="flex items-baseline gap-2">
            <span className="font-sora text-[14px] font-bold text-white">My Lessons</span>
            <span className="text-[11px] text-white/30">Your assigned lessons</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-3 bg-red-500/[0.07] border border-red-500/20
              rounded-xl px-4 py-3">
              {Icon.warn}
              <p className="text-[12px] text-red-400">{error}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-5 gap-3">
            <StatCard emoji="📚" label="Total lessons"   value={total}     accent="blue"    />
            <StatCard emoji="🗓️" label="Scheduled"       value={scheduled} accent="violet"  />
            <StatCard emoji="✅" label="Completed"        value={completed} accent="emerald" />
            <StatCard emoji="📖" label="Theory lessons"  value={theory}    accent="violet"  />
            <StatCard emoji="🚗" label="Driving lessons" value={driving}   accent="teal"    />
          </div>

          {/* Table */}
          <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06] flex-wrap">
              <div className="relative w-[220px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">
                  {Icon.search}
                </span>
                <input type="text" value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search lessons…"
                  className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl
                    pl-9 pr-4 py-2 text-[12px] text-white placeholder:text-white/20
                    outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all"
                />
              </div>

              <div className="flex bg-white/[0.04] rounded-[8px] p-0.5 gap-0.5">
                {[['', 'All'], ['T', '📖 Theory'], ['D', '🚗 Driving']].map(([v, l]) => (
                  <button key={v} onClick={() => setTypeFilter(v)}
                    className={cls(
                      'px-3 py-1.5 rounded-[6px] text-[10px] font-semibold transition-all',
                      typeFilter === v ? 'bg-white/[0.1] text-white' : 'text-white/30 hover:text-white/60',
                    )}>
                    {l}
                  </button>
                ))}
              </div>

              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="bg-white/[0.03] border border-white/[0.07] rounded-xl
                  px-3 py-2 text-[11px] text-white/60 outline-none
                  focus:border-blue-500/40 transition-all appearance-none cursor-pointer">
                <option value="">All statuses</option>
                {Object.entries(STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>

              <div className="flex-1" />

              <button onClick={fetchLessons}
                className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]
                  text-white/30 hover:text-white flex items-center justify-center transition-all"
                title="Refresh">
                {Icon.refresh}
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {TABLE_HEADS.map((h, i) => (
                      <th key={i}
                        className="px-4 py-3 text-left text-[9px] font-bold text-white/25
                          tracking-[0.6px] uppercase border-b border-white/[0.05]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array(6).fill(0).map((_, i) => <SkeletonRow key={i} />)
                    : lessons.length === 0
                    ? <EmptyState />
                    : lessons.map(l => (
                        <LessonRow key={l.id} lesson={l}  />
                      ))
                  }
                </tbody>
              </table>
            </div>

            {!loading && lessons.length > 0 && (
              <div className="px-5 py-3 border-t border-white/[0.05] flex items-center justify-between">
                <span className="text-[10px] text-white/25">
                  {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
                </span>
                <span className="text-[10px] text-white/20">
                  {scheduled} scheduled · {completed} completed
                </span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LessonsPageStudent;