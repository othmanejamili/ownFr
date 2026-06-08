// src/pages/OwnerDashboard/OwnerDashboard.jsx
import { useState } from 'react';
import Sidebar from './Sidebar';
import { useDashboard } from './UsedashboardO';
import {
  KpiStrip,
  LessonChart,
  RevenueChart,
  TodaySchedule,
  SchoolTable,
  StudentTable,
  InstructorsPanel,
  CompletionDonut,
  PerformanceSummary,
  RevenueCard,
  ActivityFeed,
  DashboardError,
} from './Dashboardcomponents';

// ── Topbar  ────────────────────────────────────────────────────
const Topbar = ({ range, onRangeChange, ownerName, totalSchools, liveCount }) => {
  const now  = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr  = now.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <header className="h-[52px] flex-shrink-0 bg-[#0B1221] border-b border-white/[0.06]
      flex items-center gap-3 px-5">

      <div className="flex items-baseline gap-2 min-w-0">
        <span className="font-sora text-[14px] font-bold text-white whitespace-nowrap">
          {greeting}, {ownerName} 👋
        </span>
        <span className="text-[11px] text-white/30 font-dm hidden md:block truncate">{dateStr}</span>
      </div>

      <div className="flex-1" />

      {/* School count badge */}
      {totalSchools > 0 && (
        <div className="hidden sm:flex items-center gap-2 bg-blue-500/08 border border-blue-500/20 rounded-lg px-3 py-1.5">
          <span className="text-[11px] font-semibold text-blue-400 font-dm">
            {totalSchools} school{totalSchools !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Live badge */}
      {liveCount > 0 && (
        <div className="hidden sm:flex items-center gap-2 bg-emerald-500/08 border border-emerald-500/20 rounded-lg px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-emerald-400 font-dm">
            {liveCount} lesson{liveCount !== 1 ? 's' : ''} live
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

      <button className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600
        hover:bg-blue-500 rounded-[7px] text-[12px] font-semibold text-white
        transition-all duration-200 hover:-translate-y-px font-dm">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M5.5 1v9M1 5.5h9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        New lesson
      </button>
    </header>
  );
};

// ─────────────────────────────────────────────────────────────
// ROOT DASHBOARD
// ─────────────────────────────────────────────────────────────
const OwnerDashboard = () => {
  const [range, setRange] = useState('7d');
  const { overview, quickStats, notifications, analytics, loading, error, refetch } =
    useDashboard(range);

  // overview.user.name from _school_owner_dashboard
  const ownerName   = overview?.user?.name?.split(' ')[0] || 'there';
  // overview.overview.total_schools
  const totalSchools= overview?.overview?.total_schools ?? 0;
  // No live count from backend currently — extend if /dashboard/overview/ adds it
  const liveCount   = 0;

  return (
    <div className="flex h-screen bg-[#060B18] overflow-hidden font-dm">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          range={range}
          onRangeChange={setRange}
          ownerName={ownerName}
          totalSchools={totalSchools}
          liveCount={liveCount}
        />

        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

          {/* Error banner */}
          {error && <DashboardError message={error} onRetry={refetch} />}

          {/* ── ROW 1: KPI strip ── */}
          {/* KpiStrip reads: quickStats.stats + overview.overview + overview.today + overview.this_week_performance */}
          <KpiStrip quickStats={quickStats} overview={overview} loading={loading} />

          {/* ── ROW 2: Lesson chart · Revenue chart · Today overview ── */}
          {/* LessonChart  → analytics.lesson_trends / daily_lessons + overview.this_week_performance */}
          {/* RevenueChart → analytics.revenue_trends / weekly_revenue + overview.this_week_performance */}
          {/* TodaySchedule→ overview.today + overview.schools[] + overview.overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <LessonChart  range={range} analytics={analytics} overview={overview} loading={loading} />
            <RevenueChart range={range} analytics={analytics} overview={overview} loading={loading} />
            <TodaySchedule overview={overview} loading={loading} />
          </div>

          {/* ── ROW 3: Schools · Students · Instructors ── */}
          {/* SchoolTable   → overview.schools[] */}
          {/* StudentTable  → analytics.top_students / students */}
          {/* InstructorsPanel → analytics.instructors / top_instructors + overview.overview.total_instructors */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SchoolTable     overview={overview}                      loading={loading} />
            <StudentTable    analytics={analytics}                    loading={loading} />
            <InstructorsPanel analytics={analytics} overview={overview} loading={loading} />
          </div>

          {/* ── ROW 4: Performance · Revenue card · Donut + Feed ── */}
          {/* PerformanceSummary → analytics.{ pass_rate, avg_rating, city_rank, ... } */}
          {/* RevenueCard        → overview.best_performing_school + overview.this_week_performance */}
          {/* CompletionDonut    → overview.today + analytics.{ completed_today, in_progress_today } */}
          {/* ActivityFeed       → notifications[] */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <PerformanceSummary analytics={analytics} overview={overview} loading={loading} />
            <RevenueCard        overview={overview}                        loading={loading} />
            <div className="flex flex-col gap-4">
              <CompletionDonut overview={overview} analytics={analytics} loading={loading} />
              <ActivityFeed    notifications={notifications}              loading={loading} />
            </div>
          </div>

          <div className="h-4" />
        </main>
      </div>
    </div>
  );
};

export default OwnerDashboard;