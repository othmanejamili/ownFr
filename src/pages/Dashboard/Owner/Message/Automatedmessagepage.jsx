// src/pages/Dashboard/Owner/Message/AutomatedMessagePage.jsx
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../Sidebar';
import {
  useAutomatedMessages,
  useAutomatedMessageMutations,
  useMessageStatistics,
  usePendingMessages,
} from './Useautomatedmessage';
import {
  getStatusConfig,
  getTemplateTypeConfig,
  formatDateTime,
  isOverdue,
  getTimeUntilSend,
  MESSAGE_STATUS,
  calcDeliveryRate,
} from './Automatedmessageutils';

const API = import.meta.env.VITE_API_URL;

const authHeader = () => {
  const access = localStorage.getItem('access') || sessionStorage.getItem('access');
  return access ? { Authorization: `Bearer ${access}` } : {};
};

// ─── Primitives ───────────────────────────────────────────────

const Badge = ({ status }) => {
  const cfg = getStatusConfig(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold font-dm border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const StatCard = ({ label, value, sub, accent = 'blue' }) => {
  const accents = {
    blue:   'from-blue-600/10   border-blue-500/20   text-blue-300',
    amber:  'from-amber-500/10  border-amber-500/20  text-amber-300',
    red:    'from-red-500/10    border-red-500/20    text-red-300',
    green:  'from-emerald-500/10 border-emerald-500/20 text-emerald-300',
  };
  return (
    <div className={`bg-gradient-to-br ${accents[accent]} border rounded-xl px-4 py-3.5`}>
      <div className="text-[10px] text-white/35 font-dm uppercase tracking-[0.7px] mb-1">{label}</div>
      <div className={`text-2xl font-bold font-sora ${accents[accent].split(' ')[2]}`}>{value}</div>
      {sub && <div className="text-[10px] text-white/30 font-dm mt-0.5">{sub}</div>}
    </div>
  );
};

const Spinner = () => (
  <div className="flex items-center justify-center h-40">
    <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
  </div>
);

const EmptyState = ({ icon, text }) => (
  <div className="flex flex-col items-center justify-center h-40 text-white/20 gap-2">
    <span className="text-3xl">{icon}</span>
    <span className="text-[12px] font-dm">{text}</span>
  </div>
);

const Toast = ({ toasts }) => (
  <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
    {toasts.map((t) => (
      <div key={t.id} className={`px-4 py-2.5 rounded-xl text-[12px] font-dm font-semibold shadow-2xl border
        ${t.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/40 text-emerald-300'
        : t.type === 'error'   ? 'bg-red-900/90 border-red-500/40 text-red-300'
                               : 'bg-[#0F1A2E] border-white/10 text-white/70'}`}>
        {t.message}
      </div>
    ))}
  </div>
);

const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  }, []);
  return { toasts, push };
};

const inputCls = (err) =>
  `w-full bg-white/[0.04] border rounded-xl px-3 py-2.5 text-[12px] text-white/80 placeholder-white/20
   focus:outline-none transition-all font-dm
   ${err ? 'border-red-500/40' : 'border-white/[0.07] focus:border-blue-500/40 focus:bg-white/[0.06]'}`;

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.7px] mb-1.5 font-dm">{label}</label>
    {children}
    {error && <p className="text-[10px] text-red-400 font-dm mt-1">
      {Array.isArray(error) ? error[0] : error}
    </p>}
  </div>
);

// ─── Confirm Modal ────────────────────────────────────────────

