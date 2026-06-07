import { format, formatDistanceToNow, isPast, isFuture, parseISO } from 'date-fns';

// ─── Status Config ────────────────────────────────────────────

export const MESSAGE_STATUS = {
  pending:   { label: 'Pending',   color: 'amber',  dot: 'bg-amber-400',  badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  sent:      { label: 'Sent',      color: 'blue',   dot: 'bg-blue-400',   badge: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  delivered: { label: 'Delivered', color: 'violet', dot: 'bg-violet-400', badge: 'bg-violet-500/15 text-violet-400 border-violet-500/20' },
  failed:    { label: 'Failed',    color: 'red',    dot: 'bg-red-400',    badge: 'bg-red-500/15 text-red-400 border-red-500/20' },
  read:      { label: 'Read',      color: 'green',  dot: 'bg-emerald-400',badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
};

export const TEMPLATE_TYPES = {
  lesson_reminder:  { label: 'Lesson Reminder',  icon: '📅', color: 'blue' },
  birthday:         { label: 'Birthday Wish',    icon: '🎂', color: 'pink' },
  progress_update:  { label: 'Progress Update',  icon: '📈', color: 'green' },
  payment_reminder: { label: 'Payment Reminder', icon: '💳', color: 'amber' },
  achievement:      { label: 'Achievement',      icon: '🏆', color: 'violet' },
};

// ─── Date & Time Helpers ──────────────────────────────────────

/**
 * Format an ISO date string into "Jan 5, 2025 · 14:30"
 */
export const formatDateTime = (iso) => {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), "MMM d, yyyy · HH:mm");
  } catch {
    return iso;
  }
};

/**
 * Format an ISO date string to relative time: "3 hours ago"
 */
export const formatRelative = (iso) => {
  if (!iso) return '—';
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return iso;
  }
};

/**
 * Returns true if the scheduled_for date is in the past and status is pending
 */
export const isOverdue = (message) =>
  message.status === 'pending' && isPast(parseISO(message.scheduled_for));

/**
 * Human-readable time until send (mirrors backend logic)
 */
export const getTimeUntilSend = (message) => {
  if (message.status !== 'pending') return null;
  const scheduled = parseISO(message.scheduled_for);
  if (isPast(scheduled)) {
    return { text: 'Overdue', overdue: true };
  }
  return { text: `In ${formatDistanceToNow(scheduled)}`, overdue: false };
};

// ─── Status Helpers ───────────────────────────────────────────

export const getStatusConfig = (status) =>
  MESSAGE_STATUS[status] ?? { label: status, dot: 'bg-white/20', badge: 'bg-white/10 text-white/40 border-white/10' };

export const getTemplateTypeConfig = (type) =>
  TEMPLATE_TYPES[type] ?? { label: type, icon: '📧', color: 'blue' };

// ─── Badge component helper (returns className strings) ───────

export const statusBadgeClass = (status) =>
  `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold font-dm border ${getStatusConfig(status).badge}`;

// ─── Filters & Sorting ────────────────────────────────────────

export const filterMessages = (messages, { search = '', status = '', templateType = '' }) => {
  return messages.filter((m) => {
    const matchSearch =
      !search ||
      m.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.student_email?.toLowerCase().includes(search.toLowerCase()) ||
      m.template_name?.toLowerCase().includes(search.toLowerCase());

    const matchStatus = !status || m.status === status;
    const matchType   = !templateType || m.template_type === templateType;

    return matchSearch && matchStatus && matchType;
  });
};

export const sortMessages = (messages, { field = 'scheduled_for', direction = 'desc' }) => {
  return [...messages].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    // Date fields
    if (typeof aVal === 'string' && aVal.includes('T')) {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// ─── Template Variable Extraction ────────────────────────────

/**
 * Extract {variable} placeholders from a string
 */
export const extractVariables = (text = '') => {
  const matches = text.match(/\{(\w+)\}/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(1, -1)))];
};

/**
 * Render a template string with a context object
 * Returns { rendered, missing } 
 */
export const renderTemplate = (text = '', context = {}) => {
  const vars = extractVariables(text);
  const missing = vars.filter((v) => !(v in context));
  const rendered = vars.reduce(
    (acc, v) => acc.replace(new RegExp(`\\{${v}\\}`, 'g'), context[v] ?? `{${v}}`),
    text
  );
  return { rendered, missing };
};

// ─── Pagination ───────────────────────────────────────────────

export const paginate = (items, page, pageSize) => {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
};

export const totalPages = (count, pageSize) => Math.ceil(count / pageSize);

// ─── Statistics Summary Helpers ───────────────────────────────

export const calcDeliveryRate = (byStatus = {}) => {
  const successful = (byStatus.sent ?? 0) + (byStatus.delivered ?? 0) + (byStatus.read ?? 0);
  const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
  return total === 0 ? 0 : Math.round((successful / total) * 100);
};

// ─── Bulk Helpers ─────────────────────────────────────────────

export const buildBulkCreatePayload = ({ studentIds, templateId, scheduledFor }) => ({
  student_ids: studentIds,
  template_id: templateId,
  scheduled_for: scheduledFor,
});

export const buildBulkCancelPayload = ({ messageIds, reason = '' }) => ({
  message_ids: messageIds,
  reason,
});

// ─── Form Validation ──────────────────────────────────────────

export const validateMessageForm = ({ student, template, scheduled_for }) => {
  const errors = {};
  if (!student)       errors.student       = 'Student is required';
  if (!template)      errors.template      = 'Template is required';
  if (!scheduled_for) errors.scheduled_for = 'Schedule time is required';
  else if (isPast(parseISO(scheduled_for)))
    errors.scheduled_for = 'Schedule time must be in the future';
  return errors;
};

export const validateTemplateForm = ({ name, subject, body, template_type, school }) => {
  const errors = {};
  if (!name?.trim())          errors.name          = 'Name is required';
  if (!template_type)         errors.template_type = 'Template type is required';
  if (!subject?.trim())       errors.subject       = 'Subject is required';
  if (!body?.trim())          errors.body          = 'Body is required';
  if (!school)                errors.school        = 'School is required';
  return errors;
};