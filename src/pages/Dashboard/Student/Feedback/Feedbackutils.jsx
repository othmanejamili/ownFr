// src/utils/FeedbackUtils.jsx

// ── Rating label & color maps ──────────────────────────────────
export const RATING_LABELS = {
    1: 'Very Poor',
    2: 'Poor',
    3: 'Average',
    4: 'Good',
    5: 'Excellent',
  };
  
  export const RATING_COLORS = {
    1: { bg: 'bg-red-100',    text: 'text-red-700',    bar: 'bg-red-500'    },
    2: { bg: 'bg-orange-100', text: 'text-orange-700', bar: 'bg-orange-500' },
    3: { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-500' },
    4: { bg: 'bg-blue-100',   text: 'text-blue-700',   bar: 'bg-blue-500'   },
    5: { bg: 'bg-emerald-100',text: 'text-emerald-700',bar: 'bg-emerald-500'},
  };
  
  export const STAR_COLOR = {
    1: 'text-red-400',
    2: 'text-orange-400',
    3: 'text-yellow-400',
    4: 'text-blue-400',
    5: 'text-emerald-400',
  };
  
  // ── Format date helpers ────────────────────────────────────────
  export const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year:  'numeric',
      month: 'short',
      day:   'numeric',
    });
  };
  
  export const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
      year:   'numeric',
      month:  'short',
      day:    'numeric',
      hour:   '2-digit',
      minute: '2-digit',
    });
  };
  
  export const timeAgo = (dateStr) => {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  < 60)  return `${mins}m ago`;
    if (hours < 24)  return `${hours}h ago`;
    if (days  < 30)  return `${days}d ago`;
    return formatDate(dateStr);
  };
  
  // ── Compute stats from a feedback array ───────────────────────
  export const computeStats = (feedbackList = []) => {
    if (!feedbackList.length)
      return { avg: 0, total: 0, distribution: [], trend: null };
  
    const total = feedbackList.length;
    const sum   = feedbackList.reduce((s, f) => s + (f.rating || 0), 0);
    const avg   = sum / total;
  
    const dist  = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbackList.forEach(({ rating }) => { if (dist[rating] !== undefined) dist[rating]++; });
  
    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: dist[star],
      percentage: Math.round((dist[star] / total) * 100),
    }));
  
    return { avg: Math.round(avg * 10) / 10, total, distribution };
  };
  
  // ── Search / filter helpers ────────────────────────────────────
  export const filterFeedback = (list = [], { search = '', rating = '', sortBy = '-created_at' }) => {
    let result = [...list];
  
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.student_name?.toLowerCase().includes(q) ||
          f.lesson_name?.toLowerCase().includes(q)  ||
          f.instructor_name?.toLowerCase().includes(q) ||
          f.comment?.toLowerCase().includes(q)
      );
    }
  
    if (rating) {
      result = result.filter((f) => String(f.rating) === String(rating));
    }
  
    const [dir, field] = sortBy.startsWith('-')
      ? [-1, sortBy.slice(1)]
      : [1, sortBy];
  
    result.sort((a, b) => {
      const va = a[field] ?? '';
      const vb = b[field] ?? '';
      if (va < vb) return -1 * dir;
      if (va > vb) return  1 * dir;
      return 0;
    });
  
    return result;
  };
  
  // ── Render star string ─────────────────────────────────────────
  export const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);
  
  // ── Sentiment badge ────────────────────────────────────────────
  export const sentimentBadge = (rating) => {
    if (rating >= 4) return { label: 'Positive', cls: 'bg-emerald-100 text-emerald-700' };
    if (rating === 3) return { label: 'Neutral',  cls: 'bg-yellow-100 text-yellow-700' };
    return             { label: 'Negative', cls: 'bg-red-100 text-red-700' };
  };
  
  // ── Truncate long comment ──────────────────────────────────────
  export const truncate = (str = '', max = 120) =>
    str.length > max ? str.slice(0, max).trimEnd() + '…' : str;