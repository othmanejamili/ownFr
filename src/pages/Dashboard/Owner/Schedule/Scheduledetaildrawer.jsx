// ─────────────────────────────────────────────
//  ScheduleDetailDrawer — view + quick actions
// ─────────────────────────────────────────────
import React, { useState } from 'react';
import { fmtTime, fmtDate, fmtDuration, statusBadge, lessonTypeBadge, lessonStyle } from '../Schedule/scheduleUtils';

const Row = ({ label, value, mono = false }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-white/[0.04]">
    <span className="text-[11px] text-white/30 flex-shrink-0 w-28">{label}</span>
    <span className={`text-[12px] text-white/80 text-right ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</span>
  </div>
);

const RescheduleForm = ({ schedule, onReschedule, onCancel, saving }) => {
  const [start, setStart] = useState(schedule.start_time.slice(0, 16));
  const [end,   setEnd]   = useState(schedule.end_time.slice(0, 16));
  const [err,   setErr]   = useState('');

  const submit = () => {
    if (new Date(end) <= new Date(start)) { setErr('End must be after start'); return; }
    if (new Date(start) < new Date())     { setErr('Cannot reschedule to the past'); return; }
    setErr('');
    onReschedule({ start_time: new Date(start).toISOString(), end_time: new Date(end).toISOString() });
  };

  const inputCls = `w-full bg-[#0F1A2E] border border-white/[0.08] rounded-lg px-3 py-2
    text-[12px] text-white focus:outline-none focus:border-blue-500/50`;

  return (
    <div className="bg-[#0F1A2E] rounded-xl border border-white/[0.06] p-4 space-y-3">
      <p className="text-[12px] font-semibold text-white">Reschedule lesson</p>
      {err && <p className="text-[11px] text-red-400">{err}</p>}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] text-white/30 mb-1">New start</p>
          <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className={inputCls} />
        </div>
        <div>
          <p className="text-[10px] text-white/30 mb-1">New end</p>
          <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className={inputCls} />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-1.5 rounded-lg text-[12px] text-white/40
          border border-white/[0.06] hover:text-white transition-colors">
          Back
        </button>
        <button onClick={submit} disabled={saving}
          className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[12px]
            font-semibold text-white transition-colors disabled:opacity-40">
          {saving ? 'Saving…' : 'Confirm'}
        </button>
      </div>
    </div>
  );
};

const ScheduleDetailDrawer = ({
  open, schedule, onClose, onEdit, onCancel: onCancelAction, onReschedule, saving = false,
}) => {
  const [view, setView] = useState('detail'); // 'detail' | 'reschedule' | 'confirm-cancel'

  if (!open || !schedule) return null;

  const { label: statusLabel, cls: statusCls } = statusBadge(schedule.lesson?.status ?? 'S');
  const lType  = schedule.lesson?.lesson_type ?? '';
  const { text: typeText } = lessonTypeBadge(lType);
  const { bar } = lessonStyle(lType, schedule.lesson?.status ?? 'S');

  const isPast = new Date(schedule.start_time) < new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-[380px] h-full bg-[#0B1221] border-l border-white/[0.06]
        flex flex-col overflow-hidden shadow-2xl">
        {/* Top accent */}
        <div className="h-[3px]" style={{ background: bar }} />

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-[14px] font-bold text-white leading-tight">
              {schedule.lesson_title || 'Schedule'}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${statusCls}`}>{statusLabel}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md
                ${lType === 'T' ? 'bg-violet-500/20 text-violet-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {lType === 'T' ? 'Theory' : 'Driving'}
              </span>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center
              justify-center text-white/40 hover:text-white transition-colors mt-0.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Time card */}
        <div className="mx-5 mt-4 bg-[#0F1A2E] rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-white/25 mb-0.5">Start</p>
              <p className="text-[16px] font-bold text-white">{fmtTime(schedule.start_time)}</p>
              <p className="text-[11px] text-white/35">{fmtDate(schedule.start_time)}</p>
            </div>
            <div className="flex items-center gap-2 text-white/20">
              <div className="w-6 h-[1px] bg-white/20" />
              <span className="text-[10px] font-mono text-white/30">
                {fmtDuration(schedule.duration_minutes)}
              </span>
              <div className="w-6 h-[1px] bg-white/20" />
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/25 mb-0.5">End</p>
              <p className="text-[16px] font-bold text-white">{fmtTime(schedule.end_time)}</p>
              <p className="text-[11px] text-white/35">{fmtDate(schedule.end_time)}</p>
            </div>
          </div>
        </div>

        {/* Detail rows */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {view === 'detail' && (
            <>
              <Row label="School"      value={schedule.school_name} />
              <Row label="Instructor"  value={schedule.instructor_name} />
              <Row label="Vehicle"     value={schedule.vehicle_info} />
              <Row label="Schedule ID" value={`#${schedule.id}`} mono />
            </>
          )}

          {view === 'reschedule' && (
            <RescheduleForm
              schedule={schedule}
              onReschedule={(data) => { onReschedule(schedule.id, data); setView('detail'); }}
              onCancel={() => setView('detail')}
              saving={saving}
            />
          )}

          {view === 'confirm-cancel' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-3">
              <p className="text-[13px] font-semibold text-red-300">Cancel this schedule?</p>
              <p className="text-[12px] text-white/40">
                This will cancel the lesson and cannot be undone. The lesson status will be set to Cancelled.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setView('detail')}
                  className="flex-1 py-1.5 rounded-lg text-[12px] text-white/40
                    border border-white/[0.06] hover:text-white transition-colors">
                  Back
                </button>
                <button onClick={() => { onCancelAction(schedule.id); setView('detail'); }}
                  disabled={saving}
                  className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-[12px]
                    font-semibold text-white transition-colors disabled:opacity-40">
                  {saving ? 'Cancelling…' : 'Yes, cancel'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions footer */}
        {view === 'detail' && (
          <div className="px-5 py-4 border-t border-white/[0.06] space-y-2">
            {!isPast && (
              <>
                <button onClick={() => onEdit?.(schedule)}
                  className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500
                    text-[13px] font-semibold text-white transition-colors">
                  Edit schedule
                </button>
                <div className="flex gap-2">
                  <button onClick={() => setView('reschedule')}
                    className="flex-1 py-2 rounded-lg border border-white/[0.08] text-[12px]
                      text-white/50 hover:text-white hover:border-white/20 transition-colors">
                    Reschedule
                  </button>
                  <button onClick={() => setView('confirm-cancel')}
                    className="flex-1 py-2 rounded-lg border border-red-500/20 text-[12px]
                      text-red-400 hover:bg-red-500/10 transition-colors">
                    Cancel
                  </button>
                </div>
              </>
            )}
            {isPast && (
              <p className="text-center text-[11px] text-white/20 py-1">
                Past schedules cannot be modified
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleDetailDrawer;