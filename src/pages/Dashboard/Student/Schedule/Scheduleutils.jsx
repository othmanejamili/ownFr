// ─────────────────────────────────────────────
//  scheduleUtils.js — shared helpers
// ─────────────────────────────────────────────

export const DAYS  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTHS = ['January','February','March','April','May','June',
                       'July','August','September','October','November','December'];

// ── Date helpers ───────────────────────────────────────────────

export const toISO = (date) => date.toISOString().slice(0, 10);

export const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

export const sameDay = (a, b) =>
  new Date(a).toDateString() === new Date(b).toDateString();

export const fmtTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const fmtDate = (iso) => {
  const d = new Date(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

export const fmtDuration = (minutes) => {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

// ── Calendar positioning helpers ──────────────────────────────
// Hours grid starts at 08:00, 1px = 1 minute (54px/hour slot)
const GRID_START_HOUR = 8;
const PX_PER_MINUTE   = 54 / 60;

export const timeToTopPx = (iso) => {
  const d = new Date(iso);
  const mins = (d.getHours() - GRID_START_HOUR) * 60 + d.getMinutes();
  return Math.max(0, mins * PX_PER_MINUTE);
};

export const durationToPx = (startIso, endIso) => {
  const mins = (new Date(endIso) - new Date(startIso)) / 60000;
  return Math.max(20, mins * PX_PER_MINUTE);
};

// ── Lesson type styling ────────────────────────────────────────

export const lessonStyle = (type, status) => {
  if (status === 'X') return { bar: '#991B1B', bg: 'bg-red-900/30',  text: 'text-red-300',  border: 'border-red-800/50' };
  if (status === 'C') return { bar: '#374151', bg: 'bg-gray-800/50', text: 'text-gray-400',  border: 'border-gray-700/50' };
  if (type === 'T')   return { bar: '#6D28D9', bg: 'bg-violet-900/40', text: 'text-violet-200', border: 'border-violet-700/40' };
  if (type === 'D')   return { bar: '#065F46', bg: 'bg-emerald-900/40', text: 'text-emerald-200', border: 'border-emerald-700/40' };
  return { bar: '#1E3A5F', bg: 'bg-blue-900/30', text: 'text-blue-200', border: 'border-blue-700/40' };
};

export const statusBadge = (status) => {
  const map = {
    S: { label: 'Scheduled',  cls: 'bg-blue-500/20 text-blue-400' },
    C: { label: 'Completed',  cls: 'bg-emerald-500/20 text-emerald-400' },
    P: { label: 'Paused',     cls: 'bg-amber-500/20 text-amber-400' },
    X: { label: 'Cancelled',  cls: 'bg-red-500/20 text-red-400' },
  };
  return map[status] ?? { label: status, cls: 'bg-gray-700 text-gray-400' };
};

export const lessonTypeBadge = (type) =>
  type === 'T'
    ? { label: 'Theory',  cls: 'bg-violet-500/20 text-violet-400' }
    : { label: 'Driving', cls: 'bg-emerald-500/20 text-emerald-400' };

// ── Conflict detection (client-side, optimistic) ──────────────

export const hasConflict = (schedules, newStart, newEnd, excludeId = null) => {
  const s = new Date(newStart);
  const e = new Date(newEnd);
  return schedules.some((sc) => {
    if (sc.id === excludeId) return false;
    const ss = new Date(sc.start_time);
    const se = new Date(sc.end_time);
    return s < se && e > ss;
  });
};