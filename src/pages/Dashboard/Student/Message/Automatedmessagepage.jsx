// src/pages/Dashboard/Student/StudentMessagesPage.jsx
import { useState, useCallback, useRef, useEffect } from 'react';
import { automatedMessageAPI } from './Automatedmessageapi';
import Sidebar from '../Dashboard/Sidebar';
import {
  getStatusConfig,
  getTemplateTypeConfig,
  formatDateTime,
  formatRelative,
  MESSAGE_STATUS,
} from './Automatedmessageutils';

// ─── Helpers ──────────────────────────────────────────────────

const useAsync = (asyncFn, immediate = true, deps = []) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError]     = useState(null);
  const mountedRef            = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn(...args);
      if (mountedRef.current) setData(result);
      return result;
    } catch (err) {
      if (mountedRef.current) setError(err?.response?.data || err.message || 'Something went wrong');
      throw err;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { if (immediate) execute(); }, [execute, immediate]);

  return { data, loading, error, execute };
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

const StatCard = ({ label, value, accent = 'blue', icon }) => {
  const accents = {
    blue:  'from-blue-600/10  border-blue-500/20  text-blue-300',
    amber: 'from-amber-500/10 border-amber-500/20 text-amber-300',
    green: 'from-emerald-500/10 border-emerald-500/20 text-emerald-300',
    violet:'from-violet-500/10 border-violet-500/20 text-violet-300',
  };
  return (
    <div className={`bg-gradient-to-br ${accents[accent]} border rounded-xl px-4 py-3.5 flex items-center gap-3`}>
      {icon && <span className="text-xl opacity-60">{icon}</span>}
      <div>
        <div className="text-[10px] text-white/35 font-dm uppercase tracking-[0.7px]">{label}</div>
        <div className={`text-2xl font-bold font-sora ${accents[accent].split(' ')[2]}`}>{value}</div>
      </div>
    </div>
  );
};

const Spinner = () => (
  <div className="flex items-center justify-center h-48">
    <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
  </div>
);

const EmptyState = ({ statusFilter }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/20">
    <span className="text-4xl">📭</span>
    <span className="text-[13px] font-sora font-semibold text-white/30">
      {statusFilter ? `No ${statusFilter} messages` : 'No messages yet'}
    </span>
    <span className="text-[11px] font-dm text-white/20">
      Messages from your instructor or school will appear here.
    </span>
  </div>
);

// ─── Message Card ─────────────────────────────────────────────

