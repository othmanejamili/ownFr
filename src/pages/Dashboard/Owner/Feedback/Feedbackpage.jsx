// src/pages/owner/FeedbackPage.jsx
import { useState } from 'react';
import { useFeedback } from './Usefeedback';
import Sidebar from '../Sidebar';
import {
  RATING_COLORS,
  STAR_COLOR,
  formatDate,
  timeAgo,
  renderStars,
  sentimentBadge,
  truncate,
} from './Feedbackutils';

// ── tiny reusable primitives ───────────────────────────────────
const Spinner = () => (
  <div className="flex items-center justify-center py-24">
    <div className="w-10 h-10 rounded-full border-4 border-white/10 border-t-blue-500 animate-spin" />
  </div>
);

const Badge = ({ cls, children }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
    {children}
  </span>
);

// ── Star display ───────────────────────────────────────────────
const Stars = ({ rating, size = 'sm' }) => {
  const sz = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm';
  const colorMap = {
    5: 'text-emerald-400',
    4: 'text-blue-400',
    3: 'text-yellow-400',
    2: 'text-orange-400',
    1: 'text-red-400',
  };
  return (
    <span className={`${sz} ${colorMap[rating] || 'text-white/20'} tracking-tight`}>
      {'★'.repeat(rating)}
      <span className="opacity-20">{'★'.repeat(5 - rating)}</span>
    </span>
  );
};

// ── Summary stat card ──────────────────────────────────────────
const StatCard = ({ label, value, sub, accent }) => (
  <div className="bg-[#0B1221] rounded-2xl p-5 border border-white/[0.06] flex flex-col gap-1">
    <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest">{label}</p>
    <p className={`text-3xl font-bold ${accent || 'text-white'}`}>{value}</p>
    {sub && <p className="text-xs text-white/30">{sub}</p>}
  </div>
);

