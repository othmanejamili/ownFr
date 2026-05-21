// src/pages/LessonsPage/LessonsPage.jsx
//
// Full CRUD for Lessons — create, read, update, delete.
// Matches DriveIQ dashboard design system exactly.
//
// APIs used:
//   GET    /api/lesson/          → list lessons (filtered by role)
//   POST   /api/lesson/          → create lesson
//   PATCH  /api/lesson/:id/      → update lesson
//   DELETE /api/lesson/:id/      → delete lesson
//   GET    /api/users/           → fetch instructors (role=I)
//   GET    /api/drivingschool/   → fetch schools

import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../Sidebar';
import { api } from '../LessonCrud/Lessonapi';

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
  plus: <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  search: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  refresh: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11 6.5A4.5 4.5 0 112 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M11 3v3.5H7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  edit: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5l2 2L4 10H2v-2L8.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  trash: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M5 3V2h2v1M4 3v7h4V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  close: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  book: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 4h6M4 7h6M4 10h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
  clock: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6 3.5V6l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  car: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 8h9M3.5 8V10M9.5 8V10M2.5 8l1.5-4h5l1.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  warn: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2L13 12H1L7 2z" stroke="#f87171" strokeWidth="1.2"/><path d="M7 6v3" stroke="#f87171" strokeWidth="1.2" strokeLinecap="round"/><circle cx="7" cy="10.5" r="0.6" fill="#f87171"/></svg>,
  filter: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 3.5h10M3.5 6.5h6M5.5 9.5h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
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
    {[60, 140, 80, 100, 80, 70, 60].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-3 rounded-full bg-white/[0.05] animate-pulse" style={{ width: w }} />
      </td>
    ))}
  </tr>
);

