// src/pages/AttendancePage/AttendancePage.jsx
//
// Full view for Attendance — list, filter, mark, bulk-mark, delete.
// Matches DriveIQ dashboard design system exactly (mirrors LessonsPage).
//
// APIs used:
//   GET    /api/attendance/                     → list records (role-filtered)
//   POST   /api/attendance/                     → create single record
//   PATCH  /api/attendance/:id/                 → update record
//   DELETE /api/attendance/:id/                 → delete record
//   POST   /api/attendance/bulk_create/         → bulk create
//   GET    /api/attendance/my_attendance/       → student's own records
//   GET    /api/attendance/lesson_summary/?lesson_id= → lesson summary
//   GET    /api/attendance/student_summary/?student_id= → student summary
//   GET    /api/attendance/statistics/          → role-based stats
//   GET    /api/lesson/                         → lessons list (for select)
//   GET    /api/studentprofile/                 → students (for select)

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../Sidebar';

const API = import.meta.env.VITE_API_URL;

/* ─── API layer ──────────────────────────────────────────────── */
const attendanceApi = {
  getAll:          (qs = '')   => axios.get(`${API}/attendance/${qs ? `?${qs}` : ''}`).then(r => r.data),
  create:          (payload)   => axios.post(`${API}/attendance/`, payload).then(r => r.data),
  update:          (id, data)  => axios.patch(`${API}/attendance/${id}/`, data).then(r => r.data),
  remove:          (id)        => axios.delete(`${API}/attendance/${id}/`),
  bulkCreate:      (records)   => axios.post(`${API}/attendance/bulk_create/`, { attendance_records: records }).then(r => r.data),
  myAttendance:    ()          => axios.get(`${API}/attendance/my_attendance/`).then(r => r.data),
  lessonSummary:   (lessonId)  => axios.get(`${API}/attendance/lesson_summary/?lesson_id=${lessonId}`).then(r => r.data),
  studentSummary:  (studentId) => axios.get(`${API}/attendance/student_summary/?student_id=${studentId}`).then(r => r.data),
  statistics:      ()          => axios.get(`${API}/attendance/statistics/`).then(r => r.data),
  getLessons:      ()          => axios.get(`${API}/lesson/`).then(r => r.data.results ?? r.data),
  getStudents:     ()          => axios.get(`${API}/studentprofile/`).then(r => r.data.results ?? r.data),
};

/* ─── Helpers ────────────────────────────────────────────────── */
const cls = (...a) => a.filter(Boolean).join(' ');

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

/* ─── Icons ──────────────────────────────────────────────────── */
const Icon = {
  plus:    <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  search:  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  refresh: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11 6.5A4.5 4.5 0 112 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M11 3v3.5H7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  edit:    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5l2 2L4 10H2v-2L8.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  trash:   <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M5 3V2h2v1M4 3v7h4V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  close:   <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  check:   <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3.5 3.5L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  warn:    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2L13 12H1L7 2z" stroke="#f87171" strokeWidth="1.2"/><path d="M7 6v3" stroke="#f87171" strokeWidth="1.2" strokeLinecap="round"/><circle cx="7" cy="10.5" r="0.6" fill="#f87171"/></svg>,
  clock:   <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6 3.5V6l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  bulk:    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="7" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="7" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M9.5 7v5M7 9.5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  user:    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 11c0-2.8 2.2-4 5-4s5 1.2 5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  book:    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="2" y="1" width="8" height="10" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><path d="M4 4h4M4 6.5h4M4 9h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
};

/* ─── Primitives ─────────────────────────────────────────────── */

const PresenceBadge = ({ present }) => (
  <span className={cls(
    'inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md border',
    present
      ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20'
      : 'bg-red-500/12 text-red-400 border-red-500/20',
  )}>
    {present ? '✓ Present' : '✗ Absent'}
  </span>
);

