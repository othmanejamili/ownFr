// ─────────────────────────────────────────────
//  SchedulePage — main schedule dashboard
//  Route: /dashboard/owner/schedule
// ─────────────────────────────────────────────
import React, { useState, useCallback } from 'react';
import Sidebar from '../Sidebar'; // adjust path to your actual Sidebar

import WeeklyCalendar      from './Weeklycalendar';
import DayView             from './Dayview';
import MonthView           from './Monthview';
import ScheduleFormModal   from './Scheduleformmodal';
import ScheduleDetailDrawer from './Scheduledetaildrawer';

import {
  useSchedules,
  useMySchedule,
  useScheduleMutations,
} from './Useschedule';

import {
  startOfWeek,
  addDays,
  toISO,
  MONTHS,
} from './Scheduleutils';

// ── tiny icon components ─────────────────────────────────────────

const Icon = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d={d} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ICONS = {
  calendar:  'M1 3.5h12M1 7h12M1 10.5h12',
  chevLeft:  'M9 2L4 7l5 5',
  chevRight: 'M5 2l5 5-5 5',
  plus:      'M7 1v12M1 7h12',
  filter:    'M1 2h12M3 7h8M5 12h4',
  grid:      'M1 1h4v4H1zM9 1h4v4H9zM1 9h4v4H1zM9 9h4v4H9z',
  list:      'M1 3h12M1 7h12M1 11h12',
  today:     'M7 1v12M1 7h12',
  alert:     'M7 1L1 11h12L7 1zM7 7v2M7 10.5v.5',
};

// ── Stat card ─────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, accent }) => (
  <div className="bg-[#0B1221] border border-white/[0.06] rounded-xl p-4 flex flex-col gap-1">
    <div className="flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
      <span className="text-[10px] font-bold text-white/25 uppercase tracking-[0.06em]">{label}</span>
    </div>
    <p className="text-[26px] font-bold text-white leading-none">{value ?? '—'}</p>
    {sub && <p className="text-[11px] text-white/30">{sub}</p>}
  </div>
);

// ── View tab button ───────────────────────────────────────────────

