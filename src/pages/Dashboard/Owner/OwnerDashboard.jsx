import { useState } from 'react';
import Sidebar from './Sidebar';
import {
  KpiStrip,
  LessonChart,
  RevenueChart,
  TodaySchedule,
  StudentTable,
  InstructorsPanel,
  CompletionDonut,
  ActivityFeed,
  PerformanceSummary,
} from './Dashboardcomponents';

/*
 * DriveIQ — OwnerDashboard.jsx
 * Stack  : React 18 + Tailwind CSS v3 + Recharts
 *
 * Install recharts:  npm install recharts
 *
 * Fonts (add to index.html):
 *   <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
 *
 * tailwind.config.js:
 *   theme: { extend: { fontFamily: {
 *     sora: ['Sora', 'sans-serif'],
 *     dm:   ['DM Sans', 'sans-serif'],
 *   }}}
 *
 * Usage in router:
 *   import OwnerDashboard from './pages/OwnerDashboard/OwnerDashboard';
 *   <Route path="/dashboard" element={<OwnerDashboard />} />
 */

// ── Topbar ────────────────────────────────────────────────────
const Topbar = ({ range, onRangeChange }) => (
  <header className="h-[52px] flex-shrink-0 bg-[#0B1221] border-b border-white/[0.06]
    flex items-center gap-3 px-5">

    {/* Greeting */}
    <div className="flex items-baseline gap-2">
      <span className="font-sora text-[14px] font-bold text-white">
        Good morning, Karim 👋
      </span>
      <span className="text-[11px] text-white/30 font-dm hidden sm:block">
        Friday, May 1 · 2026
      </span>
    </div>

    <div className="flex-1" />

    {/* Live indicator */}
    <div className="hidden sm:flex items-center gap-2 bg-emerald-500/08 border border-emerald-500/20
      rounded-lg px-3 py-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <span className="text-[11px] font-semibold text-emerald-400 font-dm">6 lessons live now</span>
    </div>

    {/* Range tabs */}
    <div className="flex bg-[#0F1A2E] border border-white/[0.07] rounded-[7px] p-0.5 gap-0.5">
      {['7d', '30d', '90d'].map((r) => (
        <button
          key={r}
          onClick={() => onRangeChange(r)}
          className={[
            'px-3 py-1 rounded-[5px] text-[11px] font-medium transition-all duration-200 font-dm',
            range === r
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-white/30 hover:text-white/60',
          ].join(' ')}
        >
          {r.toUpperCase()}
        </button>
      ))}
    </div>

    {/* New lesson CTA */}
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

// ── Section header ────────────────────────────────────────────
const SectionHead = ({ title, sub, action, onAction }) => (
  <div className="flex items-center justify-between mb-3">
    <div>
      <div className="font-sora text-[13px] font-bold text-white">{title}</div>
      {sub && <div className="text-[10px] text-white/30 mt-0.5 font-dm">{sub}</div>}
    </div>
    {action && (
      <button onClick={onAction}
        className="text-[11px] text-white/35 hover:text-white/70
          transition-colors font-dm flex items-center gap-1">
        {action}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.2"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────
// ROOT DASHBOARD
// ─────────────────────────────────────────────────────────────
const OwnerDashboard = () => {
  const [range, setRange] = useState('7d');

  return (
    <div className="flex h-screen bg-[#060B18] overflow-hidden font-dm">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar range={range} onRangeChange={setRange} />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

          {/* ── ROW 1: KPI strip ── */}
          <KpiStrip range={range} />

          {/* ── ROW 2: Charts + schedule ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Lesson activity */}
            <div className="lg:col-span-1">
              <LessonChart range={range} />
            </div>

            {/* Revenue */}
            <div className="lg:col-span-1">
              <RevenueChart range={range} />
            </div>

            {/* Today's schedule */}
            <div className="lg:col-span-1">
              <TodaySchedule />
            </div>
          </div>

          {/* ── ROW 3: Students + Instructors + right col ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Students table */}
            <div className="lg:col-span-1">
              <StudentTable />
            </div>

            {/* Instructors */}
            <div className="lg:col-span-1">
              <InstructorsPanel />
            </div>

            {/* Right column: donut + activity */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <CompletionDonut />
              <ActivityFeed />
            </div>
          </div>

          {/* ── ROW 4: Performance summary + announcements ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Performance ring */}
            <div className="lg:col-span-1">
              <PerformanceSummary />
            </div>

            {/* Upcoming exams */}
            <div className="lg:col-span-1 bg-[#0F1A2E] border border-white/[0.07]
              rounded-[14px] p-4 hover:border-white/[0.11] transition-colors">
              <SectionHead title="Upcoming exams" sub="Next 7 days" action="View calendar" />
              <div className="flex flex-col gap-2">
                {[
                  { name: 'Yassir Moktari', date: 'May 5', type: 'Code exam',    status: 'Ready',     sc: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20' },
                  { name: 'Lina Oussama',   date: 'May 7', type: 'Road test',    status: 'Needs prep',sc: 'bg-amber-500/12 text-amber-400 border-amber-500/20' },
                  { name: 'Hassan Amrani',  date: 'May 9', type: 'Code exam',    status: 'Ready',     sc: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20' },
                  { name: 'Sara Moussaoui', date: 'May 12',type: 'Road test',    status: 'Too early', sc: 'bg-white/[0.06] text-white/35 border-white/[0.08]' },
                ].map((e) => (
                  <div key={e.name}
                    className="flex items-center gap-3 p-2.5 bg-white/[0.02]
                      border border-white/[0.04] rounded-xl hover:bg-white/[0.04]
                      transition-colors cursor-default">
                    <div className="w-9 h-9 flex-shrink-0 bg-[#162035] rounded-lg
                      flex flex-col items-center justify-center">
                      <span className="text-[8px] font-bold text-white/50 font-dm leading-none">
                        {e.date.split(' ')[0].toUpperCase()}
                      </span>
                      <span className="font-sora text-[13px] font-black text-white leading-none">
                        {e.date.split(' ')[1]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-semibold text-white/80 truncate font-dm">
                        {e.name}
                      </div>
                      <div className="text-[9px] text-white/30 mt-0.5 font-dm">{e.type}</div>
                    </div>
                    <span className={`text-[9px] font-semibold px-2 py-0.5
                      rounded-md border flex-shrink-0 font-dm ${e.sc}`}>
                      {e.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent payments */}
            <div className="lg:col-span-1 bg-[#0F1A2E] border border-white/[0.07]
              rounded-[14px] p-4 hover:border-white/[0.11] transition-colors">
              <SectionHead title="Recent payments" sub="Last 5 transactions" action="View all" />

              {/* Revenue ring */}
              <div className="flex items-center gap-4 mb-4 p-3
                bg-white/[0.02] border border-white/[0.04] rounded-xl">
                <div>
                  <div className="font-sora text-[22px] font-black text-white tracking-tight">
                    48.2k
                  </div>
                  <div className="text-[9px] text-white/30 font-dm">MAD this month</div>
                </div>
                <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full w-[78%] bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" />
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 font-dm">78%</span>
              </div>

              <div className="flex flex-col gap-0">
                {[
                  { name: 'Karim Benali',    amount: '+850',   date: 'Today',       color: 'text-emerald-400' },
                  { name: 'Sara Moussaoui',  amount: '+1,200', date: 'Yesterday',   color: 'text-emerald-400' },
                  { name: 'Hassan Amrani',   amount: '+850',   date: '2 days ago',  color: 'text-emerald-400' },
                  { name: 'Yassir Moktari',  amount: '-250',   date: '3 days ago',  color: 'text-red-400' },
                  { name: 'Lina Oussama',    amount: '+600',   date: '4 days ago',  color: 'text-emerald-400' },
                ].map((p) => (
                  <div key={p.name}
                    className="flex items-center justify-between py-2.5
                      border-b border-white/[0.03] last:border-0
                      hover:bg-white/[0.02] -mx-1 px-1 rounded-lg transition-colors">
                    <div>
                      <div className="text-[11px] font-semibold text-white/75 font-dm">{p.name}</div>
                      <div className="text-[9px] text-white/25 mt-0.5 font-dm">{p.date}</div>
                    </div>
                    <span className={`font-sora text-[13px] font-bold ${p.color}`}>
                      {p.amount} MAD
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom spacing */}
          <div className="h-4" />
        </main>
      </div>
    </div>
  );
};

export default OwnerDashboard;