const ConfirmModal = ({ open, title, body, onConfirm, onCancel, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0D1526] border border-white/[0.08] rounded-2xl p-6 w-[340px] shadow-2xl">
        <div className="text-[14px] font-bold font-sora text-white mb-2">{title}</div>
        <div className="text-[12px] text-white/40 font-dm mb-5">{body}</div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-[12px] font-dm text-white/40 hover:text-white/70 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="px-4 py-2 rounded-lg text-[12px] font-dm font-semibold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors">
            {loading ? 'Working…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Create Message Modal ─────────────────────────────────────

const CreateMessageModal = ({ open, onClose, onCreated, push }) => {
  const blank = { student: '', template: '', scheduled_for: '', send_now: false };
  const [form, setForm]       = useState(blank);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);

  // Data for dropdowns
  const [students,      setStudents]      = useState([]);
  const [templates,     setTemplates]     = useState([]);
  const [loadingData,   setLoadingData]   = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Step 1 — load templates when modal opens
  useEffect(() => {
    if (!open) { setForm(blank); setErrors({}); setStudents([]); return; }
    setLoadingData(true);
    axios
      .get(`${API}/communicationtemplate/`, {
        headers: authHeader(),
        params: { is_active: true },
      })
      .then(r => setTemplates(r.data?.results ?? r.data ?? []))
      .catch(() => push('Failed to load templates', 'error'))
      .finally(() => setLoadingData(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Step 2 — when a template is selected, fetch students filtered by that template's school
  useEffect(() => {
    if (!form.template) { setStudents([]); return; }

    const selectedTemplate = templates.find(t => String(t.id) === String(form.template));
    if (!selectedTemplate?.school) return;

    setLoadingStudents(true);
    axios
      .get(`${API}/studentprofile/`, {
        headers: authHeader(),
        params: { school: selectedTemplate.school },  // filter by school
      })
      .then(r => {
        const all = r.data?.results ?? r.data ?? [];
        // Only show actual students (role='S'), not instructors
        return all.filter(s => s.user_role === 'S');
      })
      .then(s => setStudents(s))
      .catch(() => push('Failed to load students', 'error'))
      .finally(() => setLoadingStudents(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.template]);

  const set = (k, v) => {
    // When template changes, reset student selection
    if (k === 'template') setForm(p => ({ ...p, template: v, student: '' }));
    else setForm(p => ({ ...p, [k]: v }));
  };

  // Min datetime = now + 1 min (browser format)
  const minDatetime = () => {
    const d = new Date(Date.now() + 60_000);
    return d.toISOString().slice(0, 16);
  };

  const validate = () => {
    const e = {};
    if (!form.student)       e.student  = 'Select a student';
    if (!form.template)      e.template = 'Select a template';
    if (!form.send_now && !form.scheduled_for)
      e.scheduled_for = 'Pick a date & time, or choose Send Now';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    // scheduled_for: if send_now use now+5s, otherwise use picked time
    const scheduled_for = form.send_now
      ? new Date(Date.now() + 5000).toISOString()
      : new Date(form.scheduled_for).toISOString();

    setSaving(true);
    try {
      const { data: msg } = await axios.post(
        `${API}/automatedmessage/`,
        { student: form.student, template: form.template, scheduled_for },
        { headers: authHeader() }
      );

      if (form.send_now) {
        // Immediately trigger send
        await axios.post(`${API}/automatedmessage/${msg.id}/send_now/`, {}, { headers: authHeader() });
        push('✓ Message sent immediately');
      } else {
        push('✓ Message scheduled successfully');
      }

      onCreated();
      onClose();
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === 'object') {
        setErrors(data);
      } else {
        push(typeof data === 'string' ? data : 'Failed to create message', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0D1526] border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-sora text-[15px] font-bold text-white">New Message</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors text-xl leading-none">×</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
              <span className="text-[11px] text-white/25 font-dm">Loading templates…</span>
            </div>
          ) : (
            <>
              {/* Template — pick this FIRST so we know which school to fetch students from */}
              <Field label="Template" error={errors.template}>
                <select
                  value={form.template}
                  onChange={e => set('template', e.target.value)}
                  className={inputCls(errors.template)}
                  disabled={loadingData}
                >
                  <option value="">
                    {loadingData ? 'Loading templates…' : 'Select template…'}
                  </option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} — {t.template_type}</option>
                  ))}
                </select>
              </Field>

              {/* Student — only enabled after a template is chosen */}
              <Field label="Student" error={errors.student}>
                <select
                  value={form.student}
                  onChange={e => set('student', e.target.value)}
                  className={inputCls(errors.student)}
                  disabled={!form.template || loadingStudents}
                >
                  <option value="">
                    {!form.template
                      ? 'Select a template first…'
                      : loadingStudents
                      ? 'Loading students…'
                      : students.length === 0
                      ? 'No students in this school'
                      : 'Select student…'}
                  </option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.user_username} — {s.user_email}
                    </option>
                  ))}
                </select>
                {!form.template && (
                  <p className="text-[10px] text-white/20 font-dm mt-1">
                    Students are filtered by the template's school
                  </p>
                )}
              </Field>

              {/* Send Now toggle */}
              <div
                className="flex items-center gap-3 cursor-pointer select-none"
                onClick={() => set('send_now', !form.send_now)}
              >
                <div className={`w-9 h-5 rounded-full transition-colors relative ${form.send_now ? 'bg-blue-600' : 'bg-white/10'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.send_now ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-white font-dm">Send Immediately</div>
                  <div className="text-[10px] text-white/30 font-dm">Skip scheduling — send right now</div>
                </div>
              </div>

              {/* Scheduled For — only shown if not send_now */}
              {!form.send_now && (
                <Field label="Schedule For" error={errors.scheduled_for}>
                  <input
                    type="datetime-local"
                    min={minDatetime()}
                    value={form.scheduled_for}
                    onChange={e => set('scheduled_for', e.target.value)}
                    className={inputCls(errors.scheduled_for)}
                    style={{ colorScheme: 'dark' }}
                  />
                  <p className="text-[10px] text-white/20 font-dm mt-1">
                    Celery will automatically send it at this time.
                  </p>
                </Field>
              )}

              {/* Preview of selected template */}
              {form.template && (() => {
                const t = templates.find(t => String(t.id) === String(form.template));
                return t ? (
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 space-y-1">
                    <div className="text-[10px] text-white/25 uppercase tracking-[0.6px] font-dm">Template Preview</div>
                    <div className="text-[11px] font-semibold text-white/70 font-dm">{t.subject}</div>
                    <div className="text-[10px] text-white/35 font-dm line-clamp-2">{t.body}</div>
                  </div>
                ) : null;
              })()}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-white/[0.06]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-[12px] font-dm text-white/40 hover:text-white/70 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || loadingData || loadingStudents}
            className={`px-5 py-2 rounded-xl text-[12px] font-dm font-semibold disabled:opacity-50 transition-colors
              ${form.send_now
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'bg-blue-600 text-white hover:bg-blue-500'}`}
          >
            {saving ? 'Working…' : form.send_now ? '⚡ Send Now' : '📅 Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Message Row ──────────────────────────────────────────────

const MessageRow = ({ msg, onSendNow, onCancel, saving }) => {
  const timeUntil = getTimeUntilSend(msg);
  const typeCfg   = getTemplateTypeConfig(msg.template_type);

  return (
    <tr className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
      <td className="py-3 px-4">
        <div className="text-[12px] font-semibold text-white font-dm">{msg.student_name ?? '—'}</div>
        <div className="text-[10px] text-white/30 font-dm">{msg.student_email ?? ''}</div>
      </td>
      <td className="py-3 px-4">
        <div className="text-[11px] text-white/70 font-dm">{msg.template_name ?? '—'}</div>
        <div className="text-[10px] text-white/25 font-dm">{typeCfg.label}</div>
      </td>
      <td className="py-3 px-4">
        <div className="text-[11px] text-white/60 font-dm">{formatDateTime(msg.scheduled_for)}</div>
        {timeUntil && (
          <div className={`text-[10px] font-dm ${timeUntil.overdue ? 'text-red-400' : 'text-white/25'}`}>
            {timeUntil.text}
          </div>
        )}
      </td>
      <td className="py-3 px-4"><Badge status={msg.status} /></td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {msg.status === 'pending' && (
            <>
              <button
                onClick={() => onSendNow(msg.id)}
                disabled={saving}
                className="px-2.5 py-1 rounded-lg text-[10px] font-dm font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/20 hover:bg-blue-600/30 disabled:opacity-40 transition-colors"
              >
                Send Now
              </button>
              <button
                onClick={() => onCancel(msg.id)}
                disabled={saving}
                className="px-2.5 py-1 rounded-lg text-[10px] font-dm font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-40 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

// ─── Main Page ────────────────────────────────────────────────

const AutomatedMessagePage = () => {
  const { toasts, push } = useToast();

  const {
    messages, loading, error, refresh,
    search, setSearch,
    statusFilter, setStatusFilter,
    total,
  } = useAutomatedMessages();

  const { stats }                    = useMessageStatistics();
  const { overdue, upcoming, totalPending } = usePendingMessages();

  const [createOpen, setCreateOpen]  = useState(false);
  const [confirm, setConfirm]        = useState({ open: false, action: null, id: null, title: '', body: '' });

  const { sendNow, cancelMessage, saving } = useAutomatedMessageMutations((type) => {
    push(type === 'sent' ? '✓ Message sent' : type === 'cancelled' ? '✓ Message cancelled' : '✓ Done');
    refresh();
    setConfirm(p => ({ ...p, open: false }));
  });

  const handleSendNow = (id) =>
    setConfirm({ open: true, id, action: 'send',   title: 'Send Now?',        body: 'This will immediately deliver the message to the student.' });
  const handleCancel  = (id) =>
    setConfirm({ open: true, id, action: 'cancel', title: 'Cancel Message?',  body: 'This will permanently delete the scheduled message.' });

  const handleConfirm = async () => {
    try {
      if (confirm.action === 'send')   await sendNow(confirm.id);
      if (confirm.action === 'cancel') await cancelMessage(confirm.id);
    } catch { push('Something went wrong', 'error'); }
  };

  const byStatus     = stats?.by_status ?? {};
  const deliveryRate = calcDeliveryRate(byStatus);

  return (
    <div className="flex min-h-screen bg-[#07101F] text-white font-dm">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="border-b border-white/[0.06] px-7 py-5 sticky top-0 bg-[#07101F] z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-sora text-[20px] font-bold text-white">Automated Messages</h1>
              <p className="text-[12px] text-white/30 mt-0.5">Manage and monitor all scheduled communications</p>
            </div>
            <div className="flex items-center gap-2">
              {totalPending > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[11px] text-amber-400 font-semibold">{totalPending} pending</span>
                </div>
              )}
              {overdue.count > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-[11px] text-red-400 font-semibold">{overdue.count} overdue</span>
                </div>
              )}
              {/* ── New Message button ── */}
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors font-dm"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                New Message
              </button>
            </div>
          </div>
        </div>

        <div className="px-7 py-6 space-y-6">

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Messages" value={stats?.summary?.total_messages   ?? '—'} accent="blue" />
            <StatCard label="Pending"        value={stats?.summary?.pending_messages ?? '—'} accent="amber" sub="scheduled" />
            <StatCard label="Failed"         value={stats?.summary?.failed_messages  ?? '—'} accent="red" />
            <StatCard label="Delivery Rate"  value={`${deliveryRate}%`}                      accent="green" sub="sent + delivered + read" />
          </div>

          {/* Overdue Banner */}
          {overdue.count > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-red-400 flex-shrink-0">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M8 4v4M8 11v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span className="text-[12px] text-red-300 font-semibold">
                {overdue.count} message{overdue.count > 1 ? 's are' : ' is'} overdue and waiting to be sent.
              </span>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-[300px]">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">
                <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search student, template…"
                className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl pl-9 pr-3 py-2 text-[12px] text-white/70 placeholder-white/20 focus:outline-none focus:border-blue-500/40 transition-all"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 text-[12px] text-white/60 focus:outline-none focus:border-blue-500/40 transition-all"
            >
              <option value="">All statuses</option>
              {Object.entries(MESSAGE_STATUS).map(([v, c]) => (
                <option key={v} value={v}>{c.label}</option>
              ))}
            </select>

            <button
              onClick={refresh}
              className="px-3 py-2 rounded-xl text-[12px] font-semibold bg-white/[0.04] text-white/40 border border-white/[0.07] hover:text-white/70 transition-colors ml-auto"
            >
              ↻ Refresh
            </button>
          </div>

          {/* Table */}
          <div className="bg-[#0B1221] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center justify-between">
              <span className="text-[12px] font-semibold text-white/60 font-sora">
                Messages
                <span className="ml-2 text-[10px] text-white/20 font-dm font-normal">({total} shown)</span>
              </span>
            </div>

            {loading ? <Spinner />
            : error   ? <EmptyState icon="⚠️" text="Failed to load messages" />
            : messages.length === 0 ? <EmptyState icon="📭" text="No messages found" />
            : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      {['Student', 'Template', 'Scheduled For', 'Status', ''].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold text-white/20 uppercase tracking-[0.7px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map(msg => (
                      <MessageRow
                        key={msg.id}
                        msg={msg}
                        onSendNow={handleSendNow}
                        onCancel={handleCancel}
                        saving={saving}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Upcoming */}
          {upcoming.count > 0 && (
            <div className="bg-[#0B1221] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/[0.05]">
                <span className="text-[12px] font-semibold text-white/60 font-sora">
                  Upcoming <span className="ml-1 text-[10px] text-white/20 font-dm font-normal">({upcoming.count})</span>
                </span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {upcoming.messages.slice(0, 5).map(msg => (
                  <div key={msg.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <div className="text-[12px] font-semibold text-white">{msg.student_name}</div>
                      <div className="text-[10px] text-white/30">{msg.template_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-white/50">{formatDateTime(msg.scheduled_for)}</div>
                      <Badge status={msg.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <CreateMessageModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={refresh}
        push={push}
      />

      <ConfirmModal
        open={confirm.open}
        title={confirm.title}
        body={confirm.body}
        loading={saving}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(p => ({ ...p, open: false }))}
      />

      <Toast toasts={toasts} />
    </div>
  );
};

export default AutomatedMessagePage;