const ViewTab = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors
      ${active
        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
        : 'text-white/35 hover:text-white hover:bg-white/[0.04]'
      }`}
  >
    {children}
  </button>
);

// ─────────────────────────────────────────────────────────────────

const SchedulePage = () => {
  // ── view state ─────────────────────────────────────────────────
  const [viewMode,   setViewMode]   = useState('week');    // 'week' | 'day' | 'month'
  const [weekStart,  setWeekStart]  = useState(() => startOfWeek(new Date()));
  const [activeDay,  setActiveDay]  = useState(() => new Date());
  const [monthYear,  setMonthYear]  = useState(() => ({
    year:  new Date().getFullYear(),
    month: new Date().getMonth(),
  }));

  // ── modal state ────────────────────────────────────────────────
  const [formOpen,    setFormOpen]    = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);   // schedule being edited
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [drawerItem,  setDrawerItem]  = useState(null);   // schedule being viewed
  const [mutationErr, setMutationErr] = useState(null);

  // ── data ────────────────────────────────────────────────────────
  // For week/day: fetch by date range
  const rangeParams = viewMode === 'week'
    ? { date_from: toISO(weekStart), date_to: toISO(addDays(weekStart, 6)) }
    : viewMode === 'day'
    ? { date_from: toISO(activeDay), date_to: toISO(activeDay) }
    : { date_from: toISO(new Date(monthYear.year, monthYear.month, 1)),
        date_to:   toISO(new Date(monthYear.year, monthYear.month + 1, 0)) };

  const { schedules, loading, refetch } = useSchedules(rangeParams);

  // Summary stats via my_schedule
  const { data: myData } = useMySchedule({ range: 'week' });
  const summary = myData?.summary ?? {};

  // ── mutations ───────────────────────────────────────────────────
  const { create, update, cancel, reschedule, saving } = useScheduleMutations(refetch);

  // ── handlers ────────────────────────────────────────────────────

  const openCreate = useCallback((slotDate) => {
    setEditTarget(slotDate
      ? { start_time: slotDate.toISOString(), end_time: addDays(slotDate, 0).toISOString() }
      : null
    );
    setMutationErr(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((schedule) => {
    setDrawerOpen(false);
    setEditTarget(schedule);
    setMutationErr(null);
    setFormOpen(true);
  }, []);

  const handleSave = useCallback(async (data) => {
    try {
      setMutationErr(null);
      if (editTarget?.id) {
        await update(editTarget.id, data);
      } else {
        await create(data);
      }
      setFormOpen(false);
      setEditTarget(null);
    } catch (e) {
      setMutationErr(e.message);
    }
  }, [editTarget, create, update]);

  const handleCancel = useCallback(async (id) => {
    try {
      await cancel(id);
      setDrawerOpen(false);
    } catch (e) {
      console.error(e);
    }
  }, [cancel]);

  const handleReschedule = useCallback(async (id, data) => {
    try {
      await reschedule(id, data);
      setDrawerOpen(false);
    } catch (e) {
      console.error(e);
    }
  }, [reschedule]);

  const openDetail = useCallback((schedule) => {
    setDrawerItem(schedule);
    setDrawerOpen(true);
  }, []);

  // ── navigation ──────────────────────────────────────────────────

  const navPrev = () => {
    if (viewMode === 'week')  setWeekStart((w) => addDays(w, -7));
    if (viewMode === 'day')   setActiveDay((d) => addDays(d, -1));
    if (viewMode === 'month') setMonthYear(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );
  };

  const navNext = () => {
    if (viewMode === 'week')  setWeekStart((w) => addDays(w, 7));
    if (viewMode === 'day')   setActiveDay((d) => addDays(d, 1));
    if (viewMode === 'month') setMonthYear(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    );
  };

  const goToday = () => {
    const now = new Date();
    setWeekStart(startOfWeek(now));
    setActiveDay(now);
    setMonthYear({ year: now.getFullYear(), month: now.getMonth() });
  };

  // ── period label ────────────────────────────────────────────────

  const periodLabel = () => {
    if (viewMode === 'week') {
      const end = addDays(weekStart, 4);
      return `${weekStart.getDate()} – ${end.getDate()} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
    }
    if (viewMode === 'day') {
      return `${MONTHS[activeDay.getMonth()].slice(0, 3)} ${activeDay.getDate()}, ${activeDay.getFullYear()}`;
    }
    return `${MONTHS[monthYear.month]} ${monthYear.year}`;
  };

  // ── render ──────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-[#060B18] overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">

        {/* ── Top bar ─────────────────────────────────────────── */}
        <header className="flex items-center justify-between px-6 py-3.5
          border-b border-white/[0.06] bg-[#0B1221] flex-shrink-0">

          <div className="flex items-center gap-3">
            {/* Period navigation */}
            <button
              onClick={navPrev}
              className="w-7 h-7 rounded-lg border border-white/[0.08] flex items-center justify-center
                text-white/40 hover:text-white hover:border-white/20 transition-colors"
            >
              <Icon d={ICONS.chevLeft} />
            </button>
            <span className="text-[14px] font-bold text-white min-w-[180px] text-center">
              {periodLabel()}
            </span>
            <button
              onClick={navNext}
              className="w-7 h-7 rounded-lg border border-white/[0.08] flex items-center justify-center
                text-white/40 hover:text-white hover:border-white/20 transition-colors"
            >
              <Icon d={ICONS.chevRight} />
            </button>
            <button
              onClick={goToday}
              className="ml-1 px-3 py-1.5 rounded-lg border border-white/[0.08] text-[11px]
                text-white/40 hover:text-white hover:border-white/20 transition-colors"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* View mode tabs */}
            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06]
              rounded-xl p-1 mr-2">
              <ViewTab active={viewMode === 'day'}   onClick={() => setViewMode('day')}>Day</ViewTab>
              <ViewTab active={viewMode === 'week'}  onClick={() => setViewMode('week')}>Week</ViewTab>
              <ViewTab active={viewMode === 'month'} onClick={() => setViewMode('month')}>Month</ViewTab>
            </div>

            {loading && (
              <svg className="w-4 h-4 animate-spin text-white/20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}

            <button
              onClick={() => openCreate(null)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500
                text-[13px] font-semibold text-white transition-colors"
            >
              <Icon d={ICONS.plus} size={12} />
              New schedule
            </button>
          </div>
        </header>

        {/* ── Stats row ───────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-4 px-6 py-4 flex-shrink-0">
          <StatCard
            label="This week"
            value={summary.total_schedules ?? schedules.length}
            sub="total sessions"
            accent="#3B82F6"
          />
          <StatCard
            label="Scheduled"
            value={summary.scheduled ?? schedules.filter((s) => s.lesson?.status === 'S').length}
            sub="upcoming"
            accent="#8B5CF6"
          />
          <StatCard
            label="Completed"
            value={summary.completed ?? schedules.filter((s) => s.lesson?.status === 'C').length}
            sub="this week"
            accent="#10B981"
          />
          <StatCard
            label="Cancelled"
            value={summary.cancelled ?? schedules.filter((s) => s.lesson?.status === 'X').length}
            sub="this week"
            accent="#EF4444"
          />
        </div>

        {/* ── Calendar area ────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden px-6 pb-6">
          {viewMode === 'week' && (
            <WeeklyCalendar
              weekStart={weekStart}
              schedules={schedules}
              onEventClick={openDetail}
              onSlotClick={openCreate}
            />
          )}
          {viewMode === 'day' && (
            <DayView
              date={activeDay}
              schedules={schedules}
              onEventClick={openDetail}
              onSlotClick={openCreate}
            />
          )}
          {viewMode === 'month' && (
            <MonthView
              year={monthYear.year}
              month={monthYear.month}
              schedules={schedules}
              onDayClick={(day) => { setActiveDay(day); setViewMode('day'); }}
              onEventClick={openDetail}
            />
          )}
        </div>
      </main>

      {/* ── Drawers / modals ─────────────────────────────────── */}
      <ScheduleFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null); }}
        onSave={handleSave}
        initial={editTarget}
        saving={saving}
        error={mutationErr}
      />

      <ScheduleDetailDrawer
        open={drawerOpen}
        schedule={drawerItem}
        onClose={() => setDrawerOpen(false)}
        onEdit={openEdit}
        onCancel={handleCancel}
        onReschedule={handleReschedule}
        saving={saving}
      />
    </div>
  );
};

export default SchedulePage;