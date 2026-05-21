// ─────────────────────────────────────────────
//  ScheduleFormModal — create & edit drawer
// ─────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useScheduleResources } from '../Schedule/UseSchedule';
import { useInstructorAvailability, useVehicleAvailability } from '../Schedule/UseSchedule';
import { toISO } from '../Schedule/scheduleUtils';

const Field = ({ label, children, error }) => (
  <div>
    <label className="block text-[11px] font-bold text-white/40 uppercase tracking-[0.06em] mb-1.5">
      {label}
    </label>
    {children}
    {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
  </div>
);

const inputCls = `w-full bg-[#0F1A2E] border border-white/[0.08] rounded-lg px-3 py-2
  text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50
  transition-colors`;

const ScheduleFormModal = ({ open, onClose, onSave, initial = null, saving = false, error = null }) => {
  const { lessons, instructors, vehicles, loading: resLoading } = useScheduleResources();

  const [form, setForm] = useState({
    lesson: '',
    instructor: '',
    vehicle: '',
    start_time: '',
    end_time: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      setForm({
        lesson:     initial.lesson?.id ?? initial.lesson ?? '',
        instructor: initial.instructor ?? '',
        vehicle:    initial.vehicle ?? '',
        start_time: initial.start_time?.slice(0, 16) ?? '',
        end_time:   initial.end_time?.slice(0, 16) ?? '',
      });
    } else {
      setForm({ lesson: '', instructor: '', vehicle: '', start_time: '', end_time: '' });
    }
    setErrors({});
  }, [initial, open]);

  // Availability check
  const selectedDate = form.start_time ? toISO(new Date(form.start_time)) : null;
  const { data: instrAvail } = useInstructorAvailability(form.instructor || null, selectedDate, 60);
  const { data: vehAvail   } = useVehicleAvailability(form.vehicle || null, selectedDate, 60);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.lesson)     e.lesson = 'Lesson is required';
    if (!form.instructor) e.instructor = 'Instructor is required';
    if (!form.start_time) e.start_time = 'Start time is required';
    if (!form.end_time)   e.end_time = 'End time is required';
    if (form.start_time && form.end_time && new Date(form.end_time) <= new Date(form.start_time))
      e.end_time = 'End time must be after start time';
    if (form.start_time && new Date(form.start_time) < new Date())
      e.start_time = 'Cannot schedule in the past';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      lesson:     parseInt(form.lesson, 10),
      instructor: parseInt(form.instructor, 10),
      vehicle:    form.vehicle ? parseInt(form.vehicle, 10) : null,
      start_time: new Date(form.start_time).toISOString(),
      end_time:   new Date(form.end_time).toISOString(),
    };
    onSave(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-[420px] h-full bg-[#0B1221] border-l border-white/[0.06]
        flex flex-col overflow-hidden shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-[15px] font-bold text-white">
              {initial ? 'Edit schedule' : 'New schedule'}
            </h2>
            <p className="text-[11px] text-white/30 mt-0.5">
              {initial ? 'Update lesson time slot' : 'Book a lesson time slot'}
            </p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center
              justify-center text-white/40 hover:text-white transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 text-[12px] text-red-400">
              {error}
            </div>
          )}

          <Field label="Lesson" error={errors.lesson}>
            <select value={form.lesson} onChange={(e) => set('lesson', e.target.value)} className={inputCls}>
              <option value="">Select a lesson…</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title} ({l.lesson_type === 'T' ? 'Theory' : 'Driving'})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Instructor" error={errors.instructor}>
            <select value={form.instructor} onChange={(e) => set('instructor', e.target.value)} className={inputCls}>
              <option value="">Select instructor…</option>
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>{i.username} ({i.first_name} {i.last_name})</option>
              ))}
            </select>
            {instrAvail && (
              <p className="mt-1 text-[10px] text-emerald-400">
                ✓ {instrAvail.total_available_slots} slot{instrAvail.total_available_slots !== 1 ? 's' : ''} available on this day
              </p>
            )}
          </Field>

          <Field label="Vehicle (optional)">
            <select value={form.vehicle} onChange={(e) => set('vehicle', e.target.value)} className={inputCls}>
              <option value="">No vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.make} {v.model} · {v.plate_number}</option>
              ))}
            </select>
            {vehAvail && form.vehicle && (
              <p className="mt-1 text-[10px] text-emerald-400">
                ✓ {vehAvail.total_available_slots} slot{vehAvail.total_available_slots !== 1 ? 's' : ''} available on this day
              </p>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start time" error={errors.start_time}>
              <input type="datetime-local" value={form.start_time}
                onChange={(e) => set('start_time', e.target.value)} className={inputCls} />
            </Field>
            <Field label="End time" error={errors.end_time}>
              <input type="datetime-local" value={form.end_time}
                onChange={(e) => set('end_time', e.target.value)} className={inputCls} />
            </Field>
          </div>

          {/* Quick duration presets */}
          {form.start_time && (
            <div>
              <p className="text-[10px] text-white/25 mb-1.5">Quick duration</p>
              <div className="flex gap-2">
                {[30, 60, 90, 120].map((m) => (
                  <button type="button" key={m}
                    onClick={() => {
                      const end = new Date(new Date(form.start_time).getTime() + m * 60000);
                      set('end_time', end.toISOString().slice(0, 16));
                    }}
                    className="px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]
                      text-[11px] text-white/50 hover:text-white border border-white/[0.06]
                      transition-colors">
                    {m < 60 ? `${m}m` : `${m / 60}h`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-white/[0.08] text-[13px]
              text-white/50 hover:text-white hover:border-white/20 transition-colors">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || resLoading}
            className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40
              text-[13px] font-semibold text-white transition-colors flex items-center justify-center gap-2">
            {saving && (
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            )}
            {saving ? 'Saving…' : initial ? 'Save changes' : 'Create schedule'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleFormModal;