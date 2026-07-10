// src/pages/LessonsPage/LessonsPage.jsx
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

const studentDisplayName = (s) =>
  [s.user_first_name, s.user_last_name].filter(Boolean).join(' ') ||
  s.user_username ||
  `Student #${s.id}`;
  
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
  plus:    <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  search:  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  refresh: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11 6.5A4.5 4.5 0 112 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M11 3v3.5H7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  edit:    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5l2 2L4 10H2v-2L8.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  trash:   <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M5 3V2h2v1M4 3v7h4V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  close:   <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  book:    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 4h6M4 7h6M4 10h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
  clock:   <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6 3.5V6l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  car:     <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 8h9M3.5 8V10M9.5 8V10M2.5 8l1.5-4h5l1.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  warn:    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2L13 12H1L7 2z" stroke="#f87171" strokeWidth="1.2"/><path d="M7 6v3" stroke="#f87171" strokeWidth="1.2" strokeLinecap="round"/><circle cx="7" cy="10.5" r="0.6" fill="#f87171"/></svg>,
  users:   <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M1 11c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M9 6.5c1.1 0 2 .9 2 2v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="9.5" cy="3.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>,
  check:   <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  info:    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M6.5 6v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="6.5" cy="4" r="0.7" fill="currentColor"/></svg>,
  chevron: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
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
  <tr><td colSpan={9}>
    <div className="flex flex-col items-center justify-center py-20 gap-5">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07]
          flex items-center justify-center text-3xl">📚</div>
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
const Field = ({ label, children, error, hint }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-white/40 tracking-[0.5px] uppercase">{label}</label>
    {children}
    {hint  && !error && <p className="text-[10px] text-white/25">{hint}</p>}
    {error && <p className="text-[10px] text-red-400">{error}</p>}
  </div>
);

const inputCls = `w-full bg-white/[0.04] border border-white/[0.08] rounded-xl
  px-3 py-2.5 text-[12px] text-white placeholder:text-white/20
  outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all`;

const selectCls = `w-full bg-[#0B1221] border border-white/[0.08] rounded-xl
  px-3 py-2.5 text-[12px] text-white
  outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer`;

/* ─── Student Avatar ─────────────────────────────────────────── */
const StudentAvatar = ({ name, size = 8 }) => (
  <div className={cls(
    `w-${size} h-${size} rounded-lg bg-white/[0.07] border border-white/[0.1]`,
    'flex items-center justify-center text-[11px] font-bold text-white/60 flex-shrink-0',
  )}>
    {name?.[0]?.toUpperCase() || '?'}
  </div>
);

/* ─── Student Picker (used inside modal) ─────────────────────── */
/**
 * Props:
 *   students        – full list fetched from API
 *   selected        – array of student IDs
 *   onChange        – (newIds: number[]) => void
 *   max             – max selectable (1–4 for driving)
 *   lessonType      – 'T' | 'D'
 *   loading         – bool
 *   targetLicense   – 'A' | 'C' | 'M'  (for theory info label)
 */
