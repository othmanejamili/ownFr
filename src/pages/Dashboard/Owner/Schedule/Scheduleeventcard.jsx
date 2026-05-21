// ─────────────────────────────────────────────
//  ScheduleEventCard — single lesson block
//  rendered inside the weekly / day grid
// ─────────────────────────────────────────────
import React from 'react';
import { fmtTime, fmtDuration, lessonStyle, timeToTopPx, durationToPx } from '../Schedule/scheduleUtils';

const ScheduleEventCard = ({ schedule, onClick, style = {} }) => {
  const lesson  = schedule.lesson_title   || 'Untitled lesson';
  const lType   = schedule.lesson?.lesson_type ?? '';
  const lStatus = schedule.lesson?.status      ?? 'S';
  const { bar, bg, text, border } = lessonStyle(lType, lStatus);

  const top    = timeToTopPx(schedule.start_time);
  const height = durationToPx(schedule.start_time, schedule.end_time);

  return (
    <div
      onClick={() => onClick?.(schedule)}
      className={`absolute left-1 right-1 rounded-lg border ${border} ${bg} cursor-pointer
        overflow-hidden transition-all duration-150 hover:brightness-125 group select-none`}
      style={{ top, height: Math.max(height, 28), ...style }}
      title={lesson}
    >
      {/* left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg" style={{ background: bar }} />

      <div className="pl-3 pr-2 py-1 flex flex-col h-full justify-between overflow-hidden">
        <div>
          <p className={`text-[11px] font-semibold truncate ${text}`}>{lesson}</p>
          {height > 40 && (
            <p className="text-[10px] text-white/35 truncate mt-0.5">
              {schedule.instructor_name || '—'} · {schedule.vehicle_info || 'No vehicle'}
            </p>
          )}
        </div>
        {height > 52 && (
          <p className="text-[10px] text-white/25 mt-auto">
            {fmtTime(schedule.start_time)} – {fmtTime(schedule.end_time)}
            {' · '}{fmtDuration(schedule.duration_minutes)}
          </p>
        )}
      </div>

      {/* conflict pulse */}
      {lStatus === 'X' && (
        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      )}
    </div>
  );
};

export default ScheduleEventCard;