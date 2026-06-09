// ─────────────────────────────────────────────
//  ScheduleDetailDrawer — view only (instructor)
// ─────────────────────────────────────────────
import React from 'react';
import { fmtTime, fmtDate, fmtDuration, statusBadge, lessonStyle } from './Scheduleutils';

const Row = ({ label, value, mono = false }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-white/[0.04]">
    <span className="text-[11px] text-white/30 flex-shrink-0 w-28">{label}</span>
    <span className={`text-[12px] text-white/80 text-right ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</span>
  </div>
);

const StudentScheduleDetailDrawer = ({ open, schedule, onClose = false }) => {
  if (!open || !schedule) return null;

  const { label: statusLabel, cls: statusCls } = statusBadge(schedule.lesson?.status ?? 'S');
  const lType = schedule.lesson?.lesson_type ?? '';
  const { bar } = lessonStyle(lType, schedule.lesson?.status ?? 'S');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
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
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${statusCls}`}>
                {statusLabel}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md
                ${lType === 'T' ? 'bg-violet-500/20 text-violet-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {lType === 'T' ? 'Theory' : 'Driving'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center
              justify-center text-white/40 hover:text-white transition-colors mt-0.5"
          >
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
          <Row label="School"      value={schedule.school_name} />
          <Row label="Instructor"  value={schedule.instructor_name} />
          <Row label="Vehicle"     value={schedule.vehicle_info} />
          <Row label="Schedule ID" value={`#${schedule.id}`} mono />
        </div>

      </div>
    </div>
  );
};

export default StudentScheduleDetailDrawer;