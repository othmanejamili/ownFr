// ─────────────────────────────────────────────
//  WeeklyCalendar — 5-day grid with hour slots
// ─────────────────────────────────────────────
import React, { useRef, useEffect } from 'react';
import { addDays, sameDay, fmtTime, DAYS } from './Scheduleutils';
import ScheduleEventCard from './Scheduleeventcard';

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 08–18

const NowLine = ({ weekStart }) => {
  const now   = new Date();
  const dayIdx = [1,2,3,4,5].findIndex((_, i) => sameDay(addDays(weekStart, i), now));
  if (dayIdx === -1) return null;
  const top = ((now.getHours() - 8) * 60 + now.getMinutes()) * (54 / 60);

  return (
    <div
      className="absolute z-20 flex items-center pointer-events-none"
      style={{ top, left: `calc(48px + ${dayIdx} * (100% - 48px) / 5)`, width: 'calc((100% - 48px) / 5)' }}
    >
      <div className="w-2 h-2 rounded-full bg-blue-400 -ml-1 flex-shrink-0" />
      <div className="flex-1 h-[1.5px] bg-blue-400/60" />
    </div>
  );
};

const WeeklyCalendar = ({ weekStart, schedules = [], onEventClick, onSlotClick }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const top = Math.max(0, ((now.getHours() - 8) * 60 + now.getMinutes()) * (54 / 60) - 80);
      scrollRef.current.scrollTop = top;
    }
  }, []);

  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  const schedulesForDay = (day) =>
    schedules.filter((s) => sameDay(new Date(s.start_time), day));

  const today = new Date();

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[#0B1221] rounded-xl border border-white/[0.06]">
      {/* Day headers */}
      <div className="grid border-b border-white/[0.06] flex-shrink-0"
        style={{ gridTemplateColumns: '48px repeat(5, 1fr)' }}>
        <div className="border-r border-white/[0.06]" />
        {weekDays.map((day, i) => {
          const isToday = sameDay(day, today);
          return (
            <div key={i} className={`py-3 text-center border-r border-white/[0.06] last:border-r-0
              ${isToday ? 'bg-blue-600/10' : ''}`}>
              <p className="text-[10px] font-bold text-white/25 tracking-[0.06em] uppercase">
                {DAYS[day.getDay()]}
              </p>
              <div className={`mt-1 w-8 h-8 rounded-full mx-auto flex items-center justify-center
                text-[15px] font-bold transition-colors
                ${isToday ? 'bg-blue-600 text-white' : 'text-white/70'}`}>
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scrollable body */}
      <div ref={scrollRef} className="overflow-y-auto flex-1 relative">
        <div className="grid relative" style={{ gridTemplateColumns: '48px repeat(5, 1fr)' }}>

          {/* Time labels */}
          <div className="border-r border-white/[0.06]">
            {HOURS.map((h) => (
              <div key={h} className="h-[54px] border-b border-white/[0.04]
                flex items-start justify-end pr-2 pt-0.5">
                <span className="text-[10px] text-white/20 font-mono">
                  {String(h).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, di) => {
            const dayScheds = schedulesForDay(day);
            return (
              <div key={di}
                className={`relative border-r border-white/[0.06] last:border-r-0
                  ${sameDay(day, today) ? 'bg-blue-600/[0.03]' : ''}`}>
                {/* Hour rows */}
                {HOURS.map((h) => (
                  <div key={h}
                    className="h-[54px] border-b border-white/[0.04] cursor-pointer
                      hover:bg-white/[0.02] transition-colors"
                    onClick={() => {
                      const d = new Date(day);
                      d.setHours(h, 0, 0, 0);
                      onSlotClick?.(d);
                    }}
                  />
                ))}
                {/* Events */}
                {dayScheds.map((s) => (
                  <ScheduleEventCard key={s.id} schedule={s} onClick={onEventClick} />
                ))}
              </div>
            );
          })}

          {/* Now line */}
          <NowLine weekStart={weekStart} />
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;