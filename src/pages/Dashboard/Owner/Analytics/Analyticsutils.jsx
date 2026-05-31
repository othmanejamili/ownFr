// ─────────────────────────────────────────────
//  analyticsUtils.js
// ─────────────────────────────────────────────

export const fmt = {
  pct:    (v) => `${Number(v ?? 0).toFixed(1)}%`,
  num:    (v) => Number(v ?? 0).toLocaleString(),
  money:  (v) => `$${Number(v ?? 0).toLocaleString("en", { minimumFractionDigits: 0 })}`,
  rating: (v) => Number(v ?? 0).toFixed(1),
  delta:  (v) => (v > 0 ? `+${v}` : `${v}`),
  date:   (s) => new Date(s).toLocaleDateString("en", { month: "short", day: "numeric" }),
};

export const severityColor = {
  high:   { bg: "bg-red-500/10",   border: "border-red-500/20",   text: "text-red-400",   dot: "bg-red-500",   ring: "ring-red-500/30"   },
  medium: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", dot: "bg-amber-500", ring: "ring-amber-500/30" },
  low:    { bg: "bg-blue-500/10",  border: "border-blue-500/20",  text: "text-blue-400",  dot: "bg-blue-400",  ring: "ring-blue-500/30"  },
};

export const trendDir = (dir) => {
  if (dir === "up")   return { icon: "↑", cls: "text-emerald-400" };
  if (dir === "down") return { icon: "↓", cls: "text-red-400"     };
  return                     { icon: "→", cls: "text-white/25"    };
};

export const healthColor = {
  healthy:         { cls: "text-emerald-400", bg: "bg-emerald-500/10", bar: "#10b981", label: "Healthy"         },
  needs_attention: { cls: "text-amber-400",   bg: "bg-amber-500/10",   bar: "#f59e0b", label: "Needs Attention" },
  critical:        { cls: "text-red-400",     bg: "bg-red-500/10",     bar: "#ef4444", label: "Critical"        },
};

export const CHART_COLORS = {
  primary: "#3b82f6",
  emerald: "#10b981",
  violet:  "#8b5cf6",
  amber:   "#f59e0b",
  red:     "#ef4444",
  cyan:    "#06b6d4",
};

// ── Seed deterministic-ish data ───────────────────────────────
const days = (n) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
  });

const sine = (i, base, amp, noise = 30) =>
  Math.round(base + Math.sin(i / 4) * amp + (Math.random() - 0.5) * noise);

const D30 = days(30);

export const MOCK_DASHBOARD = {
  school: { id: 1, name: "Auto École Atlas", email: "atlas@example.com" },
  period: { range: "month", start_date: D30[0], end_date: D30[29] },
  current_metrics: {
    total_students: 142, active_students: 97, completed_students: 31,
    total_instructors: 6, completion_rate: 68.4,
    average_rating: 4.3, instructor_utilization: 82.1,
  },
  lessons: { total: 312, completed: 247, scheduled: 45, completion_rate: 79.2 },
  revenue: {
    total: 28450,
    trend: D30.map((date, i) => ({ date, revenue: sine(i, 950, 220, 80) })),
  },
  students: {
    trend: D30.map((date, i) => ({ date, active_students: 80 + Math.round(i * 0.55), new_students: Math.round(Math.random() * 3) })),
    top_performers: [
      { id: 1, name: "Youssef Amrani",   completion_percentage: 94, total_hours: 38 },
      { id: 2, name: "Sara Benali",      completion_percentage: 88, total_hours: 34 },
      { id: 3, name: "Khalid Mansouri",  completion_percentage: 81, total_hours: 29 },
      { id: 4, name: "Nadia El Fassi",   completion_percentage: 76, total_hours: 27 },
      { id: 5, name: "Omar Kettani",     completion_percentage: 71, total_hours: 24 },
    ],
  },
  instructors: [
    { id: 1, name: "Hassan Benchekroun", lessons_taught: 68, average_rating: 4.6 },
    { id: 2, name: "Karim Moussaoui",    lessons_taught: 54, average_rating: 4.2 },
    { id: 3, name: "Nadia Filali",       lessons_taught: 71, average_rating: 4.7 },
    { id: 4, name: "Youssef Alami",      lessons_taught: 39, average_rating: 3.9 },
  ],
  recent_feedback: [
    { id: 1, student: "Sara Benali",   lesson: "City Driving",    rating: 5, comment: "Excellent session — Nadia was incredibly patient." },
    { id: 2, student: "Omar Kettani",  lesson: "Traffic Laws",    rating: 4, comment: "Very informative, easy to follow." },
    { id: 3, student: "Aicha Rhazali", lesson: "Highway Driving", rating: 5, comment: "Loved every minute of it." },
  ],
};

