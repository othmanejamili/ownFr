// ─────────────────────────────────────────────
//  MonthView — full-month grid
// ─────────────────────────────────────────────
import React from 'react';
import { sameDay, lessonStyle, DAYS } from '../Schedule/scheduleUtils';

const getMonthGrid = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Mon=0
  const cells = [];
  for (let i = 0; i < startOffset; i++) {
    cells.push(new Date(year, month, -startOffset + 1 + i));
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push(new Date(year, month, d));
  }
  while (cells.length % 7 !== 0) {
    cells.push(new Date(year, month + 1, cells.length - lastDay.getDate() - startOffset + 1));
  }
  return cells;
};

const MonthView = ({ year, month, schedules = [], onDayClick, onEventClick }) => {
  const cells   = getMonthGrid(year, month);
  const today   = new Date();
  const weekdays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  const schedsForDay = (day) =>
    schedules.filter((s) => sameDay(new Date(s.start_time), day));

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[#0B1221] rounded-xl border border-white/[0.06]">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-white/[0.06]">
        {weekdays.map((d) => (
          <div key={d} className="py-2.5 text-center text-[10px] font-bold text-white/20 tracking-[0.06em] uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 flex-1 overflow-y-auto">
        {cells.map((day, i) => {
          const isCurrentMonth = day.getMonth() === month;
          const isToday        = sameDay(day, today);
          const dayScheds      = schedsForDay(day);

          return (
            <div key={i}
              className={`min-h-[90px] border-b border-r border-white/[0.04] p-1.5 cursor-pointer
                transition-colors hover:bg-white/[0.025]
                ${!isCurrentMonth ? 'opacity-25' : ''}
                ${isToday ? 'bg-blue-600/[0.07]' : ''}`}
              onClick={() => onDayClick?.(day)}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center
                text-[11px] font-bold mb-1 transition-colors
                ${isToday ? 'bg-blue-600 text-white' : 'text-white/50'}`}>
                {day.getDate()}
              </div>
              {dayScheds.slice(0, 3).map((s) => {
                const lType   = s.lesson?.lesson_type ?? '';
                const lStatus = s.lesson?.status ?? 'S';
                const { text, bg, border } = lessonStyle(lType, lStatus);
                return (
                  <div key={s.id}
                    onClick={(e) => { e.stopPropagation(); onEventClick?.(s); }}
                    className={`text-[9px] truncate px-1.5 py-0.5 rounded mb-0.5
                      ${bg} ${text} border ${border} cursor-pointer hover:brightness-125`}>
                    {s.lesson_title || 'Lesson'}
                  </div>
                );
              })}
              {dayScheds.length > 3 && (
                <p className="text-[9px] text-white/25 pl-1">+{dayScheds.length - 3} more</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;