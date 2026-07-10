// src/pages/student/StudentFeedbackPage.jsx
import { useState, useRef, useEffect } from 'react';
import { useStudentFeedback } from './Usefeedback';
import Sidebar from '../Dashboard/Sidebar';
import { formatDate, timeAgo, sentimentBadge, computeStats } from './Feedbackutils';

// ── Primitives ────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex items-center justify-center py-24">
    <div className="w-10 h-10 rounded-full border-4 border-white/10 border-t-blue-500 animate-spin" />
  </div>
);

const StatCard = ({ label, value, sub, accent }) => (
  <div className="bg-[#0B1221] rounded-2xl p-5 border border-white/[0.06] flex flex-col gap-1">
    <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest">{label}</p>
    <p className={`text-3xl font-bold ${accent || 'text-white'}`}>{value}</p>
    {sub && <p className="text-xs text-white/30">{sub}</p>}
  </div>
);

// ── Star picker ───────────────────────────────────────────────
const StarPicker = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  const colorMap = {
    5: 'text-emerald-400', 4: 'text-blue-400',
    3: 'text-yellow-400',  2: 'text-orange-400', 1: 'text-red-400',
  };
  const active = hovered || value;
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={`text-2xl transition-colors ${
            star <= active
              ? (colorMap[active] || 'text-yellow-400')
              : 'text-white/20 hover:text-white/40'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

// ── Star display ──────────────────────────────────────────────
const Stars = ({ rating }) => {
  const colorMap = {
    5: 'text-emerald-400', 4: 'text-blue-400',
    3: 'text-yellow-400',  2: 'text-orange-400', 1: 'text-red-400',
  };
  return (
    <span className={`text-sm tracking-tight ${colorMap[rating] || 'text-white/20'}`}>
      {'★'.repeat(rating)}
      <span className="opacity-20">{'★'.repeat(5 - rating)}</span>
    </span>
  );
};

// ── Feedback form ─────────────────────────────────────────────
const FeedbackForm = ({
  studentId,
  attendedLessons = [],   // ← NEW: list of { lesson, lesson_title } from attendance
  editTarget,
  onSuccess,
  onCancel,
  submitting,
  submit,
}) => {
  const [lessonId, setLessonId] = useState(editTarget?.lesson ?? '');
  const [rating,   setRating]   = useState(editTarget?.rating ?? 0);
  const [comment,  setComment]  = useState(editTarget?.comment ?? '');
  const [alert,    setAlert]    = useState(null);

  // Sync when editTarget changes
  useEffect(() => {
    setLessonId(editTarget?.lesson ?? '');
    setRating(editTarget?.rating ?? 0);
    setComment(editTarget?.comment ?? '');
    setAlert(null);
  }, [editTarget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { setAlert({ type: 'err', msg: 'Please select a rating.' }); return; }
    if (!editTarget && !lessonId) { setAlert({ type: 'err', msg: 'Please select a lesson.' }); return; }

    const res = await submit({
      id:      editTarget?.id ?? null,
      student: studentId,
      lesson:  lessonId || editTarget?.lesson,
      rating,
      comment,
    });

    if (res.ok) {
      setAlert({ type: 'ok', msg: editTarget ? 'Review updated!' : 'Feedback submitted!' });
      setTimeout(() => {
        setAlert(null);
        onSuccess();
      }, 1500);
    } else {
      setAlert({ type: 'err', msg: res.error });
    }
  };

  const isEditing = Boolean(editTarget);

  // Already-reviewed lesson IDs so we can disable them in the dropdown
  // (passed down optionally; harmless if undefined)
  const reviewedLessonIds = new Set();

  return (
    <div className="bg-[#0B1221] rounded-2xl border border-white/[0.06] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">
            {isEditing ? 'Edit your review' : 'Leave feedback'}
          </h2>
          {isEditing && (
            <p className="text-xs text-white/30 mt-0.5">
              Editing: {editTarget.lesson_name}
            </p>
          )}
        </div>
        {isEditing && (
          <button
            onClick={onCancel}
            className="text-xs text-white/30 hover:text-white/60 transition-colors px-3 py-1.5 rounded-lg border border-white/[0.08] hover:bg-white/[0.05]"
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
        {alert && (
          <div className={`text-sm px-4 py-2.5 rounded-xl ${
            alert.type === 'ok'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {alert.msg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Lesson selector — hidden when editing (lesson is locked) */}
          {!isEditing && (
            <div className="space-y-1.5">
              <label className="text-xs text-white/40">Lesson</label>

              {attendedLessons.length === 0 ? (
                /* Empty state — no attended lessons yet */
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/[0.08] bg-[#0F1A2E]">
                  <svg
                    className="w-4 h-4 text-white/20 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-white/25 italic">
                    No attended lessons found
                  </span>
                </div>
              ) : (
                <select
                  value={lessonId}
                  onChange={(e) => setLessonId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm border border-white/[0.08] rounded-xl bg-[#0F1A2E] text-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all"
                >
                  <option value="">Select a lesson…</option>
                  {attendedLessons.map((l) => (
                    <option key={l.lesson} value={l.lesson}>
                      {l.lesson_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs text-white/40">Rating</label>
            <StarPicker value={rating} onChange={setRating} />
            {rating > 0 && (
              <p className="text-xs text-white/30">
                {['', 'Very Poor', 'Poor', 'Average', 'Good', 'Excellent'][rating]}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-white/40">
            Comment <span className="text-white/20">(optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Share your thoughts about this lesson…"
            className="w-full px-3 py-2.5 text-sm border border-white/[0.08] rounded-xl bg-[#0F1A2E] text-white/70 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all resize-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || (!isEditing && attendedLessons.length === 0)}
            className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            {submitting
              ? 'Saving…'
              : isEditing ? 'Save changes' : 'Submit feedback'}
          </button>
        </div>
      </form>
    </div>
  );
};

// ── Feedback row ──────────────────────────────────────────────
const FeedbackRow = ({ feedback, onEdit }) => {
  const sentiment = sentimentBadge(feedback.rating);
  const sentimentCls = {
    Positive: 'bg-emerald-500/10 text-emerald-400',
    Neutral:  'bg-yellow-500/10  text-yellow-400',
    Negative: 'bg-red-500/10     text-red-400',
  }[sentiment.label] ?? '';

  return (
    <tr className="group border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
      <td className="px-5 py-3.5">
        <p className="text-sm font-medium text-white/80">{feedback.lesson_name || '—'}</p>
        <p className="text-xs text-white/30">{feedback.instructor_name}</p>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex flex-col gap-1">
          <Stars rating={feedback.rating} />
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold w-fit ${sentimentCls}`}>
            {sentiment.label}
          </span>
        </div>
      </td>
      <td className="px-5 py-3.5 max-w-[220px]">
        {feedback.comment
          ? <p className="text-sm text-white/50 line-clamp-2">{feedback.comment}</p>
          : <span className="italic text-sm text-white/20">No comment</span>}
      </td>
      <td className="px-5 py-3.5 text-xs text-white/30 whitespace-nowrap">
        {timeAgo(feedback.created_at)}
      </td>
      <td className="px-5 py-3.5">
        <button
          onClick={() => onEdit(feedback)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-white/40 hover:text-white/70"
          title="Edit feedback"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </td>
    </tr>
  );
};

// ── Main page ─────────────────────────────────────────────────
export default function StudentFeedbackPage() {
  const {
    rawList,
    attendedLessons,   // ← now comes from the hook
    studentId,
    stats,
    loading,
    error,
    submitting,
    submit,
    reload,
  } = useStudentFeedback();

  const [editTarget, setEditTarget] = useState(null);
  const formRef = useRef(null);

  const handleEdit = (feedback) => {
    setEditTarget(feedback);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSuccess = () => {
    setEditTarget(null);
    reload();
  };

  const avgColor =
    stats.avg >= 4 ? 'text-emerald-400' :
    stats.avg >= 3 ? 'text-yellow-400'  :
    stats.avg  > 0 ? 'text-red-400'     : 'text-white/30';

  const fiveStars = stats.distribution.find((d) => d.star === 5) ?? { count: 0, percentage: 0 };
  const lowStars  = (stats.distribution.find((d) => d.star === 1)?.count ?? 0)
                  + (stats.distribution.find((d) => d.star === 2)?.count ?? 0);

  return (
    <div className="flex h-screen bg-[#060B18] overflow-hidden font-dm">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-8 pb-4 max-w-4xl w-full mx-auto">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">My Feedback</h1>
              <p className="text-sm text-white/30 mt-0.5">Rate and review lessons you've attended</p>
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

        <div className="px-6 pb-10 max-w-4xl w-full mx-auto space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total reviews"  value={stats.total}       sub={`${rawList.filter(f => f.comment).length} with comments`} />
            <StatCard label="Average rating" value={stats.avg || '—'}  sub="Out of 5.0" accent={avgColor} />
            <StatCard label="5-star reviews" value={fiveStars.count}   sub={`${fiveStars.percentage}% of total`} accent="text-emerald-400" />
            <StatCard label="Low ratings"    value={lowStars}          sub="1–2 star reviews" accent="text-red-400" />
          </div>

          {/* Error banner */}
          {error && (
            <div className="text-sm px-4 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              {error}
            </div>
          )}

          {/* Create / Edit form */}
          <div ref={formRef}>
            <FeedbackForm
              studentId={studentId}              // pass the logged-in student profile id here
              attendedLessons={attendedLessons}  // ← wired up
              editTarget={editTarget}
              onSuccess={handleSuccess}
              onCancel={() => setEditTarget(null)}
              submitting={submitting}
              submit={submit}
            />
          </div>

          {/* Reviews table */}
          <div className="bg-[#0B1221] rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h2 className="text-sm font-semibold text-white">Your reviews</h2>
            </div>

            {loading ? (
              <Spinner />
            ) : rawList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/20 gap-3">
                <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm font-medium">No reviews yet — attend a lesson to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      {['Lesson / Instructor', 'Rating', 'Comment', 'Date', ''].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-white/25 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rawList.map((fb) => (
                      <FeedbackRow key={fb.id} feedback={fb} onEdit={handleEdit} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}