const EmptyState = ({ onAdd }) => (
  <tr><td colSpan={8}>
    <div className="flex flex-col items-center justify-center py-20 gap-5">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07]
          flex items-center justify-center text-3xl">
          📚
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-blue-600/20
          border border-blue-500/30 flex items-center justify-center text-blue-400">
          {Icon.plus}
        </div>
      </div>
      <div className="text-center">
        <p className="font-sora text-[14px] font-bold text-white/60">No lessons yet</p>
        <p className="text-[11px] text-white/25 mt-1">Schedule your first lesson to get started.</p>
      </div>
      <button onClick={onAdd}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500
          rounded-xl text-[12px] font-semibold text-white transition-all">
        {Icon.plus} Create lesson
      </button>
    </div>
  </td></tr>
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
  outline-none focus:border-blue-500/50 focus:bg-white/[0.06]
  transition-all`;

const selectCls = `w-full bg-[#0B1221] border border-white/[0.08] rounded-xl
  px-3 py-2.5 text-[12px] text-white
  outline-none focus:border-blue-500/50
  transition-all appearance-none cursor-pointer`;

/* ─── Lesson Form Modal ──────────────────────────────────────── */
const EMPTY_FORM = {
  title: '', lesson_type: 'T', description: '',
  duration: 60, date: '', status: 'S',
  instructor: '', school: '',
};

const LessonModal = ({ open, onClose, onSuccess, lesson, instructors, schools }) => {
  const isEdit = !!lesson;
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiErr, setApiErr] = useState('');

  useEffect(() => {
    if (open) {
      setErrors({});
      setApiErr('');
      if (isEdit && lesson) {
        setForm({
          title:       lesson.title || '',
          lesson_type: lesson.lesson_type || 'T',
          description: lesson.description || '',
          duration:    lesson.duration || 60,
          date:        fmtDateInput(lesson.date),
          status:      lesson.status || 'S',
          instructor:  lesson.instructor || '',
          school:      lesson.school || '',
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, lesson]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title = 'Title is required';
    if (!form.date)               e.date = 'Date & time required';
    if (!form.instructor)         e.instructor = 'Select an instructor';
    if (!form.school)             e.school = 'Select a school';
    if (form.duration < 30)       e.duration = 'Minimum 30 minutes';
    if (form.duration > 480)      e.duration = 'Maximum 480 minutes';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true); setApiErr('');
    try {
      const payload = {
        ...form,
        duration: Number(form.duration),
        instructor: Number(form.instructor),
        school: Number(form.school),
      };
      let result;
      if (isEdit) {
        result = await api.updateLesson(lesson.id, payload);
      } else {
        result = await api.createLesson(payload);
      }
      if (result?.id) {
        onSuccess(result, isEdit);
      } else {
        const msg = Object.values(result || {}).flat().join(' ');
        setApiErr(msg || 'Something went wrong');
      }
    } catch {
      setApiErr('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(6,11,24,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="bg-[#0B1221] border border-white/[0.08] rounded-2xl w-full max-w-[560px]
        shadow-2xl flex flex-col max-h-[90vh]"
        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/15 border border-blue-500/20
              flex items-center justify-center text-blue-400">
              {Icon.book}
            </div>
            <div>
              <h2 className="font-sora text-[14px] font-bold text-white">
                {isEdit ? 'Edit Lesson' : 'New Lesson'}
              </h2>
              <p className="text-[10px] text-white/30">
                {isEdit ? 'Update lesson details' : 'Schedule a new lesson'}
              </p>
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

          {/* Title */}
          <Field label="Lesson Title" error={errors.title}>
            <input className={inputCls} placeholder="e.g. Introduction to Road Signs"
              value={form.title} onChange={e => set('title', e.target.value)} />
          </Field>

          {/* Type + Duration row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Lesson Type">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(LESSON_TYPES).map(([k, v]) => (
                  <button key={k}
                    type="button"
                    onClick={() => set('lesson_type', k)}
                    className={cls(
                      'py-2.5 rounded-xl border text-[11px] font-semibold transition-all',
                      form.lesson_type === k
                        ? k === 'T'
                          ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                          : 'bg-teal-600/20 border-teal-500/40 text-teal-300'
                        : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/70',
                    )}>
                    {k === 'T' ? '📖' : '🚗'} {v}
                  </button>
                ))}
              </div>
            </Field>

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
          </div>

          {/* Date + Status */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date & Time" error={errors.date}>
              <input type="datetime-local" className={inputCls}
                value={form.date} onChange={e => set('date', e.target.value)}
                style={{ colorScheme: 'dark' }} />
            </Field>

            <Field label="Status">
              <select className={selectCls}
                value={form.status} onChange={e => set('status', e.target.value)}>
                {Object.entries(STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Instructor + School */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Instructor" error={errors.instructor}>
              <select className={selectCls}
                value={form.instructor} onChange={e => set('instructor', e.target.value)}>
                <option value="">Select instructor…</option>
                {instructors.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.first_name || u.username} {u.last_name || ''}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="School" error={errors.school}>
              <select className={selectCls}
                value={form.school} onChange={e => set('school', e.target.value)}>
                <option value="">Select school…</option>
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Description */}
          <Field label="Description (optional)">
            <textarea className={cls(inputCls, 'resize-none h-20')}
              placeholder="Lesson objectives, notes…"
              value={form.description} onChange={e => set('description', e.target.value)} />
          </Field>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] flex items-center gap-3">
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
              ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30
                  border-t-white animate-spin" />Saving…</>
              : isEdit ? 'Save Changes' : 'Create Lesson'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Delete confirm ─────────────────────────────────────────── */
const DeleteDialog = ({ open, lesson, onConfirm, onCancel, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(6,11,24,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="bg-[#0F1A2E] border border-white/[0.08] rounded-2xl p-6 w-full max-w-[340px]">
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20
            flex items-center justify-center mx-auto mb-4 text-2xl">
            🗑️
          </div>
          <h3 className="font-sora text-[15px] font-bold text-white">Delete lesson?</h3>
          <p className="text-[12px] text-white/40 mt-2 leading-relaxed">
            <span className="text-white/70 font-semibold">"{lesson?.title}"</span>
            <br/>This cannot be undone.
          </p>
        </div>
        <div className="flex gap-2.5">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.08]
              text-[12px] text-white/50 hover:text-white transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500
              text-[13px] font-bold text-white transition-all disabled:opacity-50">
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Lesson Row ─────────────────────────────────────────────── */
const LessonRow = ({ lesson, onEdit, onDelete }) => (
  <tr className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group cursor-default">
    {/* Title + type */}
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

    {/* Instructor */}
    <td className="px-4 py-3.5">
      <div className="text-[11px] text-white/70">{lesson.instructor_name || '—'}</div>
    </td>

    {/* School */}
    <td className="px-4 py-3.5">
      <div className="text-[11px] text-white/50">{lesson.school_name || '—'}</div>
    </td>

    {/* Date */}
    <td className="px-4 py-3.5">
      <div className="flex items-center gap-1.5 text-[10px] text-white/40">
        {Icon.clock}
        {fmtDate(lesson.date)}
      </div>
    </td>

    {/* Duration */}
    <td className="px-4 py-3.5">
      <div className="flex items-center gap-1 text-[11px] text-white/50">
        <span className="text-white/25">{Icon.car}</span>
        {lesson.duration}m
      </div>
    </td>

    {/* Progress */}
    <td className="px-4 py-3.5">
      {lesson.completion_percentage != null ? (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${Math.min(100, lesson.completion_percentage)}%` }} />
          </div>
          <span className="text-[10px] text-white/40">
            {Math.round(lesson.completion_percentage)}%
          </span>
        </div>
      ) : <span className="text-[11px] text-white/20">—</span>}
    </td>

    {/* Status */}
    <td className="px-4 py-3.5">
      <StatusBadge s={lesson.status} />
    </td>

    {/* Actions */}
    <td className="px-4 py-3.5">
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(lesson)}
          className="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500/20
            text-blue-400 flex items-center justify-center transition-colors"
          title="Edit">
          {Icon.edit}
        </button>
        <button onClick={() => onDelete(lesson)}
          className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20
            text-red-400 flex items-center justify-center transition-colors"
          title="Delete">
          {Icon.trash}
        </button>
      </div>
    </td>
  </tr>
);

