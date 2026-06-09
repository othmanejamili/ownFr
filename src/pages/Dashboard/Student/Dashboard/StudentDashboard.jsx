// src/pages/StudentDashboard/StudentDashboard.jsx
import { useState } from 'react';
import Sidebar from './Sidebar';
import { useDashboard } from './UseDashboard';
import {
  KpiStrip,
  ProgressOverview,
  NextLessonCard,
  UpcomingLessons,
  ExamStatusCard,
  EnrollmentCard,
  AchievementsPanel,
  ActivityFeed,
  DashboardError,
} from './Dashboardcomponents';

// ── Topbar ─────────────────────────────────────────────────────
const Topbar = ({ studentName, enrollmentStatus }) => {
  const now  = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr  = now.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const statusStyle = {
    active:    'bg-emerald-500/08 border-emerald-500/20 text-emerald-400',
    completed: 'bg-blue-600/08 border-blue-500/20 text-blue-400',
    suspended: 'bg-amber-500/08 border-amber-500/20 text-amber-400',
  };

  return (
    <header className="h-[52px] flex-shrink-0 bg-[#0B1221] border-b border-white/[0.06]
      flex items-center gap-3 px-5">

      <div className="flex items-baseline gap-2 min-w-0">
        <span className="font-sora text-[14px] font-bold text-white whitespace-nowrap">
          {greeting}, {studentName} 👋
        </span>
        <span className="text-[11px] text-white/30 font-dm hidden md:block truncate">{dateStr}</span>
      </div>

      <div className="flex-1" />

      {/* Enrollment status badge */}
      {enrollmentStatus && (
        <div className={`hidden sm:flex items-center gap-2 border rounded-lg px-3 py-1.5 capitalize
          ${statusStyle[enrollmentStatus] ?? statusStyle.active}`}>
          <span className="text-[11px] font-semibold font-dm">{enrollmentStatus}</span>
        </div>
      )}

      {/* Book lesson CTA */}
      <button className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600
        hover:bg-blue-500 rounded-[7px] text-[12px] font-semibold text-white
        transition-all duration-200 hover:-translate-y-px font-dm">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M5.5 1v9M1 5.5h9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Book lesson
      </button>
    </header>
  );
};

// ─────────────────────────────────────────────────────────────
// ROOT DASHBOARD
// ─────────────────────────────────────────────────────────────
const StudentDashboard = () => {
  const { overview, quickStats, notifications, loading, error, refetch } = useDashboard();

  const studentName      = overview?.user?.name?.split(' ')[0] || 'there';
  const enrollmentStatus = overview?.enrollment?.status ?? 'active';

  return (
    <div className="flex h-screen bg-[#060B18] overflow-hidden font-dm">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          studentName={studentName}
          enrollmentStatus={enrollmentStatus}
        />

        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

          {/* Error banner */}
          {error && <DashboardError message={error} onRetry={refetch} />}

          {/* ── ROW 1: KPI strip ── */}
          {/* theory_progress, driving_progress, total_hours, achievements */}
          <KpiStrip quickStats={quickStats} overview={overview} loading={loading} />

          {/* ── ROW 2: Progress · Next lesson · Upcoming lessons ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ProgressOverview overview={overview} loading={loading} />
            <NextLessonCard   overview={overview} loading={loading} />
            <UpcomingLessons  overview={overview} loading={loading} />
          </div>

          {/* ── ROW 3: Enrollment · Exam status · Achievements ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <EnrollmentCard    overview={overview} loading={loading} />
            <ExamStatusCard    overview={overview} loading={loading} />
            <AchievementsPanel overview={overview} loading={loading} />
          </div>

          {/* ── ROW 4: Activity feed ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-3">
              <ActivityFeed notifications={notifications} loading={loading} />
            </div>
          </div>

          <div className="h-4" />
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;