// ─────────────────────────────────────────────
//  analyticsUtils.js  —  formatters + mock data
// ─────────────────────────────────────────────

export const fmt = {
    pct: (v) => `${Number(v ?? 0).toFixed(1)}%`,
    num: (v) => Number(v ?? 0).toLocaleString(),
    money: (v) => `$${Number(v ?? 0).toLocaleString('en', { minimumFractionDigits: 0 })}`,
    rating: (v) => Number(v ?? 0).toFixed(1),
    delta: (v) => (v > 0 ? `+${v}` : `${v}`),
  };
  
  export const severityColor = {
    high:   { bg: 'bg-red-500/10',    border: 'border-red-500/20',    text: 'text-red-400',    dot: 'bg-red-500' },
    medium: { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  text: 'text-amber-400',  dot: 'bg-amber-500' },
    low:    { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   text: 'text-blue-400',   dot: 'bg-blue-500' },
  };
  
  export const trendDir = (dir) => {
    if (dir === 'up')     return { icon: '↑', cls: 'text-emerald-400' };
    if (dir === 'down')   return { icon: '↓', cls: 'text-red-400' };
    return { icon: '→', cls: 'text-white/30' };
  };
  
  export const healthColor = {
    healthy:          { cls: 'text-emerald-400', bg: 'bg-emerald-500/10', bar: '#10b981' },
    needs_attention:  { cls: 'text-amber-400',   bg: 'bg-amber-500/10',   bar: '#f59e0b' },
    critical:         { cls: 'text-red-400',      bg: 'bg-red-500/10',     bar: '#ef4444' },
  };
  
  // ── Chart theme ───────────────────────────────────────────────
  export const CHART_COLORS = {
    primary:   '#3b82f6',
    emerald:   '#10b981',
    violet:    '#8b5cf6',
    amber:     '#f59e0b',
    red:       '#ef4444',
    grid:      'rgba(255,255,255,0.04)',
    tick:      'rgba(255,255,255,0.2)',
  };
  
  // ── Mock data (used as fallback / dev) ────────────────────────
  const days30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 29 + i);
    return d.toISOString().slice(0, 10);
  });
  
  export const MOCK_DASHBOARD = {
    school: { id: 1, name: 'Auto École Atlas', email: 'atlas@example.com' },
    period: { range: 'month', start_date: days30[0], end_date: days30[29] },
    current_metrics: {
      total_students: 142,
      active_students: 97,
      completed_students: 31,
      total_instructors: 6,
      completion_rate: 68.4,
      average_rating: 4.3,
      instructor_utilization: 82.1,
    },
    lessons: { total: 312, completed: 247, scheduled: 45, completion_rate: 79.2 },
    revenue: {
      total: 28450,
      trend: days30.map((date, i) => ({
        date,
        revenue: 600 + Math.round(Math.sin(i / 3) * 200 + Math.random() * 150),
      })),
    },
    students: {
      trend: days30.map((date, i) => ({
        date,
        active_students: 80 + Math.round(i * 0.6 + Math.random() * 4),
        new_students: Math.round(Math.random() * 3),
      })),
      top_performers: [
        { id: 1, name: 'Youssef Amrani',   completion_percentage: 94, total_hours: 38 },
        { id: 2, name: 'Sara Benali',      completion_percentage: 88, total_hours: 34 },
        { id: 3, name: 'Khalid Mansouri',  completion_percentage: 81, total_hours: 29 },
        { id: 4, name: 'Nadia El Fassi',   completion_percentage: 76, total_hours: 27 },
        { id: 5, name: 'Omar Kettani',     completion_percentage: 71, total_hours: 24 },
      ],
    },
    instructors: [
      { id: 1, name: 'Hassan Benchekroun', lessons_taught: 68, average_rating: 4.6 },
      { id: 2, name: 'Karim Moussaoui',   lessons_taught: 54, average_rating: 4.2 },
      { id: 3, name: 'Nadia Filali',       lessons_taught: 71, average_rating: 4.7 },
      { id: 4, name: 'Youssef Alami',      lessons_taught: 39, average_rating: 3.9 },
    ],
    recent_feedback: [
      { id: 1, student: 'Sara Benali',    lesson: 'City Driving',     rating: 5, comment: 'Excellent session!' },
      { id: 2, student: 'Omar Kettani',   lesson: 'Traffic Laws',     rating: 4, comment: 'Very informative.' },
      { id: 3, student: 'Aicha Rhazali', lesson: 'Highway Driving',  rating: 5, comment: 'Loved it.' },
    ],
  };
  
  export const MOCK_ALERTS = {
    school: { id: 1, name: 'Auto École Atlas' },
    overall_health: { score: 74, status: 'needs_attention', alerts_count: 3 },
    alerts_by_severity: {
      high: [
        { code: 'AT_RISK_STUDENTS', title: 'Students at Risk', message: '4 students have less than 20% progress', suggestion: 'Provide additional support.' },
      ],
      medium: [
        { code: 'LOW_INSTRUCTOR_UTILIZATION', title: 'Low Instructor Utilization', message: 'Instructor utilization at 61%', suggestion: 'Optimize instructor schedules.' },
        { code: 'LOW_LESSON_COMPLETION', title: 'Low Lesson Completion Rate', message: 'Only 68% of lessons were completed', suggestion: 'Review attendance policies.' },
      ],
      low: [],
    },
    all_alerts: [],
    summary: { total_alerts: 3, needs_immediate_attention: 1, should_be_addressed: 2, for_information: 0 },
  };
  
  export const MOCK_PREDICTIONS = {
    prediction_horizon: { period: 'month', days_ahead: 30 },
    current_metrics: { total_students: 142, active_students: 97, revenue: 28450, completion_rate: 68.4 },
    predicted_metrics: {
      values: { total_students: 158, active_students: 109, revenue: 31200, completion_rate: 72.1 },
      confidence: '81%',
      trend_directions: { student_trend: 'up', revenue_trend: 'up', completion_trend: 'up' },
    },
    recommendations: [
      { type: 'enrollment', priority: 'medium', title: 'Leverage growing momentum', action: 'Expand marketing to convert inquiries faster.' },
      { type: 'retention',  priority: 'low',    title: 'Maintain completion rate', action: 'Keep at-risk student support active.' },
    ],
  };