/* ─── Detail Drawer (slide-in panel) ────────────────────────── */
const LessonDrawer = ({ lesson, onClose, onEdit }) => {
  if (!lesson) return null;
  return (
    <>
      <div className="fixed inset-0 z-[50]" onClick={onClose}
        style={{ background: 'rgba(6,11,24,0.5)' }} />
      <div className="fixed right-0 top-0 h-full w-[340px] z-[55]
        bg-[#0B1221] border-l border-white/[0.07]
        flex flex-col"
        style={{ boxShadow: '-24px 0 64px rgba(0,0,0,0.4)' }}>

        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <span className="font-sora text-[13px] font-bold text-white">Lesson Details</span>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]
              text-white/40 hover:text-white flex items-center justify-center transition-all">
            {Icon.close}
          </button>
        </div>

        {/* content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {/* type icon */}
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

          {/* details grid */}
          {[
            { label: 'Instructor', value: lesson.instructor_name },
            { label: 'School',     value: lesson.school_name },
            { label: 'Date',       value: fmtDate(lesson.date) },
            { label: 'Duration',   value: `${lesson.duration} minutes` },
            { label: 'Progress',   value: lesson.completion_percentage != null ? `${Math.round(lesson.completion_percentage)}%` : '—' },
            { label: 'Status',     value: lesson.status_display || STATUSES[lesson.status]?.label },
          ].map(row => (
            <div key={row.label}
              className="flex justify-between items-start py-2.5 border-b border-white/[0.04]">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.5px]">
                {row.label}
              </span>
              <span className="text-[12px] text-white/70 text-right max-w-[55%]">
                {row.value || '—'}
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

        {/* footer */}
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
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [msg]);

  if (!msg) return null;
  return (
    <div className={cls(
      'fixed bottom-6 right-6 z-[80] flex items-center gap-3 px-4 py-3 rounded-2xl border',
      'shadow-2xl text-[12px] font-semibold transition-all font-dm',
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

/* ─── Stats card ─────────────────────────────────────────────── */
const StatCard = ({ emoji, label, value, accent }) => {
  const accents = {
    blue:   'from-blue-600/10 to-transparent border-blue-500/10',
    violet: 'from-violet-600/10 to-transparent border-violet-500/10',
    teal:   'from-teal-600/10 to-transparent border-teal-500/10',
    emerald:'from-emerald-600/10 to-transparent border-emerald-500/10',
    amber:  'from-amber-600/10 to-transparent border-amber-500/10',
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
const LessonsPage = () => {
  const [lessons,      setLessons]      = useState([]);
  const [instructors,  setInstructors]  = useState([]);
  const [schools,      setSchools]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [typeFilter,   setTypeFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editLesson,   setEditLesson]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [drawerLesson, setDrawerLesson] = useState(null);
  const [toast,        setToast]        = useState({ msg: '', type: 'success' });
  const [error,        setError]        = useState('');

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  /* ── fetch meta once ── */
  useEffect(() => {
    Promise.all([api.getInstructors(), api.getSchools()])
      .then(([ins, sch]) => {
        setInstructors(Array.isArray(ins) ? ins : ins?.results || []);
        setSchools(Array.isArray(sch) ? sch : sch?.results || []);
      })
      .catch(() => {});
  }, []);

  /* ── fetch lessons ── */
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

  /* ── create / update callback ── */
  const handleSuccess = (lesson, isEdit) => {
    setModalOpen(false);
    setEditLesson(null);
    if (isEdit) {
      setLessons(ls => ls.map(l => l.id === lesson.id ? lesson : l));
      showToast('Lesson updated successfully');
    } else {
      setLessons(ls => [lesson, ...ls]);
      showToast('Lesson created successfully');
    }
  };

  /* ── delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteLesson(deleteTarget.id);
      setLessons(ls => ls.filter(l => l.id !== deleteTarget.id));
      showToast('Lesson deleted');
    } catch {
      showToast('Failed to delete lesson', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const openCreate = () => { setEditLesson(null); setModalOpen(true); };
  const openEdit   = (l) => { setEditLesson(l);   setModalOpen(true); setDrawerLesson(null); };

  /* ── stats ── */
  const total     = lessons.length;
  const scheduled = lessons.filter(l => l.status === 'S').length;
  const completed = lessons.filter(l => l.status === 'C').length;
  const theory    = lessons.filter(l => l.lesson_type === 'T').length;
  const driving   = lessons.filter(l => l.lesson_type === 'D').length;

  const TABLE_HEADS = ['Lesson', 'Instructor', 'School', 'Date', 'Duration', 'Progress', 'Status', ''];

  return (
    <div className="flex h-screen bg-[#060B18] overflow-hidden font-dm">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Page header ── */}
        <header className="h-[52px] flex-shrink-0 bg-[#0B1221] border-b border-white/[0.06]
          flex items-center gap-3 px-5">
          <div className="flex items-baseline gap-2">
            <span className="font-sora text-[14px] font-bold text-white">Lessons</span>
            <span className="text-[11px] text-white/30">Manage all scheduled lessons</span>
          </div>
          <div className="flex-1" />
          <button onClick={openCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600
              hover:bg-blue-500 rounded-[7px] text-[11px] font-semibold text-white
              transition-all">
            {Icon.plus} New Lesson
          </button>
        </header>

        {/* ── Main scroll area ── */}
        <main className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/[0.07] border border-red-500/20
              rounded-xl px-4 py-3">
              {Icon.warn}
              <p className="text-[12px] text-red-400">{error}</p>
            </div>
          )}

          {/* ── Stats strip ── */}
          <div className="grid grid-cols-5 gap-3">
            <StatCard emoji="📚" label="Total lessons"   value={total}     accent="blue"    />
            <StatCard emoji="🗓️" label="Scheduled"       value={scheduled} accent="violet"  />
            <StatCard emoji="✅" label="Completed"        value={completed} accent="emerald" />
            <StatCard emoji="📖" label="Theory lessons"  value={theory}    accent="violet"  />
            <StatCard emoji="🚗" label="Driving lessons" value={driving}   accent="teal"    />
          </div>

          {/* ── Table card ── */}
          <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[14px] flex flex-col overflow-hidden">

            {/* Toolbar */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06] flex-wrap">

              {/* Search */}
              <div className="relative w-[220px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">
                  {Icon.search}
                </span>
                <input
                  type="text" value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search lessons…"
                  className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl
                    pl-9 pr-4 py-2 text-[12px] text-white placeholder:text-white/20
                    outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all"
                />
              </div>

              {/* Type filter */}
              <div className="flex bg-white/[0.04] rounded-[8px] p-0.5 gap-0.5">
                {[['', 'All'], ['T', '📖 Theory'], ['D', '🚗 Driving']].map(([v, l]) => (
                  <button key={v}
                    onClick={() => setTypeFilter(v)}
                    className={cls(
                      'px-3 py-1.5 rounded-[6px] text-[10px] font-semibold transition-all',
                      typeFilter === v
                        ? 'bg-white/[0.1] text-white'
                        : 'text-white/30 hover:text-white/60',
                    )}>
                    {l}
                  </button>
                ))}
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-white/[0.03] border border-white/[0.07] rounded-xl
                  px-3 py-2 text-[11px] text-white/60 outline-none
                  focus:border-blue-500/40 transition-all appearance-none cursor-pointer">
                <option value="">All statuses</option>
                {Object.entries(STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>

              <div className="flex-1" />

              {/* Refresh */}
              <button onClick={fetchLessons}
                className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]
                  text-white/30 hover:text-white flex items-center justify-center transition-all"
                title="Refresh">
                {Icon.refresh}
              </button>
            </div>

            {/* Table */}
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
                    ? <EmptyState onAdd={openCreate} />
                    : lessons.map(l => (
                        <LessonRow
                          key={l.id}
                          lesson={l}
                          onEdit={openEdit}
                          onDelete={setDeleteTarget}
                        />
                      ))
                  }
                </tbody>
              </table>
            </div>

            {/* Footer */}
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

      {/* ── Lesson drawer ── */}
      <LessonDrawer
        lesson={drawerLesson}
        onClose={() => setDrawerLesson(null)}
        onEdit={openEdit}
      />

      {/* ── Create / Edit modal ── */}
      <LessonModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditLesson(null); }}
        onSuccess={handleSuccess}
        lesson={editLesson}
        instructors={instructors}
        schools={schools}
      />

      {/* ── Delete confirm ── */}
      <DeleteDialog
        open={!!deleteTarget}
        lesson={deleteTarget}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Toast ── */}
      <Toast msg={toast.msg} type={toast.type} onDone={() => setToast({ msg: '', type: 'success' })} />
    </div>
  );
};

export default LessonsPage;