// ── Rating distribution bar ────────────────────────────────────
const DistributionBar = ({ distribution = [] }) => {
  const barColors = {
    5: 'bg-emerald-500',
    4: 'bg-blue-500',
    3: 'bg-yellow-500',
    2: 'bg-orange-500',
    1: 'bg-red-500',
  };
  const textColors = {
    5: 'text-emerald-400',
    4: 'text-blue-400',
    3: 'text-yellow-400',
    2: 'text-orange-400',
    1: 'text-red-400',
  };
  return (
    <div className="bg-[#0B1221] rounded-2xl border border-white/[0.06] p-5">
      <h3 className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-4">
        Rating Distribution
      </h3>
      <div className="space-y-2.5">
        {distribution.map(({ star, count, percentage }) => (
          <div key={star} className="flex items-center gap-3">
            <span className={`text-sm font-bold w-5 text-right ${textColors[star]}`}>{star}</span>
            <span className="text-white/20 text-xs">★</span>
            <div className="flex-1 bg-white/[0.05] rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-700 ${barColors[star]}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs text-white/30 w-8 text-right">{count}</span>
            <span className="text-xs text-white/20 w-9 text-right">{percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Delete confirmation modal ──────────────────────────────────
const DeleteModal = ({ feedback, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-[#0B1221] rounded-2xl shadow-2xl p-7 max-w-md w-full mx-4 border border-white/[0.08]">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-white mb-1">Delete Feedback</h3>
          <p className="text-sm text-white/40">
            Remove feedback from{' '}
            <span className="font-medium text-white/70">{feedback?.student_name}</span> for{' '}
            <span className="font-medium text-white/70">{feedback?.lesson_name}</span>? This cannot be undone.
          </p>
        </div>
      </div>
      <div className="flex gap-3 mt-6 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-white/50 bg-white/[0.05] border border-white/[0.08] rounded-xl hover:bg-white/[0.08] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-red-500/80 border border-red-500/30 rounded-xl hover:bg-red-500 disabled:opacity-60 transition-colors flex items-center gap-2"
        >
          {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ── Feedback detail drawer ─────────────────────────────────────
const FeedbackDrawer = ({ feedback, onClose, onDelete }) => {
  if (!feedback) return null;
  const sentiment = sentimentBadge(feedback.rating);
  const ratingLabel = ['', 'Very Poor', 'Poor', 'Average', 'Good', 'Excellent'][feedback.rating];
  const textColors = {
    5: 'text-emerald-400',
    4: 'text-blue-400',
    3: 'text-yellow-400',
    2: 'text-orange-400',
    1: 'text-red-400',
  };
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-[#0B1221] border-l border-white/[0.06] shadow-2xl flex flex-col overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">Feedback Detail</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* rating hero */}
          <div className="flex flex-col items-center py-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl gap-2">
            <Stars rating={feedback.rating} size="lg" />
            <p className={`text-sm font-semibold ${textColors[feedback.rating]}`}>{ratingLabel}</p>
            <Badge cls={sentiment.cls}>{sentiment.label}</Badge>
          </div>

          {/* meta info */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Student',    value: feedback.student_name    },
              { label: 'Instructor', value: feedback.instructor_name },
              { label: 'Lesson',     value: feedback.lesson_name     },
              { label: 'School',     value: feedback.school_name     },
              { label: 'Date',       value: formatDate(feedback.created_at) },
            ].map(({ label, value }) => (
              <div key={label} className="col-span-1">
                <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-sm font-medium text-white/70">{value || '—'}</p>
              </div>
            ))}
          </div>

          {/* comment */}
          {feedback.comment && (
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-wider mb-2">Comment</p>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-sm text-white/60 leading-relaxed italic">
                "{feedback.comment}"
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="px-6 py-4 border-t border-white/[0.06]">
          <button
            onClick={() => onDelete(feedback)}
            className="w-full py-2.5 text-sm font-medium text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-colors"
          >
            Delete this feedback
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Feedback table row ─────────────────────────────────────────
const FeedbackRow = ({ feedback, onView, onDelete }) => {
  const sentiment = sentimentBadge(feedback.rating);
  return (
    <tr className="group border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
      <td className="px-5 py-3.5">
        <div>
          <p className="text-sm font-medium text-white/80">{feedback.student_name}</p>
          <p className="text-xs text-white/30">{feedback.school_name}</p>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <p className="text-sm text-white/60 max-w-[160px] truncate" title={feedback.lesson_name}>
          {feedback.lesson_name || '—'}
        </p>
        <p className="text-xs text-white/30">{feedback.instructor_name}</p>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex flex-col gap-1">
          <Stars rating={feedback.rating} />
          <Badge cls={sentiment.cls}>{sentiment.label}</Badge>
        </div>
      </td>
      <td className="px-5 py-3.5 max-w-[200px]">
        <p className="text-sm text-white/50 line-clamp-2">
          {feedback.comment
            ? truncate(feedback.comment, 80)
            : <span className="italic text-white/20">No comment</span>}
        </p>
      </td>
      <td className="px-5 py-3.5 text-xs text-white/30 whitespace-nowrap">
        {timeAgo(feedback.created_at)}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onView(feedback)}
            className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-white/40 hover:text-white/70 transition-colors"
            title="View details"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(feedback)}
            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400/60 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
};

// ── Pagination controls ────────────────────────────────────────
const Pagination = ({ page, totalPages, totalFiltered, pageSize, onPage }) => {
  const from = Math.min((page - 1) * pageSize + 1, totalFiltered);
  const to   = Math.min(page * pageSize, totalFiltered);
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06] bg-[#0B1221] rounded-b-2xl">
      <p className="text-xs text-white/25">
        Showing <span className="font-medium text-white/50">{from}–{to}</span> of{' '}
        <span className="font-medium text-white/50">{totalFiltered}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg text-white/30 hover:bg-white/[0.06] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
            acc.push(p);
            return acc;
          }, [])
          .map((item, i) =>
            item === '…' ? (
              <span key={`e${i}`} className="px-1 text-white/20 text-xs">…</span>
            ) : (
              <button
                key={item}
                onClick={() => onPage(item)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                  item === page
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'text-white/40 hover:bg-white/[0.06] hover:text-white/70'
                }`}
              >
                {item}
              </button>
            )
          )}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg text-white/30 hover:bg-white/[0.06] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// ── Main page ──────────────────────────────────────────────────
export default function FeedbackPage() {
  const {
    list, rawList, stats, loading, error, deleting,
    search, setSearch,
    rating, setRating,
    sortBy, setSortBy,
    page, setPage, totalPages, PAGE_SIZE, totalFiltered,
    reload, handleDelete,
  } = useFeedback();

  const [viewFeedback,  setViewFeedback]  = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteError,   setDeleteError]   = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const openDelete = (fb) => {
    setConfirmDelete(fb);
    setDeleteError(null);
  };

  const doDelete = async () => {
    const result = await handleDelete(confirmDelete.id);
    if (result.success) {
      setConfirmDelete(null);
      setViewFeedback(null);
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
    } else {
      setDeleteError(result.message);
    }
  };

  const avgColor =
    stats.avg >= 4 ? 'text-emerald-400' :
    stats.avg >= 3 ? 'text-yellow-400'  :
    stats.avg >  0 ? 'text-red-400'     : 'text-white/30';

  return (
    <div className="flex h-screen bg-[#060B18] overflow-hidden font-dm">
      <Sidebar />

      {/* ── Scrollable main area ─────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">

        {/* ── Page header ───────────────────────────────────────── */}
        <div className="px-6 pt-8 pb-4 max-w-7xl w-full mx-auto">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Feedback</h1>
              <p className="text-sm text-white/30 mt-0.5">
                Student reviews across all your school's lessons
              </p>
            </div>
            <button
              onClick={reload}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white/50 bg-white/[0.04] border border-white/[0.08] rounded-xl hover:bg-white/[0.07] hover:text-white/70 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        <div className="px-6 pb-10 max-w-7xl w-full mx-auto space-y-4">

          {/* ── Toast notifications ─────────────────────────────── */}
          {deleteSuccess && (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Feedback deleted successfully.
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* ── Stat cards ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Total Reviews"
              value={stats.total}
              sub={`${rawList.filter(f => f.comment).length} with comments`}
            />
            <StatCard
              label="Average Rating"
              value={stats.avg || '—'}
              sub="Out of 5.0"
              accent={avgColor}
            />
            <StatCard
              label="5-Star Reviews"
              value={stats.distribution.find(d => d.star === 5)?.count ?? 0}
              sub={`${stats.distribution.find(d => d.star === 5)?.percentage ?? 0}% of total`}
              accent="text-emerald-400"
            />
            <StatCard
              label="Low Ratings"
              value={(stats.distribution.find(d => d.star === 1)?.count ?? 0) + (stats.distribution.find(d => d.star === 2)?.count ?? 0)}
              sub="1–2 star reviews"
              accent="text-red-400"
            />
          </div>

          {/* ── Distribution + filters row ──────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <DistributionBar distribution={stats.distribution} />
            </div>

            {/* Filters */}
            <div className="lg:col-span-2 bg-[#0B1221] rounded-2xl border border-white/[0.06] p-5 flex flex-col justify-between gap-4">
              <h3 className="text-[10px] font-bold text-white/25 uppercase tracking-widest">
                Filter & Search
              </h3>
              <div className="flex flex-col gap-3">
                {/* Search */}
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by student, lesson, instructor or comment…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-white/[0.08] rounded-xl bg-white/[0.04] text-white/70 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all"
                  />
                </div>

                <div className="flex gap-3 flex-wrap">
                  {/* Rating filter */}
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="flex-1 min-w-[130px] px-3 py-2.5 text-sm border border-white/[0.08] rounded-xl bg-[#0F1A2E] text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all"
                  >
                    <option value="">All ratings</option>
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{'★'.repeat(r)} {r} star{r > 1 ? 's' : ''}</option>
                    ))}
                  </select>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 min-w-[150px] px-3 py-2.5 text-sm border border-white/[0.08] rounded-xl bg-[#0F1A2E] text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all"
                  >
                    <option value="-created_at">Newest first</option>
                    <option value="created_at">Oldest first</option>
                    <option value="-rating">Highest rating</option>
                    <option value="rating">Lowest rating</option>
                  </select>

                  {/* Clear */}
                  {(search || rating || sortBy !== '-created_at') && (
                    <button
                      onClick={() => { setSearch(''); setRating(''); setSortBy('-created_at'); }}
                      className="px-4 py-2.5 text-sm text-white/40 border border-white/[0.08] rounded-xl hover:bg-white/[0.05] hover:text-white/60 transition-colors whitespace-nowrap"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Table ───────────────────────────────────────────── */}
          <div className="bg-[#0B1221] rounded-2xl border border-white/[0.06] overflow-hidden">
            {loading ? (
              <Spinner />
            ) : list.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/20 gap-3">
                <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm font-medium">
                  {rawList.length === 0 ? 'No feedback yet' : 'No results match your filters'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                        {['Student', 'Lesson / Instructor', 'Rating', 'Comment', 'Date', ''].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-white/25 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((fb) => (
                        <FeedbackRow
                          key={fb.id}
                          feedback={fb}
                          onView={setViewFeedback}
                          onDelete={openDelete}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    totalFiltered={totalFiltered}
                    pageSize={PAGE_SIZE}
                    onPage={setPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Side drawer ─────────────────────────────────────────── */}
      {viewFeedback && (
        <FeedbackDrawer
          feedback={viewFeedback}
          onClose={() => setViewFeedback(null)}
          onDelete={(fb) => { setViewFeedback(null); openDelete(fb); }}
        />
      )}

      {/* ── Delete modal ────────────────────────────────────────── */}
      {confirmDelete && (
        <DeleteModal
          feedback={confirmDelete}
          onConfirm={doDelete}
          onCancel={() => { setConfirmDelete(null); setDeleteError(null); }}
          loading={deleting === confirmDelete.id}
        />
      )}

      {/* inline delete error toast */}
      {deleteError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500/90 text-white text-sm px-5 py-3 rounded-xl shadow-lg shadow-red-500/20 z-50 border border-red-400/30">
          {deleteError}
        </div>
      )}
    </div>
  );
}