// src/utils/reportUtils.js

// ─── Number / Currency Formatters ─────────────────────────────────────────────

/**
 * Format a number as currency (MAD by default)
 */
export const formatCurrency = (value, currency = 'MAD', locale = 'fr-MA') => {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  /**
   * Format a decimal as a percentage string: 87.5 → "87.5%"
   */
  export const formatPercent = (value, decimals = 1) => {
    if (value === null || value === undefined) return '—';
    return `${Number(value).toFixed(decimals)}%`;
  };
  
  /**
   * Round to N decimal places
   */
  export const round = (value, decimals = 2) =>
    value !== null && value !== undefined
      ? Math.round(value * 10 ** decimals) / 10 ** decimals
      : null;
  
  // ─── Date Formatters ──────────────────────────────────────────────────────────
  
  /**
   * "2024-12-01" → "Dec 1, 2024"
   */
  export const formatDate = (dateStr, locale = 'en-GB') => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  /**
   * Build YYYY-MM-DD string from a Date object
   */
  export const toISODate = (date) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().split('T')[0];
  };
  
  /**
   * Return the Monday of the current week as YYYY-MM-DD
   */
  export const currentWeekMonday = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return toISODate(new Date(now.setDate(diff)));
  };
  
  /**
   * Return the last day of the given month as YYYY-MM-DD
   * month: 1-based
   */
  export const lastDayOfMonth = (year, month) => {
    return toISODate(new Date(year, month, 0)); // day 0 = last day of prev month
  };
  
  // ─── Trend helpers ────────────────────────────────────────────────────────────
  
  /**
   * Map a trend string ('up' | 'down' | 'stable') to a Tailwind colour class
   */
  export const trendColor = (trend) => {
    const map = {
      up:     'text-emerald-400',
      down:   'text-red-400',
      stable: 'text-white/40',
    };
    return map[trend] ?? 'text-white/40';
  };
  
  /**
   * Map a trend string to an arrow character
   */
  export const trendArrow = (trend) => {
    const map = { up: '↑', down: '↓', stable: '→' };
    return map[trend] ?? '→';
  };
  
  /**
   * Map a change value (+/-) to a trend string
   */
  export const valueToTrend = (change) => {
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return 'stable';
  };
  
  // ─── Progress / Status helpers ────────────────────────────────────────────────
  
  /**
   * 0–100 progress → 'at_risk' | 'on_track' | 'excelling'
   */
  export const progressCategory = (avg) => {
    if (avg < 20) return 'at_risk';
    if (avg < 80) return 'on_track';
    return 'excelling';
  };
  
  export const progressCategoryLabel = (cat) => {
    const map = {
      at_risk:   'At Risk',
      on_track:  'On Track',
      excelling: 'Excelling',
    };
    return map[cat] ?? cat;
  };
  
  export const progressCategoryColor = (cat) => {
    const map = {
      at_risk:   'text-red-400 bg-red-500/10 border-red-500/20',
      on_track:  'text-amber-400 bg-amber-500/10 border-amber-500/20',
      excelling: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    };
    return map[cat] ?? '';
  };
  
  // ─── Rating helpers ───────────────────────────────────────────────────────────
  
  /**
   * Render N filled / empty star characters for a rating out of 5
   */
  export const starString = (rating, max = 5) => {
    const filled = Math.round(rating);
    return '★'.repeat(filled) + '☆'.repeat(max - filled);
  };
  
  /**
   * Rating (0-5) → colour class
   */
  export const ratingColor = (rating) => {
    if (rating >= 4)   return 'text-emerald-400';
    if (rating >= 2.5) return 'text-amber-400';
    return 'text-red-400';
  };
  
  // ─── Report-specific summary helpers ─────────────────────────────────────────
  
  /**
   * Build the KPI cards array from a weekly/monthly summary_metrics object
   */
  export const buildSummaryKPIs = (metrics = {}) => [
    {
      key:   'total_revenue',
      label: 'Total Revenue',
      value: formatCurrency(metrics.total_revenue),
      raw:   metrics.total_revenue,
      icon:  '💰',
    },
    {
      key:   'total_students',
      label: 'Total Students',
      value: metrics.total_students ?? '—',
      raw:   metrics.total_students,
      icon:  '🎓',
    },
    {
      key:   'avg_completion_rate',
      label: 'Completion Rate',
      value: formatPercent(metrics.avg_completion_rate),
      raw:   metrics.avg_completion_rate,
      icon:  '✅',
    },
    {
      key:   'avg_rating',
      label: 'Avg Rating',
      value: metrics.avg_rating ? `${metrics.avg_rating}/5` : '—',
      raw:   metrics.avg_rating,
      icon:  '⭐',
    },
    {
      key:   'total_new_students',
      label: 'New Students',
      value: metrics.total_new_students ?? '—',
      raw:   metrics.total_new_students,
      icon:  '➕',
    },
    {
      key:   'total_lessons',
      label: 'Lessons Done',
      value: metrics.total_lessons ?? '—',
      raw:   metrics.total_lessons,
      icon:  '📚',
    },
  ];
  
  // ─── Misc ─────────────────────────────────────────────────────────────────────
  
  /**
   * Capitalise first letter
   */
  export const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  
  /**
   * Truncate a string to N characters
   */
  export const truncate = (str, n = 30) =>
    str && str.length > n ? `${str.slice(0, n)}…` : str;
  
  /**
   * Get initials from a full name: "Karim Alaoui" → "KA"
   */
  export const initials = (name = '') =>
    name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('');
  
  /**
   * Safe division – returns 0 when denominator is 0
   */
  export const safeDivide = (num, den) => (den ? num / den : 0);