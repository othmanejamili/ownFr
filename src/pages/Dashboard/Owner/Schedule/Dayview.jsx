// ─────────────────────────────────────────────
//  DayView — single-day detailed timeline
// ─────────────────────────────────────────────
import React, { useRef, useEffect } from 'react';
import { fmtDate, sameDay } from '../Schedule/scheduleUtils';
import ScheduleEventCard from '../Schedule/ScheduleEventCard';

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8);

const DayView = ({ date, schedules = [], onEventClick, onSlotClick }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const top = Math.max(0, ((now.getHours() - 8) * 60 + now.getMinutes()) * (54 / 60) - 80);
      scrollRef.current.scrollTop = top;
    }
  }, []);

  const dayScheds = schedules.filter((s) => sameDay(new Date(s.start_time), date));
  const isToday   = sameDay(date, new Date());

  const nowTop = () => {
    const now = new Date();
    return ((now.getHours() - 8) * 60 + now.getMinutes()) * (54 / 60);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[#0B1221] rounded-xl border border-white/[0.06]">
      {/* Header */}
      <div className={`py-4 px-6 border-b border-white/[0.06] flex items-center gap-3
        ${isToday ? 'bg-blue-600/10' : ''}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center
          text-lg font-bold ${isToday ? 'bg-blue-600 text-white' : 'bg-white/[0.06] text-white/70'}`}>
          {date.getDate()}
        </div>
        <div>
          <p className="text-[15px] font-bold text-white">{fmtDate(date.toISOString())}</p>
          <p className="text-[11px] text-white/30">{dayScheds.length} lesson{dayScheds.length !== 1 ? 's' : ''} scheduled</p>
        </div>
      </div>

      <div ref={scrollRef} className="overflow-y-auto flex-1">
        <div className="grid relative" style={{ gridTemplateColumns: '56px 1fr' }}>
          {/* Time labels */}
          <div className="border-r border-white/[0.06]">
            {HOURS.map((h) => (
              <div key={h} className="h-[54px] border-b border-white/[0.04]
                flex items-start justify-end pr-2 pt-0.5">
                <span className="text-[10px] text-white/20 font-mono">{String(h).padStart(2, '0')}:00</span>
              </div>
            ))}
          </div>

          {/* Events column */}
          <div className="relative">
            {HOURS.map((h) => (
              <div key={h}
                className="h-[54px] border-b border-white/[0.04] cursor-pointer hover:bg-white/[0.02]"
                onClick={() => {
                  const d = new Date(date);
                  d.setHours(h, 0, 0, 0);
                  onSlotClick?.(d);
                }}
              />
            ))}
            {dayScheds.map((s) => (
              <ScheduleEventCard key={s.id} schedule={s} onClick={onEventClick} />
            ))}
            {isToday && (
              <div className="absolute left-0 right-0 flex items-center pointer-events-none z-20"
                style={{ top: nowTop() }}>
                <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                <div className="flex-1 h-[1.5px] bg-blue-400/60" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayView;