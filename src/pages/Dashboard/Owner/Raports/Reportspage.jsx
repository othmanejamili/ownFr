// src/pages/owner/ReportsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import useReports from './Usereports';
import Sidebar from '../Sidebar';
import { useSchools } from '../Analytics/Useanalytics';
import {
  formatCurrency,
  formatPercent,
  formatDate,
  trendColor,
  trendArrow,
  buildSummaryKPIs,
  progressCategoryColor,
  progressCategory,
  ratingColor,
  starString,
  initials,
  truncate,
  toISODate,
} from './Reportutils';

// ══════════════════════════════════════════════════════════════════════════════
//  Tiny shared primitives
// ══════════════════════════════════════════════════════════════════════════════

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
  </div>
);

const ErrorBanner = ({ message, onRetry }) => (
  <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20
    rounded-xl px-4 py-3 text-sm text-red-400 my-4">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
    <span className="flex-1">{message}</span>
    {onRetry && (
      <button onClick={onRetry}
        className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2">
        Retry
      </button>
    )}
  </div>
);

const EmptyState = ({ label = 'No data available for this period.' }) => (
  <div className="flex flex-col items-center justify-center py-20 text-white/25 text-sm gap-2">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="6" y="8" width="28" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 16h14M13 21h10M13 26h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
    {label}
  </div>
);

// ─── Stat card ────────────────────────────────────────────────────────────────
const KPICard = ({ icon, label, value, trend, changeLabel }) => (
  <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-2xl px-5 py-4
    flex flex-col gap-3 hover:border-white/[0.12] transition-colors">
    <div className="flex items-center justify-between">
      <span className="text-xl">{icon}</span>
      {trend && (
        <span className={`text-[11px] font-bold font-dm ${trendColor(trend)}`}>
          {trendArrow(trend)} {changeLabel}
        </span>
      )}
    </div>
    <div>
      <div className="text-[22px] font-bold font-sora text-white leading-none">{value}</div>
      <div className="text-[11px] text-white/35 font-dm mt-1">{label}</div>
    </div>
  </div>
);

// ─── Tab button ───────────────────────────────────────────────────────────────
const Tab = ({ id, label, icon, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={[
      'flex items-center gap-2 px-4 py-2 rounded-[10px] text-[12px] font-medium font-dm',
      'transition-all duration-200 whitespace-nowrap',
      active
        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
        : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]',
    ].join(' ')}>
    <span className="text-base leading-none">{icon}</span>
    {label}
  </button>
);

// ─── Section heading ──────────────────────────────────────────────────────────
const SectionHeading = ({ children }) => (
  <h3 className="text-[11px] font-bold text-white/25 tracking-widest uppercase font-dm mb-3">
    {children}
  </h3>
);

// ─── Progress bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ value, color = 'bg-blue-500' }) => (
  <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
    <div
      className={`h-full rounded-full transition-all duration-500 ${color}`}
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

