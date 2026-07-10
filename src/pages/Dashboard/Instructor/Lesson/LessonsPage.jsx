// src/pages/LessonsPageInstructor/LessonsPageInstructor.jsx
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
const LESSON_TYPES = { T: 'Theory', D: 'Driving' };
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
  edit:    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5l2 2L4 10H2v-2L8.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
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

/* ─── Edit Modal (instructor-scoped fields only) ─────────────── */
const EditModal = ({ open, onClose, onSuccess, lesson }) => {
  const [form, setForm]     = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiErr, setApiErr] = useState('');

  useEffect(() => {
    if (open && lesson) {
      setErrors({});
      setApiErr('');
      setForm({
        title:       lesson.title       || '',
        description: lesson.description || '',
        duration:    lesson.duration    || 60,
        date:        fmtDateInput(lesson.date),
        status:      lesson.status      || 'S',
        max_students: lesson.max_students || 1,
      });
    }
  }, [open, lesson]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.title.trim())  e.title = 'Title is required';
    if (!form.date)          e.date  = 'Date & time required';
    if (form.duration < 30)  e.duration = 'Minimum 30 minutes';
    if (form.duration > 480) e.duration = 'Maximum 480 minutes';
    if (lesson?.lesson_type === 'D' && (form.max_students < 1 || form.max_students > 4))
      e.max_students = 'Between 1 and 4';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setApiErr(''); setSaving(true);

    try {
      // Only send the editable fields — never instructor/school/lesson_type
      const payload = {
        title:        form.title,
        description:  form.description,
        duration:     Number(form.duration),
        date:         form.date ? new Date(form.date).toISOString() : null,
        status:       form.status,
        max_students: Number(form.max_students),
      };

      const result = await api.updateLesson(lesson.id, payload);

      if (!result?.id) {
        const msg = Object.values(result || {}).flat().join(' ');
        setApiErr(msg || 'Something went wrong');
        return;
      }
      onSuccess(result);
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === 'object') {
        const msg = Object.entries(data)
          .map(([field, errs]) => `${field}: ${[].concat(errs).join(', ')}`)
          .join(' | ');
        setApiErr(msg || 'Validation error');
      } else {
        setApiErr('Network error. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open || !lesson) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(6,11,24,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="bg-[#0B1221] border border-white/[0.08] rounded-2xl w-full max-w-[520px]
        shadow-2xl flex flex-col max-h-[90vh]"
        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/15 border border-blue-500/20
              flex items-center justify-center text-blue-400">
              {Icon.edit}
            </div>
            <div>
              <h2 className="font-sora text-[14px] font-bold text-white">Edit Lesson</h2>
              <p className="text-[10px] text-white/30">Update your lesson details</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]
              text-white/40 hover:text-white flex items-center justify-center transition-all">
            {Icon.close}
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">

          {apiErr && (
            <div className="flex items-start gap-2.5 bg-red-500/[0.07] border border-red-500/20
              rounded-xl px-4 py-3">
              {Icon.warn}
              <p className="text-[11px] text-red-400 leading-relaxed">{apiErr}</p>
            </div>
          )}

          {/* Read-only info */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3 flex flex-col gap-0">
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.5px] mb-2">
              Read-only fields
            </p>
            <InfoRow label="Type"       value={lesson.lesson_type === 'T' ? '📖 Theory' : '🚗 Driving'} />
            <InfoRow label="Instructor" value={lesson.instructor_name} />
            <InfoRow label="School"     value={lesson.school_name} />
            <InfoRow label="License"    value={
              lesson.target_license_type === 'A' ? 'All'
              : lesson.target_license_type === 'C' ? '🚗 Car' : '🏍️ Moto'
            } />
          </div>

          {/* Editable: Title */}
          <Field label="Lesson Title" error={errors.title}>
            <input className={inputCls} placeholder="e.g. Introduction to Road Signs"
              value={form.title} onChange={e => set('title', e.target.value)} />
          </Field>

          {/* Editable: Duration + Date */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Duration (minutes)" error={errors.duration}>
              <input type="number" className={inputCls}
                placeholder="60" min={30} max={480}
                value={form.duration} onChange={e => set('duration', e.target.value)} />
              <div className="flex gap-1.5 mt-1">
                {[30, 60, 90, 120].map(d => (
                  <button key={d} type="button"
                    onClick={() => set('duration', d)}
                    className={cls(
                      'flex-1 py-1 rounded-lg text-[9px] font-bold border transition-all',
                      form.duration == d
                        ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
                        : 'bg-white/[0.03] border-white/[0.06] text-white/25 hover:text-white/50',
                    )}>
                    {d}m
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Date & Time" error={errors.date}>
              <input type="datetime-local" className={inputCls}
                value={form.date} onChange={e => set('date', e.target.value)}
                style={{ colorScheme: 'dark' }} />
            </Field>
          </div>

          {/* Editable: Status */}
          <Field label="Status">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(STATUSES).map(([k, v]) => (
                <button key={k} type="button"
                  onClick={() => set('status', k)}
                  className={cls(
                    'py-2 rounded-xl border text-[11px] font-semibold transition-all',
                    form.status === k
                      ? v.cls + ' opacity-100'
                      : 'bg-white/[0.03] border-white/[0.08] text-white/35 hover:text-white/60',
                  )}>
                  {v.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Editable: Max Students — driving only */}
          {lesson?.lesson_type === 'D' && (
            <Field label="Max Students (1–4)" error={errors.max_students}>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(n => (
                  <button key={n} type="button"
                    onClick={() => set('max_students', n)}
                    className={cls(
                      'flex-1 py-2.5 rounded-xl border text-[12px] font-bold transition-all',
                      form.max_students === n
                        ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                        : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/70',
                    )}>
                    {n}
                  </button>
                ))}
              </div>
            </Field>
          )}

          {/* Editable: Description */}
          <Field label="Description (optional)">
            <textarea className={cls(inputCls, 'resize-none h-20')}
              placeholder="Lesson objectives, notes…"
              value={form.description} onChange={e => set('description', e.target.value)} />
          </Field>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.08]
              text-[12px] text-white/50 hover:text-white transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500
              text-[13px] font-bold text-white transition-all disabled:opacity-50
              flex items-center justify-center gap-2">
            {saving
              ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Saving…</>
              : 'Save Changes'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

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
    <td className="px-4 py-3.5">
      {/* Edit only — no delete */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(lesson)}
          className="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500/20
            text-blue-400 flex items-center justify-center transition-colors"
          title="Edit">
          {Icon.edit}
        </button>
      </div>
    </td>
  </tr>
);

/* ─── Detail Drawer ──────────────────────────────────────────── */
const LessonDrawer = ({ lesson, onClose, onEdit }) => {
  if (!lesson) return null;
  return (
    <>
      <div className="fixed inset-0 z-[50]" onClick={onClose}
        style={{ background: 'rgba(6,11,24,0.5)' }} />
      <div className="fixed right-0 top-0 h-full w-[320px] z-[55]
        bg-[#0B1221] border-l border-white/[0.07] flex flex-col"
        style={{ boxShadow: '-24px 0 64px rgba(0,0,0,0.4)' }}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <span className="font-sora text-[13px] font-bold text-white">Lesson Details</span>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]
              text-white/40 hover:text-white flex items-center justify-center transition-all">
            {Icon.close}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <div className={cls(
            'w-full py-5 rounded-2xl border flex flex-col items-center gap-2',
            lesson.lesson_type === 'T'
              ? 'bg-violet-600/08 border-violet-500/15'
              : 'bg-teal-600/08 border-teal-500/15',
          )}>
            <span className="text-4xl">{lesson.lesson_type === 'T' ? '📖' : '🚗'}</span>
            <span className="font-sora text-[16px] font-bold text-white">{lesson.title}</span>
            <div className="flex items-center gap-2">
              <TypePill t={lesson.lesson_type} />
              <StatusBadge s={lesson.status} />
            </div>
          </div>

          {[
            { label: 'School',       value: lesson.school_name },
            { label: 'Date',         value: fmtDate(lesson.date) },
            { label: 'Duration',     value: `${lesson.duration} minutes` },
            { label: 'License Type', value: lesson.target_license_type === 'A' ? 'All'
                                          : lesson.target_license_type === 'C' ? '🚗 Car' : '🏍️ Moto' },
            ...(lesson.lesson_type === 'D' ? [
              { label: 'Max Students', value: lesson.max_students },
              { label: 'Enrolled',     value: lesson.enrolled_count || 0 },
            ] : []),
          ].map(row => (
            <div key={row.label}
              className="flex justify-between items-start py-2.5 border-b border-white/[0.04]">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.5px]">
                {row.label}
              </span>
              <span className="text-[12px] text-white/70 text-right max-w-[55%]">
                {row.value ?? '—'}
              </span>
            </div>
          ))}

          {lesson.description && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <p className="text-[10px] font-bold text-white/25 uppercase tracking-[0.5px] mb-2">Notes</p>
              <p className="text-[12px] text-white/50 leading-relaxed">{lesson.description}</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/[0.06]">
          <button onClick={() => { onClose(); onEdit(lesson); }}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500
              text-[13px] font-bold text-white transition-all flex items-center justify-center gap-2">
            {Icon.edit} Edit Lesson
          </button>
        </div>
      </div>
    </>
  );
};

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
const LessonsPageInstructor = () => {
  const [lessons,      setLessons]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [typeFilter,   setTypeFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editLesson,   setEditLesson]   = useState(null);
  const [drawerLesson, setDrawerLesson] = useState(null);
  const [toast,        setToast]        = useState({ msg: '', type: 'success' });
  const [error,        setError]        = useState('');

  const showToast = (msg, type = 'success') => setToast({ msg, type });

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

  const handleEditSuccess = (updated) => {
    setEditLesson(null);
    setLessons(ls => ls.map(l => l.id === updated.id ? updated : l));
    showToast('Lesson updated successfully');
  };

  const openEdit = (l) => { setEditLesson(l); setDrawerLesson(null); };

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
                        <LessonRow key={l.id} lesson={l} onEdit={openEdit} />
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

      {/* Drawer — no enroll button since instructor can't enroll */}
      <LessonDrawer
        lesson={drawerLesson}
        onClose={() => setDrawerLesson(null)}
        onEdit={openEdit}
      />

      <EditModal
        open={!!editLesson}
        onClose={() => setEditLesson(null)}
        onSuccess={handleEditSuccess}
        lesson={editLesson}
      />

      <Toast msg={toast.msg} type={toast.type} onDone={() => setToast({ msg: '', type: 'success' })} />
    </div>
  );
};

export default LessonsPageInstructor;