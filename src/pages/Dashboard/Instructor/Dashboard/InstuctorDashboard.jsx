// src/pages/InstructorDashboard/InstructorDashboard.jsx
import { useState } from 'react';
import Sidebar from './Sidebar';
import { useDashboard } from './Usedashboard';
import {
  KpiStrip,
  TodaySchedule,
  UpcomingLessons,
  WeeklyChart,
  PerformanceRing,
  RecentFeedback,
  CompletionDonut,
  ActivityFeed,
  DashboardError,
} from './Dashboardcomponents';

// ── Topbar ────────────────────────────────────────────────────
const Topbar = ({ range, onRangeChange, instructorName, todayUpcoming }) => {
  const now  = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr  = now.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <header className="h-[52px] flex-shrink-0 bg-[#0B1221] border-b border-white/[0.06]
      flex items-center gap-3 px-5">

      {/* Greeting */}
      <div className="flex items-baseline gap-2 min-w-0">
        <span className="font-sora text-[14px] font-bold text-white whitespace-nowrap">
          {greeting}, {instructorName} 👋
        </span>
        <span className="text-[11px] text-white/30 font-dm hidden md:block truncate">
          {dateStr}
        </span>
      </div>

      <div className="flex-1" />

      {/* Live badge */}
      {todayUpcoming > 0 && (
        <div className="hidden sm:flex items-center gap-2 bg-blue-500/08 border border-blue-500/20
          rounded-lg px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-blue-400 font-dm">
            {todayUpcoming} lesson{todayUpcoming !== 1 ? 's' : ''} upcoming
          </span>
        </div>
      )}

      {/* Range picker */}
      <div className="flex bg-[#0F1A2E] border border-white/[0.07] rounded-[7px] p-0.5 gap-0.5">
        {['7d', '30d', '90d'].map(r => (
          <button
            key={r}
            onClick={() => onRangeChange(r)}
            className={[
              'px-3 py-1 rounded-[5px] text-[11px] font-medium transition-all duration-200 font-dm',
              range === r ? 'bg-blue-600 text-white font-semibold' : 'text-white/30 hover:text-white/60',
            ].join(' ')}
          >
            {r.toUpperCase()}
          </button>
        ))}
      </div>
    </header>
  );
};

// ─────────────────────────────────────────────────────────────
// ROOT DASHBOARD
// ─────────────────────────────────────────────────────────────
const InstructorDashboard = () => {
  const [range, setRange] = useState('7d');
  const { overview, quickStats, notifications, loading, error, refetch } = useDashboard(range);

  const instructorName = overview?.user?.name?.split(' ')[0] || 'there';
  const todayUpcoming  = overview?.today?.upcoming ?? 0;

  return (
    <div className="flex h-screen bg-[#060B18] overflow-hidden font-dm">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          range={range}
          onRangeChange={setRange}
          instructorName={instructorName}
          todayUpcoming={todayUpcoming}
        />

        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

          {/* Error banner */}
          {error && <DashboardError message={error} onRetry={refetch} />}

          {/* ── ROW 1: KPI strip ── */}
          <KpiStrip quickStats={quickStats} overview={overview} loading={loading} />

          {/* ── ROW 2: Weekly chart · Today's schedule · Upcoming lessons ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <WeeklyChart overview={overview} loading={loading} />
            <TodaySchedule overview={overview} loading={loading} />
            <UpcomingLessons overview={overview} loading={loading} />
          </div>

          {/* ── ROW 3: Performance ring · Recent feedback · Donut + Feed ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Left: performance summary */}
            <PerformanceRing overview={overview} loading={loading} />

            {/* Middle: student feedback */}
            <RecentFeedback overview={overview} loading={loading} />

            {/* Right: donut + notification feed stacked */}
            <div className="flex flex-col gap-4">
              <CompletionDonut overview={overview} loading={loading} />
              <ActivityFeed notifications={notifications} loading={loading} />
            </div>

          </div>

          <div className="h-4" />
        </main>
      </div>
    </div>
  );
};

export default InstructorDashboard;