// ─── Inline trend badge ───────────────────────────────────────────────────────
const TrendBadge = ({ trend, label }) => {
  const colorMap = {
    up:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    down:   'bg-red-500/10 text-red-400 border-red-500/20',
    stable: 'bg-white/5 text-white/30 border-white/10',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border font-dm
      ${colorMap[trend] ?? colorMap.stable}`}>
      {trendArrow(trend)} {label}
    </span>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  Date Filters
// ══════════════════════════════════════════════════════════════════════════════

const WeeklyFilter = ({ onLoad, loading }) => {
  const [date, setDate] = useState('');
  return (
    <div className="flex items-center gap-3">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="bg-white/[0.04] border border-white/[0.08] text-white/70 text-xs
          rounded-lg px-3 py-1.5 font-dm focus:outline-none focus:border-blue-500/40"
      />
      <button
        onClick={() => onLoad(date || null)}
        disabled={loading}
        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs
          font-semibold rounded-lg transition-colors disabled:opacity-50 font-dm">
        {loading ? 'Loading…' : 'Generate'}
      </button>
    </div>
  );
};

const MonthlyFilter = ({ onLoad, loading }) => {
  const [month, setMonth] = useState('');
  return (
    <div className="flex items-center gap-3">
      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="bg-white/[0.04] border border-white/[0.08] text-white/70 text-xs
          rounded-lg px-3 py-1.5 font-dm focus:outline-none focus:border-blue-500/40"
      />
      <button
        onClick={() => onLoad(month || null)}
        disabled={loading}
        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs
          font-semibold rounded-lg transition-colors disabled:opacity-50 font-dm">
        {loading ? 'Loading…' : 'Generate'}
      </button>
    </div>
  );
};

const DateRangeFilter = ({ onLoad, loading }) => {
  const [start, setStart] = useState('');
  const [end, setEnd]     = useState('');
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <input type="date" value={start} onChange={(e) => setStart(e.target.value)}
        placeholder="Start date"
        className="bg-white/[0.04] border border-white/[0.08] text-white/70 text-xs
          rounded-lg px-3 py-1.5 font-dm focus:outline-none focus:border-blue-500/40" />
      <span className="text-white/20 text-xs">→</span>
      <input type="date" value={end} onChange={(e) => setEnd(e.target.value)}
        placeholder="End date"
        className="bg-white/[0.04] border border-white/[0.08] text-white/70 text-xs
          rounded-lg px-3 py-1.5 font-dm focus:outline-none focus:border-blue-500/40" />
      <button
        onClick={() => onLoad({ startDate: start || null, endDate: end || null })}
        disabled={loading}
        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs
          font-semibold rounded-lg transition-colors disabled:opacity-50 font-dm">
        {loading ? 'Loading…' : 'Generate'}
      </button>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  Panel: Weekly Report
// ══════════════════════════════════════════════════════════════════════════════

const WeeklyPanel = ({ state, onLoad, onSendEmail, emailStatus, onExport, exportStatus }) => {
  const { data, loading, error } = state;

  const kpis = data?.summary_metrics ? buildSummaryKPIs(data.summary_metrics) : [];
  const comparison = data?.comparison_with_previous_week;
  const lessons    = data?.lessons;
  const attendance = data?.attendance;

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <WeeklyFilter onLoad={onLoad} loading={loading} />
        <div className="flex gap-2">
          <button
            onClick={() => onSendEmail()}
            disabled={!data || emailStatus.sending}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-dm font-semibold
              bg-violet-600/20 text-violet-400 border border-violet-500/20 rounded-lg
              hover:bg-violet-600/30 transition-colors disabled:opacity-40">
            📧 {emailStatus.sending ? 'Sending…' : 'Email Report'}
          </button>
          <button
            onClick={() => onExport('weekly', 'csv')}
            disabled={!data || exportStatus.loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-dm font-semibold
              bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg
              hover:bg-emerald-500/20 transition-colors disabled:opacity-40">
            ⬇ {exportStatus.loading ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Feedback toasts */}
      {emailStatus.result && (
        <div className={`text-xs font-dm px-4 py-2 rounded-lg border ${
          emailStatus.result.success
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {emailStatus.result.success
            ? `✓ Report emailed to ${emailStatus.result.recipient}`
            : `✗ ${emailStatus.result.message}`}
        </div>
      )}

      {loading && <Spinner />}
      {error   && <ErrorBanner message={error} onRetry={() => onLoad(null)} />}

      {data && !loading && (
        <>
          {/* Period badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/30 font-dm">
              {formatDate(data.period?.start_date)} — {formatDate(data.period?.end_date)}
            </span>
            {data.cache_hit && (
              <span className="text-[9px] px-2 py-0.5 rounded-md bg-blue-500/10
                text-blue-400 border border-blue-500/20 font-dm">CACHED</span>
            )}
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {kpis.map((k) => (
              <KPICard key={k.key} icon={k.icon} label={k.label} value={k.value} />
            ))}
          </div>

          {/* Two-col: lessons + attendance */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Lessons */}
            {lessons && (
              <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-2xl p-5">
                <SectionHeading>Lesson Statistics</SectionHeading>
                <div className="space-y-3">
                  {[
                    { label: 'Total Scheduled', value: lessons.total_scheduled },
                    { label: 'Completed',        value: lessons.completed },
                    { label: 'Cancelled',        value: lessons.cancelled },
                    { label: 'Completion Rate',  value: formatPercent(lessons.completion_rate) },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-xs text-white/40 font-dm">{row.label}</span>
                      <span className="text-sm font-semibold text-white font-dm">{row.value}</span>
                    </div>
                  ))}
                  <ProgressBar value={lessons.completion_rate} color="bg-blue-500" />
                </div>
              </div>
            )}

            {/* Attendance */}
            {attendance && (
              <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-2xl p-5">
                <SectionHeading>Attendance</SectionHeading>
                <div className="space-y-3">
                  {[
                    { label: 'Total Records', value: attendance.total_records },
                    { label: 'Present',       value: attendance.present },
                    { label: 'Absent',        value: attendance.absent },
                    { label: 'Attendance Rate', value: formatPercent(attendance.attendance_rate) },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-xs text-white/40 font-dm">{row.label}</span>
                      <span className="text-sm font-semibold text-white font-dm">{row.value}</span>
                    </div>
                  ))}
                  <ProgressBar value={attendance.attendance_rate} color="bg-emerald-500" />
                </div>
              </div>
            )}
          </div>

          {/* Comparison */}
          {comparison && !comparison.message && (
            <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-2xl p-5">
              <SectionHeading>vs. Previous Week</SectionHeading>
              <div className="flex flex-wrap gap-4">
                {Object.entries(comparison.trends || {}).map(([key, trend]) => (
                  <div key={key} className="flex flex-col gap-1">
                    <span className="text-[10px] text-white/30 font-dm capitalize">
                      {key.replace('_', ' ')}
                    </span>
                    <TrendBadge trend={trend} label={trend} />
                  </div>
                ))}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-white/30 font-dm">Revenue Δ</span>
                  <span className={`text-sm font-bold font-dm ${
                    comparison.revenue_change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {comparison.revenue_change >= 0 ? '+' : ''}
                    {formatCurrency(comparison.revenue_change)}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-white/30 font-dm">New Students Δ</span>
                  <span className={`text-sm font-bold font-dm ${
                    comparison.new_students_change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {comparison.new_students_change >= 0 ? '+' : ''}{comparison.new_students_change}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Daily breakdown table */}
          {data.daily_breakdown?.length > 0 && (
            <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="px-5 pt-4 pb-2">
                <SectionHeading>Daily Breakdown</SectionHeading>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-dm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['Date','Students','Active','New','Revenue','Lessons'].map((h) => (
                        <th key={h} className="px-5 py-2.5 text-left text-white/25 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.daily_breakdown.map((row, i) => (
                      <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="px-5 py-2.5 text-white/60">{formatDate(row.date)}</td>
                        <td className="px-5 py-2.5 text-white">{row.total_students}</td>
                        <td className="px-5 py-2.5 text-white/70">{row.active_students}</td>
                        <td className="px-5 py-2.5 text-emerald-400">+{row.new_students}</td>
                        <td className="px-5 py-2.5 text-white">{formatCurrency(row.revenue)}</td>
                        <td className="px-5 py-2.5 text-white/70">{row.lessons_completed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top students */}
          {data.top_students?.length > 0 && (
            <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-2xl p-5">
              <SectionHeading>Top Students</SectionHeading>
              <div className="space-y-3">
                {data.top_students.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <span className="text-[11px] text-white/20 font-dm w-4">#{i + 1}</span>
                    <div className="w-7 h-7 rounded-full bg-blue-600/30 flex items-center
                      justify-center text-[10px] font-bold text-blue-300 font-dm">
                      {initials(s.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white font-dm truncate">{s.name}</div>
                      <ProgressBar value={s.progress} color="bg-blue-500" />
                    </div>
                    <span className="text-xs font-bold text-white/50 font-dm w-12 text-right">
                      {formatPercent(s.progress)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!data && !loading && !error && (
        <EmptyState label="Select a date and click Generate to load the weekly report." />
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  Panel: Monthly Report
// ══════════════════════════════════════════════════════════════════════════════

const MonthlyPanel = ({ state, onLoad, onExport, exportStatus }) => {
  const { data, loading, error } = state;
  const kpis = data?.summary_metrics ? buildSummaryKPIs(data.summary_metrics) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <MonthlyFilter onLoad={onLoad} loading={loading} />
        <button
          onClick={() => onExport('monthly', 'csv')}
          disabled={!data || exportStatus.loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-dm font-semibold
            bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg
            hover:bg-emerald-500/20 transition-colors disabled:opacity-40">
          ⬇ {exportStatus.loading ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {loading && <Spinner />}
      {error   && <ErrorBanner message={error} onRetry={() => onLoad(null)} />}

      {data && !loading && (
        <>
          <div className="text-xs text-white/30 font-dm">
            {data.period?.month} — {data.period?.days} days
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {kpis.map((k) => (
              <KPICard key={k.key} icon={k.icon} label={k.label} value={k.value} />
            ))}
          </div>

          {/* Executive summary extras */}
          {data.executive_summary && (
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: 'Student Growth',    value: data.executive_summary.student_growth ?? '—', icon: '📈' },
                { label: 'Students Completed',value: data.executive_summary.students_completed ?? '—', icon: '🏁' },
                { label: 'Attendance Rate',   value: formatPercent(data.executive_summary.monthly_attendance_rate), icon: '📋' },
              ].map((item) => (
                <div key={item.label}
                  className="bg-[#0F1A2E] border border-white/[0.07] rounded-2xl p-4 flex gap-3 items-center">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="text-lg font-bold text-white font-sora">{item.value}</div>
                    <div className="text-[11px] text-white/35 font-dm">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Weekly breakdown inside month */}
          {data.weekly_breakdown?.length > 0 && (
            <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="px-5 pt-4 pb-2">
                <SectionHeading>Weekly Breakdown</SectionHeading>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-dm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['Week','Period','Active Avg','New Students','Revenue','Lessons'].map((h) => (
                        <th key={h} className="px-5 py-2.5 text-left text-white/25 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.weekly_breakdown.map((row) => (
                      <tr key={row.week} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="px-5 py-2.5 text-white/50">W{row.week}</td>
                        <td className="px-5 py-2.5 text-white/50">
                          {formatDate(row.start_date)} – {formatDate(row.end_date)}
                        </td>
                        <td className="px-5 py-2.5 text-white">{row.avg_active_students}</td>
                        <td className="px-5 py-2.5 text-emerald-400">+{row.new_students}</td>
                        <td className="px-5 py-2.5 text-white">{formatCurrency(row.revenue)}</td>
                        <td className="px-5 py-2.5 text-white/70">{row.lessons_completed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Month comparison */}
          {data.comparison_with_previous_month && !data.comparison_with_previous_month.message && (
            <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-2xl p-5">
              <SectionHeading>vs. Previous Month</SectionHeading>
              <div className="flex flex-wrap gap-6">
                {Object.entries(data.comparison_with_previous_month.trends || {}).map(([key, trend]) => (
                  <div key={key} className="flex flex-col gap-1">
                    <span className="text-[10px] text-white/30 font-dm capitalize">{key}</span>
                    <TrendBadge trend={trend} label={trend} />
                  </div>
                ))}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-white/30 font-dm">Revenue Δ</span>
                  <span className={`text-sm font-bold font-dm ${
                    data.comparison_with_previous_month.revenue_change >= 0
                      ? 'text-emerald-400' : 'text-red-400'}`}>
                    {data.comparison_with_previous_month.revenue_change >= 0 ? '+' : ''}
                    {formatCurrency(data.comparison_with_previous_month.revenue_change)}
                    {data.comparison_with_previous_month.revenue_change_percentage !== undefined && (
                      <span className="text-white/30 ml-1 text-[11px]">
                        ({data.comparison_with_previous_month.revenue_change_percentage}%)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!data && !loading && !error && (
        <EmptyState label="Select a month and click Generate to load the monthly report." />
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  Panel: Instructor Performance
// ══════════════════════════════════════════════════════════════════════════════

const InstructorPanel = ({ state, onLoad }) => {
  const { data, loading, error } = state;

  return (
    <div className="space-y-6">
      <DateRangeFilter onLoad={onLoad} loading={loading} />

      {loading && <Spinner />}
      {error   && <ErrorBanner message={error} onRetry={() => onLoad({})} />}

      {data && !loading && (
        <>
          {/* Overall stats */}
          {data.overall_statistics && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Instructors', value: data.overall_statistics.total_instructors, icon: '👨‍🏫' },
                { label: 'Avg Completion',    value: formatPercent(data.overall_statistics.avg_completion_rate), icon: '✅' },
                { label: 'Avg Rating',        value: `${data.overall_statistics.avg_rating}/5`, icon: '⭐' },
              ].map((item) => (
                <KPICard key={item.label} {...item} />
              ))}
            </div>
          )}

          {/* Instructor cards */}
          {data.instructor_reports?.length > 0 ? (
            <div className="space-y-3">
              {data.instructor_reports.map((r) => {
                const rating = r.feedback_metrics?.average_rating ?? 0;
                return (
                  <div key={r.instructor?.id}
                    className="bg-[#0F1A2E] border border-white/[0.07] rounded-2xl p-5
                      hover:border-white/[0.12] transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/20
                        flex items-center justify-center text-[13px] font-bold text-blue-300 font-dm flex-shrink-0">
                        {initials(r.instructor?.name)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-white font-dm truncate">
                            {r.instructor?.name}
                          </span>
                          {r.rank && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-blue-500/10
                              text-blue-400 border border-blue-500/20 font-dm">
                              #{r.rank}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-white/30 font-dm">{r.instructor?.email}</span>

                        {/* Metrics row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                          {[
                            { label: 'Lessons',     value: r.lesson_metrics?.total_lessons },
                            { label: 'Completed',   value: r.lesson_metrics?.completed },
                            { label: 'Completion',  value: formatPercent(r.lesson_metrics?.completion_rate) },
                            { label: 'Hours',       value: r.lesson_metrics?.total_hours },
                          ].map((m) => (
                            <div key={m.label}>
                              <div className="text-[10px] text-white/25 font-dm">{m.label}</div>
                              <div className="text-sm font-bold text-white font-dm">{m.value ?? '—'}</div>
                            </div>
                          ))}
                        </div>

                        {/* Rating bar */}
                        <div className="mt-3 flex items-center gap-3">
                          <span className={`text-sm font-bold font-dm ${ratingColor(rating)}`}>
                            {starString(rating)} {rating.toFixed(1)}
                          </span>
                          <span className="text-[11px] text-white/25 font-dm">
                            {r.feedback_metrics?.total_feedback} reviews
                          </span>
                          {r.performance_score !== undefined && (
                            <span className="ml-auto text-[11px] text-white/40 font-dm">
                              Score: <span className="text-white font-bold">{r.performance_score}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState label="No instructor data found for this period." />
          )}
        </>
      )}

      {!data && !loading && !error && (
        <EmptyState label="Select a date range and click Generate." />
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  Panel: Student Progress
// ══════════════════════════════════════════════════════════════════════════════

const StudentPanel = ({ state, onLoad }) => {
  const { data, loading, error } = state;
  const [statusFilter, setStatusFilter] = useState('');
  const [minProg,      setMinProg]      = useState('');

  const handleLoad = () =>
    onLoad({ status: statusFilter || null, minProgress: minProg || null });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] text-white/70 text-xs
            rounded-lg px-3 py-1.5 font-dm focus:outline-none focus:border-blue-500/40">
          <option value="">All Statuses</option>
          <option value="A">Active</option>
          <option value="C">Completed</option>
          <option value="P">Paused</option>
        </select>
        <input type="number" placeholder="Min Progress %" min="0" max="100"
          value={minProg} onChange={(e) => setMinProg(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] text-white/70 text-xs
            rounded-lg px-3 py-1.5 w-32 font-dm focus:outline-none focus:border-blue-500/40" />
        <button onClick={handleLoad} disabled={loading}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs
            font-semibold rounded-lg transition-colors disabled:opacity-50 font-dm">
          {loading ? 'Loading…' : 'Generate'}
        </button>
      </div>

      {loading && <Spinner />}
      {error   && <ErrorBanner message={error} onRetry={handleLoad} />}

      {data && !loading && (
        <>
          {/* Summary pills */}
          {data.summary && (
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Total',     value: data.summary.total_students, color: 'text-white' },
                { label: 'At Risk',   value: data.summary.at_risk,        color: 'text-red-400' },
                { label: 'On Track',  value: data.summary.on_track,       color: 'text-amber-400' },
                { label: 'Excelling', value: data.summary.excelling,      color: 'text-emerald-400' },
                { label: 'Avg Progress', value: formatPercent(data.summary.avg_progress), color: 'text-blue-400' },
              ].map((p) => (
                <div key={p.label}
                  className="bg-[#0F1A2E] border border-white/[0.07] rounded-xl px-4 py-2">
                  <div className={`text-lg font-bold font-sora ${p.color}`}>{p.value}</div>
                  <div className="text-[10px] text-white/30 font-dm">{p.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Student list */}
          {data.students?.length > 0 ? (
            <div className="space-y-2">
              {data.students.map((s) => {
                const cat   = progressCategory(s.progress?.average ?? 0);
                const badge = progressCategoryColor(cat);
                return (
                  <div key={s.student?.id}
                    className="bg-[#0F1A2E] border border-white/[0.07] rounded-xl p-4
                      hover:border-white/[0.12] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center
                        justify-center text-[11px] font-bold text-blue-300 font-dm flex-shrink-0">
                        {initials(s.student?.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-white font-dm truncate">
                            {s.student?.name}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${badge}`}>
                            {cat.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-[10px] text-white/25 font-dm ml-auto">{s.status}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-white/40 font-dm mb-2">
                          <span>Theory {formatPercent(s.progress?.theory)}</span>
                          <span>Driving {formatPercent(s.progress?.driving)}</span>
                          <span>Attendance {formatPercent(s.attendance?.attendance_rate)}</span>
                        </div>
                        <ProgressBar
                          value={s.progress?.average ?? 0}
                          color={cat === 'excelling' ? 'bg-emerald-500' : cat === 'at_risk' ? 'bg-red-500' : 'bg-amber-500'}
                        />
                      </div>
                      <span className="text-sm font-bold text-white font-dm w-12 text-right">
                        {formatPercent(s.progress?.average)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState label="No students match the selected filters." />
          )}
        </>
      )}

      {!data && !loading && !error && (
        <EmptyState label="Apply filters and click Generate to view student progress." />
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  Panel: Financial Summary
// ══════════════════════════════════════════════════════════════════════════════

const FinancialPanel = ({ state, onLoad }) => {
  const { data, loading, error } = state;
  const fs = data?.financial_summary;

  return (
    <div className="space-y-6">
      <DateRangeFilter onLoad={onLoad} loading={loading} />

      {loading && <Spinner />}
      {error   && <ErrorBanner message={error} onRetry={() => onLoad({})} />}

      {data && !loading && (
        <>
          {/* Top metrics */}
          {fs && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '💰', label: 'Total Revenue',     value: formatCurrency(fs.total_revenue) },
                { icon: '📅', label: 'Avg Daily Revenue', value: formatCurrency(fs.avg_daily_revenue) },
                { icon: '🔝', label: 'Best Day',
                  value: fs.highest_revenue_day
                    ? `${formatCurrency(fs.highest_revenue_day.amount)} (${formatDate(fs.highest_revenue_day.date)})`
                    : '—' },
                { icon: '📉', label: 'Lowest Day',
                  value: fs.lowest_revenue_day
                    ? `${formatCurrency(fs.lowest_revenue_day.amount)} (${formatDate(fs.lowest_revenue_day.date)})`
                    : '—' },
              ].map((k) => (
                <KPICard key={k.label} {...k} />
              ))}
            </div>
          )}

          {/* Monthly breakdown */}
          {data.monthly_breakdown?.length > 0 && (
            <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="px-5 pt-4 pb-2">
                <SectionHeading>Monthly Breakdown</SectionHeading>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-dm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['Month','Total Revenue','Avg Daily','Days'].map((h) => (
                        <th key={h} className="px-5 py-2.5 text-left text-white/25 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.monthly_breakdown.map((row) => (
                      <tr key={row.month} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="px-5 py-2.5 text-white/70">{row.month}</td>
                        <td className="px-5 py-2.5 text-white font-semibold">{formatCurrency(row.total_revenue)}</td>
                        <td className="px-5 py-2.5 text-white/60">{formatCurrency(row.avg_daily_revenue)}</td>
                        <td className="px-5 py-2.5 text-white/40">{row.days}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Daily revenue bar chart */}
          {data.daily_revenue?.length > 0 && (
            <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-2xl p-5">
              <SectionHeading>Daily Revenue</SectionHeading>
              <div className="flex items-end gap-1 h-20 overflow-x-auto">
                {(() => {
                  const max = Math.max(...data.daily_revenue.map((d) => d.revenue), 1);
                  return data.daily_revenue.map((d, i) => (
                    <div key={i} className="group relative flex-shrink-0"
                      style={{ width: `${Math.max(6, Math.floor(320 / data.daily_revenue.length))}px` }}>
                      <div
                        className="bg-blue-500/60 hover:bg-blue-400 rounded-t transition-colors"
                        style={{ height: `${Math.max(4, (d.revenue / max) * 72)}px` }}
                        title={`${formatDate(d.date)}: ${formatCurrency(d.revenue)}`}
                      />
                    </div>
                  ));
                })()}
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-white/20 font-dm">
                <span>{formatDate(data.daily_revenue[0]?.date)}</span>
                <span>{formatDate(data.daily_revenue[data.daily_revenue.length - 1]?.date)}</span>
              </div>
            </div>
          )}
        </>
      )}

      {!data && !loading && !error && (
        <EmptyState label="Select a date range and click Generate." />
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  Tab config
// ══════════════════════════════════════════════════════════════════════════════

const TABS = [
  { id: 'weekly',      label: 'Weekly',      icon: '📆' },
  { id: 'monthly',     label: 'Monthly',     icon: '🗓' },
  { id: 'instructors', label: 'Instructors', icon: '👨‍🏫' },
  { id: 'students',    label: 'Students',    icon: '🎓' },
  { id: 'financial',   label: 'Financial',   icon: '💰' },
];

// ══════════════════════════════════════════════════════════════════════════════
//  Main Page  —  ALL hooks at the top, early returns AFTER
// ══════════════════════════════════════════════════════════════════════════════

const ReportsPage = () => {
  // ── 1. Hooks — unconditional, always in the same order ───────────────────────

  const { data: schools, loading: schoolsLoading } = useSchools();
  const [schoolId, setSchoolId] = useState(null);

  // Derive schoolId as soon as schools arrive
  useEffect(() => {
    if (schools && schools.length > 0 && !schoolId) {
      setSchoolId(schools[0]?.id ?? null);
    }
  }, [schools, schoolId]);

  // useReports is ALWAYS called — pass null until schoolId is ready;
  // the hook handles null internally (all fetch actions are no-ops when schoolId is null)
  const reports = useReports(schoolId);

  const {
    weekly, monthly, instructors, students, financial,
    emailStatus, exportStatus,
    activeTab, setActiveTab,
    loadWeekly, loadMonthly,
    loadInstructorPerformance, loadStudentProgress, loadFinancialSummary,
    sendWeeklyEmail, triggerExport,
    resetEmailStatus,
  } = reports;

  // Auto-dismiss email feedback after 5 s — must live here, not after an early return
  useEffect(() => {
    if (emailStatus?.result) {
      const t = setTimeout(resetEmailStatus, 5000);
      return () => clearTimeout(t);
    }
  }, [emailStatus?.result, resetEmailStatus]);

  // ── 2. Early returns — only AFTER every hook has been called ─────────────────

  if (schoolsLoading) {
    return (
      <div className="flex-1 min-h-screen bg-[#080E1C] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!schools || schools.length === 0) {
    return (
      <div className="flex-1 min-h-screen bg-[#080E1C] flex items-center justify-center">
        <EmptyState label="No schools found. Please contact support." />
      </div>
    );
  }

  if (!schoolId) {
    return (
      <div className="flex-1 min-h-screen bg-[#080E1C] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // ── 3. Normal render ─────────────────────────────────────────────────────────
 
  return (
    <div className="flex min-h-screen bg-[#07101F] text-white font-dm">
      <Sidebar />
  
      {/* Everything to the right of the sidebar */}
      <div className="flex-1 overflow-auto">
  
        {/* Page header */}
        <div className="border-b border-white/[0.06] px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-sora text-xl font-bold text-white">Reports</h1>
              <p className="text-xs text-white/30 font-dm mt-0.5">
                Generate, analyse and export school performance reports
              </p>
            </div>
            <div className="text-xs text-white/30 font-dm">
              School: <span className="text-white/50">{schools[0]?.name}</span>
            </div>
          </div>
  
          {/* Tab bar */}
          <div className="flex gap-1.5 mt-5 overflow-x-auto">
            {TABS.map((t) => (
              <Tab
                key={t.id}
                id={t.id}
                label={t.label}
                icon={t.icon}
                active={activeTab === t.id}
                onClick={setActiveTab}
              />
            ))}
          </div>
        </div>
  
        {/* Panel content — inside flex-1, not outside it */}
        <div className="px-8 py-6 max-w-7xl">
          {activeTab === 'weekly' && (
            <WeeklyPanel
              state={weekly}
              onLoad={loadWeekly}
              onSendEmail={sendWeeklyEmail}
              emailStatus={emailStatus}
              onExport={triggerExport}
              exportStatus={exportStatus}
            />
          )}
          {activeTab === 'monthly' && (
            <MonthlyPanel
              state={monthly}
              onLoad={loadMonthly}
              onExport={triggerExport}
              exportStatus={exportStatus}
            />
          )}
          {activeTab === 'instructors' && (
            <InstructorPanel
              state={instructors}
              onLoad={loadInstructorPerformance}
            />
          )}
          {activeTab === 'students' && (
            <StudentPanel
              state={students}
              onLoad={loadStudentProgress}
            />
          )}
          {activeTab === 'financial' && (
            <FinancialPanel
              state={financial}
              onLoad={loadFinancialSummary}
            />
          )}
        </div>
  
      </div>{/* end flex-1 */}
    </div>
  );
};

export default ReportsPage;