export const MOCK_ALERTS = {
  school: { id: 1, name: "Auto École Atlas" },
  period: { start_date: days(7)[0], end_date: days(7)[6], days: 7 },
  overall_health: { score: 74, status: "needs_attention", alerts_count: 3 },
  alerts_by_severity: {
    high: [
      { code: "AT_RISK_STUDENTS", title: "Students at Risk",
        message: "4 students have less than 20% progress in both theory and driving.",
        suggestion: "Identify and provide additional support to at-risk students." },
    ],
    medium: [
      { code: "LOW_INSTRUCTOR_UTILIZATION", title: "Low Instructor Utilization",
        message: "Instructor utilization is 61%, below optimal levels.",
        suggestion: "Consider optimizing instructor schedules or offering more lessons." },
      { code: "LOW_LESSON_COMPLETION", title: "Low Lesson Completion Rate",
        message: "Only 68.2% of lessons were completed this week.",
        suggestion: "Review lesson scheduling and attendance policies." },
    ],
    low: [],
  },
  all_alerts: [],
  summary: { total_alerts: 3, needs_immediate_attention: 1, should_be_addressed: 2, for_information: 0 },
};

export const MOCK_PREDICTIONS = {
  school: { id: 1, name: "Auto École Atlas" },
  prediction_horizon: { period: "month", days_ahead: 30, prediction_date: days(1)[0] },
  historical_data: { days_analyzed: 30, data_quality_score: 0.81 },
  current_metrics: { total_students: 142, active_students: 97, revenue: 28450, completion_rate: 68.4 },
  predicted_metrics: {
    values: { total_students: 158, active_students: 109, revenue: 31200, completion_rate: 72.1 },
    confidence: "81%",
    trend_directions: { student_trend: "up", revenue_trend: "up", completion_trend: "up" },
  },
  trend_analysis: { student_growth_per_day: 0.53, revenue_growth_per_day: 92.0, completion_change_per_day: 0.12 },
  recommendations: [
    { type: "enrollment", priority: "medium", title: "Leverage Growing Momentum", action: "Expand marketing to convert inquiries faster." },
    { type: "retention",  priority: "low",    title: "Maintain Completion Rate",  action: "Keep at-risk student support programs active." },
  ],
  notes: ["Predictions based on linear trend analysis.", "Confidence: 81%."],
};

export const MOCK_SUMMARY = {
  user_role: "school_owner",
  overall_stats: {
    total_schools: 2, total_students: 267, total_active_students: 184,
    average_completion_rate: 71.2, total_revenue: 54300, total_new_students: 14,
  },
  school_summaries: [
    { school_id: 1, school_name: "Auto École Atlas",  total_students: 142, active_students: 97,  completion_rate: 68.4, revenue: 28450, new_students: 8 },
    { school_id: 2, school_name: "Auto École Sahara", total_students: 125, active_students: 87,  completion_rate: 74.1, revenue: 25850, new_students: 6 },
  ],
  best_performing_school:   { school_id: 2, school_name: "Auto École Sahara", completion_rate: 74.1 },
  highest_revenue_school:   { school_id: 1, school_name: "Auto École Atlas",  revenue: 28450 },
};

export const MOCK_TRENDS = {
  metric: "students",
  period: { start_date: D30[0], end_date: D30[29], days: 30 },
  summary: { current_total: 142, current_active: 97, total_new_students: 22, average_active: 88.3 },
  trend_data: D30.map((date, i) => ({
    date,
    total_students: 120 + Math.round(i * 0.72),
    active_students: 80 + Math.round(i * 0.55),
    new_students: Math.round(Math.random() * 3),
  })),
  data_points: 30,
};

export const MOCK_HEALTH = {
  system_health: { status: "healthy", timestamp: new Date().toISOString(), checks_performed: 5, unhealthy_checks: 0, warning_checks: 1 },
  detailed_checks: {
    database:      { status: "healthy",  message: "Database connection successful" },
    cache:         { status: "healthy",  message: "Cache system working" },
    data_coverage: { status: "warning",  message: "Analytics coverage: 73.4%", details: { total_schools: 15, schools_with_analytics: 11, coverage_percentage: 73.4 } },
    data_freshness:{ status: "healthy",  message: "Most recent analytics: today (0 days ago)" },
    performance:   { status: "healthy",  message: "Analytics queries in last hour: 24" },
  },
  recommendations: [
    { priority: "medium", action: "Run bulk analytics generation for schools missing data.", reason: "73.4% of schools have analytics data." },
  ],
  next_scheduled_maintenance: "Daily at 02:00 AM UTC",
};