const StudentPicker = ({ students, selected, onChange, max, lessonType, loading, targetLicense }) => {
  const [search, setSearch] = useState('');

  const filtered = students.filter(s => {
    const name = studentDisplayName(s).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter(x => x !== id));
    } else {
      if (selected.length >= max) return; // cap at max
      onChange([...selected, id]);
    }
  };

  const selectAll = () => {
    // theory: select all (no cap); driving: capped at max
    const ids = filtered.map(s => s.id);
    if (lessonType === 'T') {
      onChange([...new Set([...selected, ...ids])]);
    } else {
      const slots = max - selected.length;
      if (slots <= 0) return;
      const toAdd = ids.filter(id => !selected.includes(id)).slice(0, slots);
      onChange([...selected, ...toAdd]);
    }
  };

  const clearAll = () => onChange([]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 gap-2 bg-white/[0.02] rounded-xl border border-white/[0.05]">
        <span className="text-2xl">👥</span>
        <p className="text-[11px] text-white/30 text-center">
          {lessonType === 'T' && targetLicense !== 'A'
            ? `No active students with a ${targetLicense === 'C' ? 'Car' : 'Moto'} license in this school`
            : 'No active students found in this school'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Search + controls */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20">
            {Icon.search}
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full bg-white/[0.03] border border-white/[0.07] rounded-lg
              pl-8 pr-3 py-1.5 text-[11px] text-white placeholder:text-white/20
              outline-none focus:border-blue-500/40 transition-all"
          />
        </div>
        <button type="button" onClick={selectAll}
          className="px-2.5 py-1.5 text-[10px] font-semibold rounded-lg
            bg-blue-600/10 border border-blue-500/20 text-blue-400
            hover:bg-blue-600/20 transition-all whitespace-nowrap">
          {lessonType === 'D' ? `Fill slots` : 'All'}
        </button>
        {selected.length > 0 && (
          <button type="button" onClick={clearAll}
            className="px-2.5 py-1.5 text-[10px] font-semibold rounded-lg
              bg-white/[0.04] border border-white/[0.07] text-white/30
              hover:text-white/60 transition-all">
            Clear
          </button>
        )}
      </div>

      {/* Count indicator (driving) */}
      {lessonType === 'D' && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${(selected.length / max) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-white/30 whitespace-nowrap">
            {selected.length} / {max} selected
          </span>
        </div>
      )}

      {/* Theory info */}
      {lessonType === 'T' && (
        <div className="flex items-start gap-2 bg-violet-500/[0.06] border border-violet-500/15
          rounded-lg px-3 py-2">
          <span className="text-violet-400 mt-0.5 flex-shrink-0">{Icon.info}</span>
          <p className="text-[10px] text-violet-300/70 leading-relaxed">
            Theory lessons <strong className="text-violet-300">auto-enroll</strong> all matching
            students on creation. The list below shows who will be enrolled.
          </p>
        </div>
      )}

      {/* Student list */}
      <div className="max-h-[200px] overflow-y-auto flex flex-col gap-1.5 pr-0.5">
        {filtered.length === 0 ? (
          <p className="text-[11px] text-white/25 text-center py-4">No match for "{search}"</p>
        ) : (
          filtered.map(s => {
            const isSelected = selected.includes(s.id);
            const isFull = !isSelected && lessonType === 'D' && selected.length >= max;
            const name = studentDisplayName(s);
            const license = s.license_type === 'C' ? '🚗 Car' : s.license_type === 'M' ? '🏍️ Moto' : '—';

            return (
              <button
                key={s.id}
                type="button"
                disabled={isFull}
                onClick={() => toggle(s.id)}
                className={cls(
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border text-left transition-all',
                  lessonType === 'T'
                    ? isSelected
                      ? 'bg-violet-600/10 border-violet-500/25 cursor-default'
                      : 'bg-white/[0.02] border-white/[0.05] cursor-default opacity-50'
                    : isSelected
                    ? 'bg-emerald-600/10 border-emerald-500/25 hover:border-emerald-500/40'
                    : isFull
                    ? 'bg-white/[0.02] border-white/[0.04] opacity-30 cursor-not-allowed'
                    : 'bg-white/[0.03] border-white/[0.07] hover:border-white/[0.15] hover:bg-white/[0.05]',
                )}
              >
                {/* Checkbox — driving only */}
                {lessonType === 'D' && (
                  <div className={cls(
                    'w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-all',
                    isSelected ? 'bg-emerald-600 border-emerald-500' : 'border-white/20',
                  )}>
                    {isSelected && Icon.check}
                  </div>
                )}

                {/* Theory auto-tick */}
                {lessonType === 'T' && (
                  <div className={cls(
                    'w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0',
                    'bg-violet-600/30 border-violet-500/40',
                  )}>
                    {Icon.check}
                  </div>
                )}

                {/* Avatar */}
                <div className={cls(
                  'w-7 h-7 rounded-lg border flex items-center justify-center',
                  'text-[11px] font-bold flex-shrink-0',
                  isSelected
                    ? lessonType === 'T'
                      ? 'bg-violet-500/15 border-violet-500/25 text-violet-300'
                      : 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300'
                    : 'bg-white/[0.06] border-white/[0.08] text-white/50',
                )}>
                  {name[0]?.toUpperCase() || '?'}
                </div>

                {/* Name + license */}
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-white truncate">{name}</div>
                  <div className="text-[10px] text-white/30 mt-0.5">{license}</div>
                </div>

                {/* Badge */}
                {isSelected && (
                  <span className={cls(
                    'text-[9px] font-bold rounded-md px-1.5 py-0.5 flex-shrink-0 border',
                    lessonType === 'T'
                      ? 'text-violet-400 bg-violet-500/10 border-violet-500/20'
                      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                  )}>
                    {lessonType === 'T' ? 'Auto' : 'Selected'}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

/* ─── Lesson Form Modal ──────────────────────────────────────── */
const EMPTY_FORM = {
  title: '', lesson_type: 'T', description: '',
  duration: 60, date: '', status: 'S',
  instructor: '', school: '',
  target_license_type: 'A',
  max_students: 1,
};

const LessonModal = ({ open, onClose, onSuccess, lesson, instructors, schools }) => {
  const isEdit = !!lesson;

  // Step: 'form' | 'students'  (only for driving create)
  const [step, setStep] = useState('form');

  const [form, setForm]           = useState(EMPTY_FORM);
  const [errors, setErrors]       = useState({});
  const [saving, setSaving]       = useState(false);
  const [apiErr, setApiErr]       = useState('');

  // Students for picker
  const [students,      setStudents]      = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Track last fetched school+license so we don't re-fetch unnecessarily
  const lastFetchRef = useRef({ school: null, license: null, type: null });

  useEffect(() => {
    if (open) {
      setErrors({});
      setApiErr('');
      setStep('form');
      setStudents([]);
      setSelectedStudents([]);
      lastFetchRef.current = { school: null, license: null, type: null };

      if (isEdit && lesson) {
        setForm({
          title:               lesson.title || '',
          lesson_type:         lesson.lesson_type || 'T',
          description:         lesson.description || '',
          duration:            lesson.duration || 60,
          date:                fmtDateInput(lesson.date),
          status:              lesson.status || 'S',
          instructor:          lesson.instructor || '',
          school:              lesson.school || '',
          target_license_type: lesson.target_license_type || 'A',
          max_students:        lesson.max_students || 1,
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, lesson]);

  // Auto-fetch students whenever school / target_license_type / lesson_type changes
  // and we're already on the student step (or about to preview for theory)
  useEffect(() => {
    const { school, target_license_type, lesson_type } = form;
    if (!school || !open) return;

    const key = { school, license: target_license_type, type: lesson_type };
    const last = lastFetchRef.current;
    if (key.school === last.school && key.license === last.license && key.type === last.type) return;

    lastFetchRef.current = key;
    setStudentsLoading(true);
    setStudents([]);
    setSelectedStudents([]);

    const licenseFilter = lesson_type === 'T' ? target_license_type : undefined;
    api.getStudentsBySchool(school, licenseFilter)
      .then(data => {
        const list = Array.isArray(data) ? data : data?.results || [];
        setStudents(list.filter(p => p.user_role == 'S'));
        // Theory: auto-select all
        if (lesson_type === 'T') {
          setSelectedStudents(list.map(s => s.id));
        }
      })
      .catch(() => setStudents([]))
      .finally(() => setStudentsLoading(false));
  }, [form.school, form.target_license_type, form.lesson_type, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validateForm = () => {
    const e = {};
    if (!form.title.trim())  e.title = 'Title is required';
    if (!form.date)          e.date = 'Date & time required';
    if (!form.instructor)    e.instructor = 'Select an instructor';
    if (!form.school)        e.school = 'Select a school';
    if (form.duration < 30)  e.duration = 'Minimum 30 minutes';
    if (form.duration > 480) e.duration = 'Maximum 480 minutes';
    if (form.lesson_type === 'D' && (form.max_students < 1 || form.max_students > 4))
      e.max_students = 'Between 1 and 4 students';
    return e;
  };

  // Step 1 → Step 2 (driving create) or submit directly
  const handleFormNext = () => {
    const e = validateForm();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setApiErr('');

    if (!isEdit && form.lesson_type === 'D') {
      // Go to student picker step
      setStep('students');
      return;
    }

    // Theory create or any edit — submit directly
    submitLesson([]);
  };

  // Final submit
  const submitLesson = async (studentIds) => {
    setSaving(true); setApiErr('');
    try {
      const payload = {
        ...form,
        duration:     Number(form.duration),
        instructor:   Number(form.instructor),
        school:       Number(form.school),
        max_students: Number(form.max_students),
      };

      let result;
      if (isEdit) {
        result = await api.updateLesson(lesson.id, payload);
      } else {
        result = await api.createLesson(payload);
      }

      if (!result?.id) {
        const msg = Object.values(result || {}).flat().join(' ');
        setApiErr(msg || 'Something went wrong');
        setSaving(false);
        return;
      }

      // For new driving lesson: enroll selected students
      if (!isEdit && form.lesson_type === 'D' && studentIds.length > 0) {
        try {
          await api.bulkEnroll(result.id, studentIds);
        } catch (enrollErr) {
          // Lesson was created — warn but don't block
          console.warn('Enrollment after creation failed:', enrollErr);
        }
      }

      onSuccess(result, isEdit);
    } catch {
      setApiErr('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleStudentsSubmit = () => {
    submitLesson(selectedStudents);
  };

  if (!open) return null;

  const showStudentStep = step === 'students';
  const isDriving = form.lesson_type === 'D';

  /* ── Step indicator (driving create only) ── */
  const StepBar = () => (
    <div className="flex items-center gap-2 px-6 py-2.5 border-b border-white/[0.05] bg-white/[0.015]">
      {[
        { id: 'form', label: 'Lesson details' },
        { id: 'students', label: 'Pick students' },
      ].map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          {i > 0 && <div className="w-8 h-px bg-white/10" />}
          <div className={cls(
            'flex items-center gap-1.5 text-[10px] font-bold transition-colors',
            step === s.id ? 'text-blue-400' : step === 'students' && s.id === 'form'
              ? 'text-emerald-400' : 'text-white/20',
          )}>
            <div className={cls(
              'w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black border transition-all',
              step === s.id
                ? 'bg-blue-600 border-blue-500 text-white'
                : step === 'students' && s.id === 'form'
                ? 'bg-emerald-600/30 border-emerald-500/40 text-emerald-400'
                : 'bg-white/[0.04] border-white/[0.1] text-white/20',
            )}>
              {step === 'students' && s.id === 'form' ? '✓' : i + 1}
            </div>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );

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
                {isEdit ? 'Edit Lesson' : showStudentStep ? 'Pick Students' : 'New Lesson'}
              </h2>
              <p className="text-[10px] text-white/30">
                {isEdit
                  ? 'Update lesson details'
                  : showStudentStep
                  ? `Choose up to ${form.max_students} student${form.max_students > 1 ? 's' : ''} for this driving lesson`
                  : 'Schedule a new lesson'}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]
              text-white/40 hover:text-white flex items-center justify-center transition-all">
            {Icon.close}
          </button>
        </div>

        {/* Step bar — driving create only */}
        {!isEdit && isDriving && <StepBar />}

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">

          {apiErr && (
            <div className="flex items-start gap-2.5 bg-red-500/[0.07] border border-red-500/20
              rounded-xl px-4 py-3">
              {Icon.warn}
              <p className="text-[11px] text-red-400 leading-relaxed">{apiErr}</p>
            </div>
          )}

          {/* ══════════════ STEP 1: FORM ══════════════ */}
          {!showStudentStep && (
            <>
              {/* Title */}
              <Field label="Lesson Title" error={errors.title}>
                <input className={inputCls} placeholder="e.g. Introduction to Road Signs"
                  value={form.title} onChange={e => set('title', e.target.value)} />
              </Field>

              {/* Type + Duration */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Lesson Type">
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(LESSON_TYPES).map(([k, v]) => (
                      <button key={k} type="button"
                        disabled={isEdit}
                        onClick={() => set('lesson_type', k)}
                        className={cls(
                          'py-2.5 rounded-xl border text-[11px] font-semibold transition-all',
                          isEdit && 'opacity-50 cursor-not-allowed',
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
                  {isEdit && (
                    <p className="text-[9px] text-white/20 mt-0.5">Cannot change type after creation</p>
                  )}
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

              {/* Target License Type */}
              <Field label="Target License Type"
                hint={form.lesson_type === 'T'
                  ? 'Only students with this license type will be auto-enrolled'
                  : 'For your records — does not restrict enrollment'}>
                <div className="grid grid-cols-3 gap-2">
                  {[['A', '🎓 All'], ['C', '🚗 Car'], ['M', '🏍️ Moto']].map(([k, v]) => (
                    <button key={k} type="button"
                      onClick={() => set('target_license_type', k)}
                      className={cls(
                        'py-2 rounded-xl border text-[11px] font-semibold transition-all',
                        form.target_license_type === k
                          ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                          : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/70',
                      )}>
                      {v}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Max Students — driving only */}
              {form.lesson_type === 'D' && (
                <Field label="Max Students (1–4)" error={errors.max_students}
                  hint="How many students can join this driving lesson">
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

              {/* Theory preview: enrolled students */}
              {form.lesson_type === 'T' && form.school && (
                <Field label={`Students to auto-enroll ${studentsLoading ? '(loading…)' : `(${students.length})`}`}>
                  <StudentPicker
                    students={students}
                    selected={selectedStudents}
                    onChange={setSelectedStudents}
                    max={999}
                    lessonType="T"
                    loading={studentsLoading}
                    targetLicense={form.target_license_type}
                  />
                </Field>
              )}

              {/* Description */}
              <Field label="Description (optional)">
                <textarea className={cls(inputCls, 'resize-none h-20')}
                  placeholder="Lesson objectives, notes…"
                  value={form.description} onChange={e => set('description', e.target.value)} />
              </Field>
            </>
          )}

          {/* ══════════════ STEP 2: STUDENT PICKER ══════════════ */}
          {showStudentStep && (
            <>
              {/* Lesson recap */}
              <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06]
                rounded-xl px-4 py-3">
                <span className="text-xl">🚗</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-white truncate">{form.title}</div>
                  <div className="text-[10px] text-white/30 mt-0.5">
                    {fmtDate(form.date)} · {form.duration}m · up to {form.max_students} student{form.max_students > 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* No school warning (shouldn't happen but just in case) */}
              {!form.school ? (
                <div className="flex items-center gap-2 bg-amber-500/[0.07] border border-amber-500/20
                  rounded-xl px-4 py-3">
                  <span className="text-amber-400">{Icon.warn}</span>
                  <p className="text-[11px] text-amber-400">Please go back and select a school first.</p>
                </div>
              ) : (
                <StudentPicker
                  students={students}
                  selected={selectedStudents}
                  onChange={setSelectedStudents}
                  max={Number(form.max_students)}
                  lessonType="D"
                  loading={studentsLoading}
                  targetLicense={form.target_license_type}
                />
              )}

              {selectedStudents.length === 0 && (
                <div className="flex items-start gap-2.5 bg-blue-500/[0.06] border border-blue-500/15
                  rounded-xl px-4 py-3">
                  <span className="text-blue-400 mt-0.5 flex-shrink-0">{Icon.info}</span>
                  <p className="text-[11px] text-blue-300/70 leading-relaxed">
                    You can create the lesson without selecting students now and enroll them later
                    from the lessons table.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] flex items-center gap-3">
          {/* Back button on step 2 */}
          {showStudentStep ? (
            <button onClick={() => setStep('form')}
              className="flex-1 py-2.5 rounded-xl border border-white/[0.08]
                text-[12px] text-white/50 hover:text-white transition-all flex items-center justify-center gap-1.5">
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path d="M5.5 1.5L2.5 4.5L5.5 7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Back
            </button>
          ) : (
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/[0.08]
                text-[12px] text-white/50 hover:text-white transition-all">
              Cancel
            </button>
          )}

          <button
            onClick={showStudentStep ? handleStudentsSubmit : handleFormNext}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500
              text-[13px] font-bold text-white transition-all disabled:opacity-50
              flex items-center justify-center gap-2">
            {saving ? (
              <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30
                border-t-white animate-spin" />Saving…</>
            ) : isEdit ? (
              'Save Changes'
            ) : showStudentStep ? (
              selectedStudents.length > 0
                ? `Create & Enroll ${selectedStudents.length}`
                : 'Create without students'
            ) : isDriving ? (
              <>Next: Pick Students <span className="opacity-60">{Icon.chevron}</span></>
            ) : (
              'Create Lesson'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Enroll Modal (post-create, from table row) ─────────────── */
const EnrollModal = ({ open, lesson, onClose, onSuccess }) => {
  const [students,    setStudents]    = useState([]);
  const [busyIds,     setBusyIds]     = useState(new Set());
  const [alreadyIds,  setAlreadyIds]  = useState(new Set());
  const [selected,    setSelected]    = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [enrolling,   setEnrolling]   = useState(false);
  const [error,       setError]       = useState('');
  const [schedule,    setSchedule]    = useState(null);
  const [search,      setSearch]      = useState('');

  useEffect(() => {
    if (!open || !lesson?.school) return;
    setLoading(true);
    setSelected([]);
    setError('');
    setBusyIds(new Set());
    setAlreadyIds(new Set());
    setSchedule(null);
    setSearch('');

    Promise.all([
      api.getStudentsBySchool(lesson.school),
      api.getLessonSchedule(lesson.id),
    ])
      .then(([studentsData, scheduleData]) => {
        setStudents(studentsData);
        setSchedule(scheduleData);

        if (scheduleData?.start_time && scheduleData?.end_time) {
          return api.checkStudentConflicts({
            school:     lesson.school,
            start_time: scheduleData.start_time,
            end_time:   scheduleData.end_time,
            lesson_id:  lesson.id,
          });
        }
        return null;
      })
      .then(conflictData => {
        if (conflictData) {
          setBusyIds(new Set(conflictData.busy_student_ids || []));
          setAlreadyIds(new Set(conflictData.already_enrolled_ids || []));
        }
      })
      .catch(() => setError('Failed to load students'))
      .finally(() => setLoading(false));
  }, [open, lesson]);

  const toggle = (id) => {
    if (busyIds.has(id) || alreadyIds.has(id)) return;
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const handleEnroll = async () => {
    if (!selected.length) return;
    setEnrolling(true); setError('');
    try {
      const result = await api.bulkEnroll(lesson.id, selected);
      onSuccess(result);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const remaining = lesson ? lesson.max_students - (lesson.enrolled_count || 0) : 0;

  const filtered = students.filter(s => {
    const name = studentDisplayName(s).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const sorted = [...filtered].sort((a, b) => {
    const scoreA = alreadyIds.has(a.id) ? 1 : busyIds.has(a.id) ? 2 : 0;
    const scoreB = alreadyIds.has(b.id) ? 1 : busyIds.has(b.id) ? 2 : 0;
    return scoreA - scoreB;
  });

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(6,11,24,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="bg-[#0B1221] border border-white/[0.08] rounded-2xl w-full max-w-[480px]
        shadow-2xl flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/15 border border-emerald-500/20
              flex items-center justify-center text-emerald-400">
              {Icon.users}
            </div>
            <div>
              <h2 className="font-sora text-[14px] font-bold text-white">Enroll Students</h2>
              <p className="text-[10px] text-white/30 mt-0.5">
                {lesson?.title}
                {schedule?.start_time && (
                  <> · <span className="text-blue-400">{fmtDate(schedule.start_time)}</span></>
                )}
                {' · '}
                <span className={cls(remaining <= 0 ? 'text-red-400' : 'text-emerald-400')}>
                  {remaining} slot{remaining !== 1 ? 's' : ''} remaining
                </span>
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]
              text-white/40 hover:text-white flex items-center justify-center transition-all">
            {Icon.close}
          </button>
        </div>

        {/* Legend */}
        {!loading && students.length > 0 && (
          <div className="flex items-center gap-4 px-6 py-2.5 border-b border-white/[0.04]
            bg-white/[0.02]">
            <span className="flex items-center gap-1.5 text-[10px] text-white/40">
              <span className="w-2 h-2 rounded-full bg-emerald-500/70" /> Available
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-white/40">
              <span className="w-2 h-2 rounded-full bg-blue-500/70" /> Already enrolled
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-white/40">
              <span className="w-2 h-2 rounded-full bg-red-500/70" /> Busy at this time
            </span>
          </div>
        )}

        {/* Search */}
        {!loading && students.length > 0 && (
          <div className="px-6 pt-3 pb-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">{Icon.search}</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name…"
                className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl
                  pl-9 pr-4 py-2 text-[12px] text-white placeholder:text-white/20
                  outline-none focus:border-blue-500/40 transition-all"
              />
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-2">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/[0.07] border border-red-500/20
              rounded-xl px-4 py-3 mb-1">
              {Icon.warn}
              <p className="text-[11px] text-red-400">{error}</p>
            </div>
          )}

          {!loading && !schedule && (
            <div className="flex items-start gap-2 bg-amber-500/[0.07] border border-amber-500/20
              rounded-xl px-4 py-3 mb-1">
              <span className="text-amber-400 text-[13px] flex-shrink-0">⚠️</span>
              <p className="text-[11px] text-amber-400 leading-relaxed">
                This lesson has no schedule yet. Conflict checking is unavailable —
                you can still enroll students but verify their availability manually.
              </p>
            </div>
          )}

          {loading
            ? Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-white/[0.04] animate-pulse" />
              ))
            : sorted.length === 0
            ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <span className="text-3xl">👥</span>
                  <p className="text-[12px] text-white/30">
                    {search ? `No students matching "${search}"` : 'No active students found in this school'}
                  </p>
                </div>
              )
            : sorted.map(s => {
                const checked   = selected.includes(s.id);
                const busy      = busyIds.has(s.id);
                const enrolled  = alreadyIds.has(s.id);
                const full      = !checked && selected.length >= remaining;
                const disabled  = busy || enrolled || (full && !checked);
                const name      = studentDisplayName(s);

                return (
                  <button key={s.id} type="button"
                    disabled={disabled}
                    onClick={() => toggle(s.id)}
                    className={cls(
                      'flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all text-left',
                      checked   ? 'bg-emerald-600/10 border-emerald-500/30'
                      : enrolled ? 'bg-blue-600/05 border-blue-500/15 cursor-not-allowed'
                      : busy     ? 'bg-red-500/05 border-red-500/15 cursor-not-allowed opacity-50'
                      : full     ? 'bg-white/[0.02] border-white/[0.04] opacity-35 cursor-not-allowed'
                      : 'bg-white/[0.03] border-white/[0.07] hover:border-white/[0.15] hover:bg-white/[0.05]',
                    )}>
                    <div className={cls(
                      'w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-all',
                      checked   ? 'bg-emerald-600 border-emerald-500'
                      : enrolled ? 'bg-blue-600/30 border-blue-500/40'
                      : busy     ? 'border-red-500/30 bg-red-500/10'
                      : 'border-white/20',
                    )}>
                      {checked  && Icon.check}
                      {enrolled && <span className="text-blue-400" style={{fontSize:8}}>✓</span>}
                      {busy     && <span className="text-red-400"  style={{fontSize:8}}>✕</span>}
                    </div>

                    <div className={cls(
                      'w-8 h-8 rounded-lg border flex items-center justify-center',
                      'text-[12px] font-bold flex-shrink-0',
                      busy     ? 'bg-red-500/10 border-red-500/20 text-red-400'
                      : enrolled ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                      : checked  ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300'
                      : 'bg-white/[0.06] border-white/[0.08] text-white/50',
                    )}>
                      {name[0]?.toUpperCase() || '?'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-white truncate">{name}</div>
                      <div className="text-[10px] text-white/30 flex items-center gap-2 mt-0.5">
                        <span>
                          {s.license_type === 'C' ? '🚗 Car' : s.license_type === 'M' ? '🏍️ Moto' : '—'}
                        </span>
                        {busy     && <span className="text-red-400 font-semibold">· Busy at this time</span>}
                        {enrolled && <span className="text-blue-400 font-semibold">· Already enrolled</span>}
                      </div>
                    </div>

                    {checked  && <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md px-1.5 py-0.5 flex-shrink-0">Selected</span>}
                    {enrolled && !checked && <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-md px-1.5 py-0.5 flex-shrink-0">Enrolled</span>}
                    {busy     && <span className="text-[9px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-1.5 py-0.5 flex-shrink-0">Conflict</span>}
                  </button>
                );
              })
          }
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.08]
              text-[12px] text-white/50 hover:text-white transition-all">
            Cancel
          </button>
          <button onClick={handleEnroll}
            disabled={!selected.length || enrolling}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500
              text-[13px] font-bold text-white transition-all disabled:opacity-40
              flex items-center justify-center gap-2">
            {enrolling
              ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Enrolling…</>
              : `Enroll ${selected.length || ''} Student${selected.length !== 1 ? 's' : ''}`
            }
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Delete Dialog ──────────────────────────────────────────── */
const DeleteDialog = ({ open, lesson, onConfirm, onCancel, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(6,11,24,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="bg-[#0F1A2E] border border-white/[0.08] rounded-2xl p-6 w-full max-w-[340px]">
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20
            flex items-center justify-center mx-auto mb-4 text-2xl">🗑️</div>
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
const LessonRow = ({ lesson, onEdit, onDelete, onEnroll }) => (
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
      <div className="text-[11px] text-white/70">{lesson.instructor_name || '—'}</div>
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
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {lesson.lesson_type === 'D' && (
          <button onClick={() => onEnroll(lesson)}
            className="w-7 h-7 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20
              text-emerald-400 flex items-center justify-center transition-colors"
            title="Enroll students">
            {Icon.users}
          </button>
        )}
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

/* ─── Detail Drawer ──────────────────────────────────────────── */
const LessonDrawer = ({ lesson, onClose, onEdit, onEnroll }) => {
  if (!lesson) return null;
  return (
    <>
      <div className="fixed inset-0 z-[50]" onClick={onClose}
        style={{ background: 'rgba(6,11,24,0.5)' }} />
      <div className="fixed right-0 top-0 h-full w-[340px] z-[55]
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
            { label: 'Instructor',   value: lesson.instructor_name },
            { label: 'School',       value: lesson.school_name },
            { label: 'Date',         value: fmtDate(lesson.date) },
            { label: 'Duration',     value: `${lesson.duration} minutes` },
            { label: 'License Type', value: lesson.target_license_type === 'A' ? 'All'
                                          : lesson.target_license_type === 'C' ? '🚗 Car' : '🏍️ Moto' },
            ...(lesson.lesson_type === 'D' ? [
              { label: 'Max Students', value: lesson.max_students },
              { label: 'Enrolled',     value: lesson.enrolled_count || 0 },
            ] : []),
            { label: 'Status', value: STATUSES[lesson.status]?.label },
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

        <div className="p-4 border-t border-white/[0.06] flex flex-col gap-2">
          {lesson.lesson_type === 'D' && (
            <button onClick={() => { onClose(); onEnroll(lesson); }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500
                text-[13px] font-bold text-white transition-all flex items-center justify-center gap-2">
              {Icon.users} Enroll Students
            </button>
          )}
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
  const [enrollTarget, setEnrollTarget] = useState(null);
  const [toast,        setToast]        = useState({ msg: '', type: 'success' });
  const [error,        setError]        = useState('');

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  useEffect(() => {
    Promise.all([api.getInstructors(), api.getSchools()])
      .then(([ins, sch]) => {
        setInstructors(Array.isArray(ins) ? ins : ins?.results || []);
        setSchools(Array.isArray(sch) ? sch : sch?.results || []);
      })
      .catch(() => {});
  }, []);

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

  const handleSuccess = (lesson, isEdit) => {
    setModalOpen(false);
    setEditLesson(null);
    if (isEdit) {
      setLessons(ls => ls.map(l => l.id === lesson.id ? lesson : l));
      showToast('Lesson updated successfully');
    } else {
      setLessons(ls => [lesson, ...ls]);
      showToast(
        lesson.lesson_type === 'T'
          ? 'Theory lesson created — students auto-enrolled'
          : 'Driving lesson created successfully'
      );
    }
  };

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
  const openEnroll = (l) => { setEnrollTarget(l); setDrawerLesson(null); };

  const total     = lessons.length;
  const scheduled = lessons.filter(l => l.status === 'S').length;
  const completed = lessons.filter(l => l.status === 'C').length;
  const theory    = lessons.filter(l => l.lesson_type === 'T').length;
  const driving   = lessons.filter(l => l.lesson_type === 'D').length;

  const TABLE_HEADS = ['Lesson', 'Instructor', 'School', 'Date', 'Duration', 'Enrolled', 'Status', ''];

  return (
    <div className="flex h-screen bg-[#060B18] overflow-hidden font-dm">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="h-[52px] flex-shrink-0 bg-[#0B1221] border-b border-white/[0.06]
          flex items-center gap-3 px-5">
          <div className="flex items-baseline gap-2">
            <span className="font-sora text-[14px] font-bold text-white">Lessons</span>
            <span className="text-[11px] text-white/30">Manage all scheduled lessons</span>
          </div>
          <div className="flex-1" />
          <button onClick={openCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600
              hover:bg-blue-500 rounded-[7px] text-[11px] font-semibold text-white transition-all">
            {Icon.plus} New Lesson
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-3 bg-red-500/[0.07] border border-red-500/20
              rounded-xl px-4 py-3">
              {Icon.warn}
              <p className="text-[12px] text-red-400">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-5 gap-3">
            <StatCard emoji="📚" label="Total lessons"   value={total}     accent="blue"    />
            <StatCard emoji="🗓️" label="Scheduled"       value={scheduled} accent="violet"  />
            <StatCard emoji="✅" label="Completed"        value={completed} accent="emerald" />
            <StatCard emoji="📖" label="Theory lessons"  value={theory}    accent="violet"  />
            <StatCard emoji="🚗" label="Driving lessons" value={driving}   accent="teal"    />
          </div>

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
                    ? <EmptyState onAdd={openCreate} />
                    : lessons.map(l => (
                        <LessonRow
                          key={l.id}
                          lesson={l}
                          onEdit={openEdit}
                          onDelete={setDeleteTarget}
                          onEnroll={openEnroll}
                        />
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

      <LessonDrawer
        lesson={drawerLesson}
        onClose={() => setDrawerLesson(null)}
        onEdit={openEdit}
        onEnroll={openEnroll}
      />

      <LessonModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditLesson(null); }}
        onSuccess={handleSuccess}
        lesson={editLesson}
        instructors={instructors}
        schools={schools}
      />

      <EnrollModal
        open={!!enrollTarget}
        lesson={enrollTarget}
        onClose={() => setEnrollTarget(null)}
        onSuccess={() => {
          showToast('Students enrolled successfully');
          fetchLessons();
        }}
      />

      <DeleteDialog
        open={!!deleteTarget}
        lesson={deleteTarget}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Toast msg={toast.msg} type={toast.type} onDone={() => setToast({ msg: '', type: 'success' })} />
    </div>
  );
};

export default LessonsPage;