const SkeletonRow = () => (
  <tr>
    {[50, 130, 120, 90, 70, 60, 50].map((w, i) => (
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
          📋
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-blue-600/20
          border border-blue-500/30 flex items-center justify-center text-blue-400">
          {Icon.plus}
        </div>
      </div>
      <div className="text-center">
        <p className="font-sora text-[14px] font-bold text-white/60">No attendance records</p>
        <p className="text-[11px] text-white/25 mt-1">Start by marking attendance for a lesson.</p>
      </div>
      <button onClick={onAdd}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500
          rounded-xl text-[12px] font-semibold text-white transition-all">
        {Icon.plus} Mark Attendance
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
  outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all`;

const selectCls = `w-full bg-[#0B1221] border border-white/[0.08] rounded-xl
  px-3 py-2.5 text-[12px] text-white
  outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer`;

/* ─── Attendance Modal (create / edit) ───────────────────────── */
const EMPTY_FORM = {
  student: '', lesson: '', presence: true,
  hours_completed: '', notes: '',
};

const AttendanceModal = ({ open, onClose, onSuccess, record, lessons, students }) => {
  const isEdit = !!record;
  const [form,   setForm]   = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiErr, setApiErr] = useState('');

  useEffect(() => {
    if (open) {
      setErrors({}); setApiErr('');
      if (isEdit && record) {
        setForm({
          student:         record.student || '',
          lesson:          record.lesson  || '',
          presence:        record.presence ?? true,
          hours_completed: record.hours_completed || '',
          notes:           record.notes || '',
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, record]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.student)  e.student = 'Select a student';
    if (!form.lesson)   e.lesson  = 'Select a lesson';
    if (form.presence && (!form.hours_completed || Number(form.hours_completed) <= 0))
      e.hours_completed = 'Enter hours when student is present';
    if (!form.presence && Number(form.hours_completed) > 0)
      e.hours_completed = 'Hours must be 0 when absent';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true); setApiErr('');
    try {
      const payload = {
        ...form,
        student:         Number(form.student),
        lesson:          Number(form.lesson),
        hours_completed: Number(form.hours_completed) || 0,
      };
      let result;
      if (isEdit) {
        result = await attendanceApi.update(record.id, payload);
      } else {
        result = await attendanceApi.create(payload);
      }
      if (result?.id) {
        onSuccess(result, isEdit);
      } else {
        const msg = Object.values(result || {}).flat().join(' ');
        setApiErr(msg || 'Something went wrong');
      }
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const msg = Object.values(data).flat().join(' ');
        setApiErr(msg);
      } else {
        setApiErr('Network error. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(6,11,24,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="bg-[#0B1221] border border-white/[0.08] rounded-2xl w-full max-w-[500px]
        shadow-2xl flex flex-col max-h-[90vh]"
        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/15 border border-emerald-500/20
              flex items-center justify-center text-emerald-400">
              {Icon.check}
            </div>
            <div>
              <h2 className="font-sora text-[14px] font-bold text-white">
                {isEdit ? 'Edit Attendance' : 'Mark Attendance'}
              </h2>
              <p className="text-[10px] text-white/30">
                {isEdit ? 'Update attendance record' : 'Record a student attendance'}
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

          {/* Student + Lesson */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Student" error={errors.student}>
              <select className={selectCls}
                value={form.student}
                onChange={e => set('student', e.target.value)}
                disabled={isEdit}>
                <option value="">Select student…</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.user_first_name || s.user_username} {s.user_last_name || ''}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Lesson" error={errors.lesson}>
              <select className={selectCls}
                value={form.lesson}
                onChange={e => set('lesson', e.target.value)}
                disabled={isEdit}>
                <option value="">Select lesson…</option>
                {lessons.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.title || `Lesson #${l.id}`}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Presence toggle */}
          <Field label="Attendance Status">
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: true,  label: '✓ Present', on: 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300' },
                { val: false, label: '✗ Absent',  on: 'bg-red-600/20 border-red-500/40 text-red-300' },
              ].map(opt => (
                <button key={String(opt.val)}
                  type="button"
                  onClick={() => {
                    set('presence', opt.val);
                    if (!opt.val) set('hours_completed', '0');
                  }}
                  className={cls(
                    'py-2.5 rounded-xl border text-[11px] font-semibold transition-all',
                    form.presence === opt.val
                      ? opt.on
                      : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/70',
                  )}>
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Hours */}
          <Field label="Hours Completed" error={errors.hours_completed}>
            <input
              type="number"
              min={0}
              max={480}
              step={0.5}
              className={inputCls}
              placeholder="e.g. 2"
              value={form.hours_completed}
              disabled={!form.presence}
              onChange={e => set('hours_completed', e.target.value)}
            />
            {form.presence && (
              <div className="flex gap-1.5 mt-1">
                {[0.5, 1, 1.5, 2].map(h => (
                  <button key={h} type="button"
                    onClick={() => set('hours_completed', h)}
                    className={cls(
                      'flex-1 py-1 rounded-lg text-[9px] font-bold border transition-all',
                      Number(form.hours_completed) === h
                        ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
                        : 'bg-white/[0.03] border-white/[0.06] text-white/25 hover:text-white/50',
                    )}>
                    {h}h
                  </button>
                ))}
              </div>
            )}
          </Field>

          {/* Notes */}
          <Field label="Notes (optional)">
            <textarea
              className={cls(inputCls, 'resize-none h-16')}
              placeholder="Any remarks about this attendance…"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
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
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500
              text-[13px] font-bold text-white transition-all disabled:opacity-50
              flex items-center justify-center gap-2">
            {saving
              ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30
                  border-t-white animate-spin" />Saving…</>
              : isEdit ? 'Save Changes' : 'Mark Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Delete Dialog ──────────────────────────────────────────── */
const DeleteDialog = ({ open, record, onConfirm, onCancel, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(6,11,24,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="bg-[#0F1A2E] border border-white/[0.08] rounded-2xl p-6 w-full max-w-[340px]">
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20
            flex items-center justify-center mx-auto mb-4 text-2xl">🗑️</div>
          <h3 className="font-sora text-[15px] font-bold text-white">Remove record?</h3>
          <p className="text-[12px] text-white/40 mt-2 leading-relaxed">
            <span className="text-white/70 font-semibold">
              {record?.student_name}
            </span> — {record?.lesson_name}
            <br />This cannot be undone.
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
            {loading ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Lesson Summary Drawer ──────────────────────────────────── */
const SummaryDrawer = ({ summary, onClose }) => {
  if (!summary) return null;
  const { lesson, summary: s, attendance_records: records = [] } = summary;

  return (
    <>
      <div className="fixed inset-0 z-[50]" onClick={onClose}
        style={{ background: 'rgba(6,11,24,0.5)' }} />
      <div className="fixed right-0 top-0 h-full w-[360px] z-[55]
        bg-[#0B1221] border-l border-white/[0.07] flex flex-col"
        style={{ boxShadow: '-24px 0 64px rgba(0,0,0,0.4)' }}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <span className="font-sora text-[13px] font-bold text-white">Lesson Summary</span>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]
              text-white/40 hover:text-white flex items-center justify-center transition-all">
            {Icon.close}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {/* Lesson info */}
          <div className="bg-blue-600/08 border border-blue-500/15 rounded-2xl px-4 py-4">
            <p className="font-sora text-[15px] font-bold text-white mb-1">
              {lesson?.title || '—'}
            </p>
            <p className="text-[10px] text-white/35">{fmtDate(lesson?.date)}</p>
            <p className="text-[10px] text-white/35 mt-0.5">
              Instructor: {lesson?.instructor || '—'}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Total Students', value: s?.total_students ?? '—', color: 'text-white' },
              { label: 'Present',        value: s?.present ?? '—',        color: 'text-emerald-400' },
              { label: 'Absent',         value: s?.absent ?? '—',         color: 'text-red-400' },
              { label: 'Attendance Rate', value: s?.attendance_rate != null ? `${s.attendance_rate}%` : '—', color: 'text-blue-400' },
            ].map(stat => (
              <div key={stat.label}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-3">
                <div className={`font-sora text-[20px] font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-[9px] text-white/30 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Avg hours */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 flex justify-between items-center">
            <span className="text-[10px] text-white/30">Avg. hours completed</span>
            <span className="text-[13px] font-bold text-white">
              {s?.average_hours_completed ?? '—'}h
            </span>
          </div>

          {/* Records list */}
          <div className="flex flex-col gap-1.5">
            <p className="text-[9px] font-bold text-white/25 uppercase tracking-[0.6px]">
              Attendance Records
            </p>
            {records.length === 0
              ? <p className="text-[11px] text-white/20 py-4 text-center">No records yet</p>
              : records.map(r => (
                  <div key={r.id}
                    className="flex items-center justify-between bg-white/[0.02]
                      border border-white/[0.05] rounded-xl px-3 py-2.5">
                    <div>
                      <p className="text-[11px] font-semibold text-white">{r.student_name}</p>
                      <p className="text-[9px] text-white/30 mt-0.5">{r.hours_completed}h completed</p>
                    </div>
                    <PresenceBadge present={r.presence} />
                  </div>
                ))
            }
          </div>
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
      'shadow-2xl text-[12px] font-semibold font-dm',
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
    emerald: 'from-emerald-600/10 to-transparent border-emerald-500/10',
    red:     'from-red-600/10 to-transparent border-red-500/10',
    amber:   'from-amber-600/10 to-transparent border-amber-500/10',
    violet:  'from-violet-600/10 to-transparent border-violet-500/10',
  };
  return (
    <div className={cls(
      'bg-[#0F1A2E] rounded-[14px] px-4 py-3.5 border bg-gradient-to-br',
      'hover:border-white/[0.12] transition-colors',
      accents[accent] || 'border-white/[0.07]',
    )}>
      <div className="text-xl mb-2">{emoji}</div>
      <div className="font-sora text-[26px] font-black text-white tracking-tight">{value ?? '—'}</div>
      <div className="text-[10px] text-white/30 mt-0.5">{label}</div>
    </div>
  );
};

/* ─── Attendance Row ─────────────────────────────────────────── */
const AttendanceRow = ({ record, onEdit, onDelete, onLessonClick }) => (
  <tr className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group cursor-default">

    {/* Student */}
    <td className="px-4 py-3.5">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-[8px] bg-blue-700/40 flex items-center justify-center
          text-[9px] font-bold text-white flex-shrink-0">
          {(record.student_name?.[0] || '?').toUpperCase()}
        </div>
        <div className="text-[12px] font-semibold text-white">{record.student_name || '—'}</div>
      </div>
    </td>

    {/* Lesson */}
    <td className="px-4 py-3.5">
      <button
        onClick={() => onLessonClick(record.lesson)}
        className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline transition-colors text-left">
        {record.lesson_name || `Lesson #${record.lesson}`}
      </button>
      <div className="text-[9px] text-white/25 mt-0.5">{record.instructor_name || '—'}</div>
    </td>

    {/* Presence */}
    <td className="px-4 py-3.5">
      <PresenceBadge present={record.presence} />
    </td>

    {/* Hours */}
    <td className="px-4 py-3.5">
      <div className="flex items-center gap-1.5">
        <div className="w-14 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${Math.min(100, (Number(record.hours_completed) / 8) * 100)}%` }}
          />
        </div>
        <span className="text-[10px] text-white/50">
          {record.hours_completed || 0}h
        </span>
      </div>
    </td>

    {/* Notes */}
    <td className="px-4 py-3.5">
      <span className="text-[10px] text-white/35 line-clamp-1 max-w-[140px] block">
        {record.notes || <span className="text-white/15">—</span>}
      </span>
    </td>

    {/* Date */}
    <td className="px-4 py-3.5">
      <div className="flex items-center gap-1.5 text-[10px] text-white/35">
        {Icon.clock}
        {fmtDate(record.created_at)}
      </div>
    </td>

    {/* Actions */}
    <td className="px-4 py-3.5">
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(record)}
          className="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500/20
            text-blue-400 flex items-center justify-center transition-colors"
          title="Edit">
          {Icon.edit}
        </button>
        <button onClick={() => onDelete(record)}
          className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20
            text-red-400 flex items-center justify-center transition-colors"
          title="Delete">
          {Icon.trash}
        </button>
      </div>
    </td>
  </tr>
);

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
const AttendancePage = () => {
  const [records,       setRecords]       = useState([]);
  const [lessons,       setLessons]       = useState([]);
  const [students,      setStudents]      = useState([]);
  const [stats,         setStats]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [presenceFilter,setPresenceFilter]= useState('');
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editRecord,    setEditRecord]    = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleting,      setDeleting]      = useState(false);
  const [summary,       setSummary]       = useState(null);
  const [summaryLoading,setSummaryLoading]= useState(false);
  const [toast,         setToast]         = useState({ msg: '', type: 'success' });
  const [error,         setError]         = useState('');

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  /* ── fetch meta ── */
  useEffect(() => {
    Promise.all([attendanceApi.getLessons(), attendanceApi.getStudents()])
      .then(([les, stu]) => {
        setLessons(Array.isArray(les) ? les : les?.results || []);
        setStudents(Array.isArray(stu) ? stu : stu?.results || []);
      })
      .catch(() => {});

    attendanceApi.statistics()
      .then(setStats)
      .catch(() => {});
  }, []);

  /* ── fetch records ── */
  const fetchRecords = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (search)         params.set('search', search);
      if (presenceFilter !== '') params.set('presence', presenceFilter);
      const data = await attendanceApi.getAll(params.toString());
      const list = Array.isArray(data) ? data : data?.results || [];
      setRecords(list);
    } catch {
      setError('Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  }, [search, presenceFilter]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  /* ── lesson summary drawer ── */
  const openLessonSummary = async (lessonId) => {
    if (!lessonId) return;
    setSummaryLoading(true);
    try {
      const data = await attendanceApi.lessonSummary(lessonId);
      setSummary(data);
    } catch {
      showToast('Could not load lesson summary', 'error');
    } finally {
      setSummaryLoading(false);
    }
  };

  /* ── create / update ── */
  const handleSuccess = (rec, isEdit) => {
    setModalOpen(false);
    setEditRecord(null);
    if (isEdit) {
      setRecords(rs => rs.map(r => r.id === rec.id ? rec : r));
      showToast('Attendance updated');
    } else {
      setRecords(rs => [rec, ...rs]);
      showToast('Attendance marked');
    }
    // refresh stats
    attendanceApi.statistics().then(setStats).catch(() => {});
  };

  /* ── delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await attendanceApi.remove(deleteTarget.id);
      setRecords(rs => rs.filter(r => r.id !== deleteTarget.id));
      showToast('Record removed');
    } catch {
      showToast('Failed to remove record', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const openCreate = () => { setEditRecord(null); setModalOpen(true); };
  const openEdit   = (r) => { setEditRecord(r); setModalOpen(true); };

  /* ── derived stats from list (fallback if API stats unavailable) ── */
  const totalCount   = records.length;
  const presentCount = records.filter(r => r.presence).length;
  const absentCount  = totalCount - presentCount;
  const attendanceRate = totalCount > 0
    ? Math.round((presentCount / totalCount) * 100)
    : 0;

  const TABLE_HEADS = ['Student', 'Lesson', 'Status', 'Hours', 'Notes', 'Recorded', ''];

  return (
    <div className="flex h-screen bg-[#060B18] overflow-hidden font-dm">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Page header ── */}
        <header className="h-[52px] flex-shrink-0 bg-[#0B1221] border-b border-white/[0.06]
          flex items-center gap-3 px-5">
          <div className="flex items-baseline gap-2">
            <span className="font-sora text-[14px] font-bold text-white">Attendance</span>
            <span className="text-[11px] text-white/30">Track student attendance per lesson</span>
          </div>
          <div className="flex-1" />
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600
              hover:bg-emerald-500 rounded-[7px] text-[11px] font-semibold text-white
              transition-all">
            {Icon.plus} Mark Attendance
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

          {/* Summary loading */}
          {summaryLoading && (
            <div className="flex items-center gap-2 text-[11px] text-blue-400 px-1">
              <span className="w-3 h-3 rounded-full border-2 border-blue-400/30
                border-t-blue-400 animate-spin" />
              Loading lesson summary…
            </div>
          )}

          {/* ── Stats strip ── */}
          <div className="grid grid-cols-4 gap-3">
            <StatCard
              emoji="📋"
              label="Total records"
              value={stats?.total_attendance_records ?? stats?.total_lessons ?? totalCount}
              accent="blue"
            />
            <StatCard
              emoji="✅"
              label="Present"
              value={stats?.students_present ?? stats?.attended ?? presentCount}
              accent="emerald"
            />
            <StatCard
              emoji="❌"
              label="Absent"
              value={stats?.students_absent ?? stats?.missed ?? absentCount}
              accent="red"
            />
            <StatCard
              emoji="📊"
              label="Attendance rate"
              value={
                stats?.overall_attendance_rate != null
                  ? `${stats.overall_attendance_rate}%`
                  : stats?.attendance_rate != null
                  ? `${stats.attendance_rate}%`
                  : `${attendanceRate}%`
              }
              accent="violet"
            />
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
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by student or notes…"
                  className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl
                    pl-9 pr-4 py-2 text-[12px] text-white placeholder:text-white/20
                    outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all"
                />
              </div>

              {/* Presence filter */}
              <div className="flex bg-white/[0.04] rounded-[8px] p-0.5 gap-0.5">
                {[
                  ['', 'All'],
                  ['true', '✓ Present'],
                  ['false', '✗ Absent'],
                ].map(([v, l]) => (
                  <button key={v}
                    onClick={() => setPresenceFilter(v)}
                    className={cls(
                      'px-3 py-1.5 rounded-[6px] text-[10px] font-semibold transition-all',
                      presenceFilter === v
                        ? 'bg-white/[0.1] text-white'
                        : 'text-white/30 hover:text-white/60',
                    )}>
                    {l}
                  </button>
                ))}
              </div>

              <div className="flex-1" />

              {/* Refresh */}
              <button onClick={fetchRecords}
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
                    : records.length === 0
                    ? <EmptyState onAdd={openCreate} />
                    : records.map(record => (
                        <AttendanceRow
                          key={record.id}
                          record={record}
                          onEdit={openEdit}
                          onDelete={setDeleteTarget}
                          onLessonClick={openLessonSummary}
                        />
                      ))
                  }
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            {!loading && records.length > 0 && (
              <div className="px-5 py-3 border-t border-white/[0.05] flex items-center justify-between">
                <span className="text-[10px] text-white/25">
                  {records.length} record{records.length !== 1 ? 's' : ''}
                </span>
                <span className="text-[10px] text-white/20">
                  {presentCount} present · {absentCount} absent
                </span>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Lesson summary drawer ── */}
      <SummaryDrawer summary={summary} onClose={() => setSummary(null)} />

      {/* ── Create / Edit modal ── */}
      <AttendanceModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditRecord(null); }}
        onSuccess={handleSuccess}
        record={editRecord}
        lessons={lessons}
        students={students}
      />

      {/* ── Delete confirm ── */}
      <DeleteDialog
        open={!!deleteTarget}
        record={deleteTarget}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Toast ── */}
      <Toast
        msg={toast.msg}
        type={toast.type}
        onDone={() => setToast({ msg: '', type: 'success' })}
      />
    </div>
  );
};

export default AttendancePage;