const MessageCard = ({ msg, isNew, onClick }) => {
  const typeCfg = getTemplateTypeConfig(msg.template_type);
  const isUnread = msg.status === 'sent' || msg.status === 'delivered';

  return (
    <div
      onClick={() => onClick(msg)}
      className={`relative cursor-pointer rounded-xl border transition-all duration-150 px-5 py-4
        ${isUnread
          ? 'bg-blue-600/[0.06] border-blue-500/20 hover:border-blue-500/35 hover:bg-blue-600/[0.09]'
          : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]'
        }`}
    >
      {/* Unread dot */}
      {isUnread && (
        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-base
          ${isUnread ? 'bg-blue-500/15' : 'bg-white/[0.05]'}`}>
          {typeCfg.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[12px] font-semibold font-dm truncate
              ${isUnread ? 'text-white' : 'text-white/70'}`}>
              {msg.template_name ?? 'Message'}
            </span>
            <Badge status={msg.status} />
          </div>

          {/* Subject line if available */}
          {msg.subject && (
            <p className="text-[11px] text-white/50 font-dm truncate mb-1">{msg.subject}</p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-white/25 font-dm">{typeCfg.label}</span>
            <span className="text-white/10">·</span>
            <span className="text-[10px] text-white/25 font-dm">
              {msg.sent_at ? formatRelative(msg.sent_at) : formatDateTime(msg.scheduled_for)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Message Detail Drawer ────────────────────────────────────

const MessageDrawer = ({ msg, onClose }) => {
  const typeCfg = getTemplateTypeConfig(msg?.template_type);

  if (!msg) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0D1526] border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-[#0D1526] flex items-center justify-between px-6 py-4 border-b border-white/[0.06] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-base">
              {typeCfg.icon}
            </div>
            <div>
              <div className="text-[13px] font-bold font-sora text-white">{msg.template_name ?? 'Message'}</div>
              <div className="text-[10px] text-white/30 font-dm">{typeCfg.label}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors text-xl leading-none">×</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Status + timestamp */}
          <div className="flex items-center justify-between">
            <Badge status={msg.status} />
            <span className="text-[10px] text-white/25 font-dm">
              {msg.sent_at
                ? `Sent ${formatDateTime(msg.sent_at)}`
                : `Scheduled ${formatDateTime(msg.scheduled_for)}`}
            </span>
          </div>

          {/* Subject */}
          {msg.subject && (
            <div>
              <div className="text-[10px] text-white/25 uppercase tracking-[0.7px] font-dm mb-1">Subject</div>
              <div className="text-[13px] font-semibold text-white font-dm">{msg.subject}</div>
            </div>
          )}

          {/* Body */}
          {msg.body && (
            <div>
              <div className="text-[10px] text-white/25 uppercase tracking-[0.7px] font-dm mb-1.5">Message</div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5">
                <p className="text-[12px] text-white/65 font-dm leading-relaxed whitespace-pre-line">{msg.body}</p>
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {msg.scheduled_for && (
              <div className="bg-white/[0.02] rounded-xl px-3 py-2.5">
                <div className="text-[10px] text-white/20 font-dm uppercase tracking-[0.6px] mb-0.5">Scheduled</div>
                <div className="text-[11px] text-white/55 font-dm">{formatDateTime(msg.scheduled_for)}</div>
              </div>
            )}
            {msg.sent_at && (
              <div className="bg-white/[0.02] rounded-xl px-3 py-2.5">
                <div className="text-[10px] text-white/20 font-dm uppercase tracking-[0.6px] mb-0.5">Delivered</div>
                <div className="text-[11px] text-white/55 font-dm">{formatDateTime(msg.sent_at)}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────

const StudentMessagesPage = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedMsg, setSelectedMsg]   = useState(null);

  const { data, loading, error, execute: refresh } = useAsync(
    () => automatedMessageAPI.myMessages(statusFilter ? { status: statusFilter } : {}),
    true,
    [statusFilter],
  );

  const stats    = data?.statistics ?? {};
  const messages = data?.messages   ?? [];

  const unreadCount = (stats.pending ?? 0);

  return (
    <div className="flex min-h-screen bg-[#07101F] text-white font-dm">
      <Sidebar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-7">
          <div className="flex items-center justify-between mb-1">
            <h1 className="font-sora text-[22px] font-bold text-white">My Messages</h1>
            <button
              onClick={refresh}
              className="text-[11px] text-white/30 hover:text-white/60 font-dm transition-colors px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12]"
            >
              ↻ Refresh
            </button>
          </div>
          <p className="text-[12px] text-white/30">
            Messages from your school and instructors
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <StatCard label="Total"   value={stats.total_messages ?? '—'} accent="blue"  icon="📨" />
          <StatCard label="Pending" value={stats.pending        ?? '—'} accent="amber" icon="⏳" />
          <StatCard label="Sent"    value={stats.sent           ?? '—'} accent="green" icon="✉️" />
        </div>

        {/* Unread notice */}
        {(stats.unread_sent ?? 0) > 0 && (
          <div className="mb-5 flex items-center gap-3 bg-blue-600/[0.08] border border-blue-500/20 rounded-xl px-4 py-3">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
            <span className="text-[12px] text-blue-300 font-dm">
              You have <strong>{stats.unread_sent}</strong> unread message{stats.unread_sent > 1 ? 's' : ''}.
            </span>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 mb-5 flex-wrap">
          {[['', 'All'], ['pending', 'Pending'], ['sent', 'Sent'], ['delivered', 'Delivered'], ['read', 'Read'], ['failed', 'Failed']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-dm font-semibold transition-all
                ${statusFilter === val
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/[0.04] text-white/35 border border-white/[0.07] hover:text-white/60'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Message list */}
        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-red-400/60">
            <span className="text-3xl">⚠️</span>
            <span className="text-[12px] font-dm">Failed to load messages</span>
          </div>
        ) : messages.length === 0 ? (
          <EmptyState statusFilter={statusFilter} />
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <MessageCard
                key={msg.id}
                msg={msg}
                onClick={setSelectedMsg}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selectedMsg && (
        <MessageDrawer
          msg={selectedMsg}
          onClose={() => setSelectedMsg(null)}
        />
      )}
    </div>
  );
};

export default StudentMessagesPage;