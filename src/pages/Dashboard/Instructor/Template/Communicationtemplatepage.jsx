// src/pages/Dashboard/Owner/Template/InstructorCommunicationTemplatePage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import Sidebar from '../Dashboard/Sidebar';
import {
  useCommunicationTemplates,
  useTemplateMutations,
  useTemplateUsageStats,
  useAvailableVariables,
} from '../Message/Useautomatedmessage';
import {
  getTemplateTypeConfig,
  formatRelative,
  validateTemplateForm,
  extractVariables,
  TEMPLATE_TYPES,
} from '../Message/Automatedmessageutils';

import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

// ─── Shared primitives ────────────────────────────────────────

const Spinner = () => (
  <div className="flex items-center justify-center h-40">
    <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
  </div>
);

const EmptyState = ({ icon, text }) => (
  <div className="flex flex-col items-center justify-center h-48 text-white/20 gap-2">
    <span className="text-4xl">{icon}</span>
    <span className="text-[12px] font-dm">{text}</span>
  </div>
);

const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3200);
  }, []);
  return { toasts, push };
};

const Toast = ({ toasts }) => (
  <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`px-4 py-2.5 rounded-xl text-[12px] font-dm font-semibold shadow-2xl border
          ${t.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/40 text-emerald-300'
          : t.type === 'error'   ? 'bg-red-900/90 border-red-500/40 text-red-300'
                                 : 'bg-[#0F1A2E] border-white/10 text-white/70'}`}
      >
        {t.message}
      </div>
    ))}
  </div>
);

// ─── Variable Chip ────────────────────────────────────────────

const VarChip = ({ name, onClick }) => (
  <button
    type="button"
    onClick={() => onClick?.(name)}
    className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600/20 transition-colors"
  >
    {'{' + name + '}'}
  </button>
);

// ─── Type Badge ───────────────────────────────────────────────

const TypeBadge = ({ type }) => {
  const cfg = getTemplateTypeConfig(type);
  const colors = {
    blue:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
    pink:   'bg-pink-500/10 text-pink-400 border-pink-500/20',
    green:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-dm border ${colors[cfg.color] ?? colors.blue}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

// ─── Template Card ────────────────────────────────────────────

const TemplateCard = ({ template, onEdit, onDuplicate, onToggle, onDelete, onPreview }) => {
  const vars = extractVariables((template.subject ?? '') + (template.body ?? ''));

  return (
    <div className={`bg-[#0B1221] border rounded-2xl overflow-hidden transition-all duration-200 hover:border-white/[0.12] group
      ${template.is_active ? 'border-white/[0.07]' : 'border-white/[0.03] opacity-60'}`}>

      <div className="px-4 pt-4 pb-3 border-b border-white/[0.05]">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="font-sora text-[13px] font-bold text-white leading-snug flex-1">{template.name}</div>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${template.is_active ? 'bg-emerald-400' : 'bg-white/15'}`} />
        </div>
        <TypeBadge type={template.template_type} />
      </div>

      <div className="px-4 py-3">
        <div className="text-[11px] font-semibold text-white/50 mb-0.5 font-dm">{template.subject}</div>
        <div className="text-[10px] text-white/25 font-dm leading-relaxed line-clamp-2">{template.body}</div>
        {vars.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {vars.slice(0, 4).map((v) => (
              <span key={v} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/[0.04] text-white/30 border border-white/[0.06]">
                {'{' + v + '}'}
              </span>
            ))}
            {vars.length > 4 && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-dm bg-white/[0.04] text-white/20">+{vars.length - 4}</span>
            )}
          </div>
        )}
      </div>

      <div className="px-4 pb-3 flex items-center justify-between">
        <div className="text-[10px] text-white/20 font-dm">
          {template.usage_count ?? 0} uses · {template.last_used ? formatRelative(template.last_used) : 'Never used'}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">

        </div>
      </div>
    </div>
  );
};

const ActionBtn = ({ label, onClick, color }) => {
  const colors = {
    blue:   'text-blue-400 hover:bg-blue-600/15',
    violet: 'text-violet-400 hover:bg-violet-600/15',
    amber:  'text-amber-400 hover:bg-amber-500/15',
    red:    'text-red-400 hover:bg-red-500/15',
  };
  return (
    <button onClick={onClick} className={`px-2 py-1 rounded-lg text-[10px] font-dm font-semibold transition-colors ${colors[color]}`}>
      {label}
    </button>
  );
};

// ─── Template Form Modal ──────────────────────────────────────

const TemplateFormModal = ({ open, initial, schoolId, onClose, onSave, saving, apiError }) => {
  const { variables } = useAvailableVariables();

  const blank = { name: '', template_type: '', subject: '', body: '', school: schoolId ?? '', is_active: true };
  const [form, setForm]         = useState(blank);
  const [errors, setErrors]     = useState({});
  const [activeField, setActiveField] = useState(null);

  // Reset form whenever modal opens/closes or initial changes
  useEffect(() => {
    if (open) {
      setForm(initial
        ? { ...initial, school: initial.school ?? schoolId ?? '' }
        : { ...blank, school: schoolId ?? '' }
      );
      setErrors({});
      setActiveField(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial, schoolId]);

  // Show backend field errors in the form
  useEffect(() => {
    if (apiError && typeof apiError === 'object') {
      setErrors(apiError);
    }
  }, [apiError]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const insertVar = (varName) => {
    if (!activeField) return;
    set(activeField, (form[activeField] ?? '') + `{${varName}}`);
  };

  const handleSubmit = () => {
    const errs = validateTemplateForm({ ...form, school: schoolId ?? form.school });
    if (Object.keys(errs).length) { setErrors(errs); return; }
    // Always send the schoolId from auth, not from user input
    onSave({ ...form, school: schoolId ?? form.school });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0D1526] border border-white/[0.08] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-sora text-[15px] font-bold text-white">
            {initial ? 'Edit Template' : 'New Template'}
          </h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors text-xl leading-none">×</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Global API error */}
          {apiError && typeof apiError === 'string' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-[11px] text-red-400 font-dm">
              {apiError}
            </div>
          )}

          {/* Name + Type */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Template Name" error={errors.name}>
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Welcome Message"
                className={inputCls(errors.name)}
              />
            </Field>
            <Field label="Type" error={errors.template_type}>
              <select
                value={form.template_type}
                onChange={(e) => set('template_type', e.target.value)}
                className={inputCls(errors.template_type)}
              >
                <option value="">Select type…</option>
                {Object.entries(TEMPLATE_TYPES).map(([v, c]) => (
                  <option key={v} value={v}>{c.icon} {c.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Subject */}
          <Field label="Subject" error={errors.subject}>
            <input
              value={form.subject}
              onChange={(e) => set('subject', e.target.value)}
              onFocus={() => setActiveField('subject')}
              placeholder="Hello {student_name}!"
              className={inputCls(errors.subject)}
            />
          </Field>

          {/* Body */}
          <Field label="Body" error={errors.body}>
            <textarea
              rows={6}
              value={form.body}
              onChange={(e) => set('body', e.target.value)}
              onFocus={() => setActiveField('body')}
              placeholder="Write your message here…"
              className={`${inputCls(errors.body)} resize-none`}
            />
          </Field>

          {/* Variable chips */}
          {Object.keys(variables).length > 0 && (
            <div>
              <div className="text-[10px] text-white/25 font-dm mb-2 uppercase tracking-[0.6px]">
                Click to insert into{' '}
                <span className="text-blue-400">{activeField ?? 'subject or body'}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(variables).map((v) => (
                  <VarChip key={v} name={v} onClick={insertVar} />
                ))}
              </div>
            </div>
          )}

          {/* Active toggle */}
          <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => set('is_active', !form.is_active)}>
            <div className={`w-9 h-5 rounded-full transition-colors relative ${form.is_active ? 'bg-blue-600' : 'bg-white/10'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-[12px] font-dm text-white/50">{form.is_active ? 'Active' : 'Inactive'}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-white/[0.06]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-[12px] font-dm text-white/40 hover:text-white/70 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-[12px] font-dm font-semibold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : initial ? 'Update Template' : 'Create Template'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.7px] mb-1.5 font-dm">{label}</label>
    {children}
    {error && (
      <div className="text-[10px] text-red-400 font-dm mt-1">
        {Array.isArray(error) ? error[0] : typeof error === 'string' ? error : JSON.stringify(error)}
      </div>
    )}
  </div>
);

const inputCls = (hasError) =>
  `w-full bg-white/[0.04] border rounded-xl px-3 py-2.5 text-[12px] text-white/80 placeholder-white/20
   focus:outline-none transition-all font-dm
   ${hasError ? 'border-red-500/40 focus:border-red-400/60' : 'border-white/[0.07] focus:border-blue-500/40 focus:bg-white/[0.06]'}`;

// ─── Preview Modal ────────────────────────────────────────────

const PreviewModal = ({ open, preview, onClose }) => {
  if (!open || !preview) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0D1526] border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-sora text-[14px] font-bold text-white">Template Preview</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {preview.is_sample_data && (
            <div className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 font-dm">
              ⚠ Using sample data — provide a student ID for real data
            </div>
          )}
          <div>
            <div className="text-[10px] text-white/25 uppercase tracking-[0.7px] font-dm mb-1">Subject</div>
            <div className="text-[13px] font-semibold text-white font-sora">{preview.preview?.subject}</div>
          </div>
          <div>
            <div className="text-[10px] text-white/25 uppercase tracking-[0.7px] font-dm mb-1">Body</div>
            <div className="text-[12px] text-white/60 font-dm whitespace-pre-line leading-relaxed bg-white/[0.03] rounded-xl px-4 py-3 border border-white/[0.05]">
              {preview.preview?.body}
            </div>
          </div>
        </div>
        <div className="flex justify-end px-6 py-4 border-t border-white/[0.06]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-[12px] font-dm text-white/40 hover:text-white/70 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────

const InstructorCommunicationTemplatePage = () => {
  const { user } = useAuth();
  const { toasts, push } = useToast();

  // Fetch owner's school to get schoolId
  const [schoolId, setSchoolId] = useState(null);
  useEffect(() => {
    const access = localStorage.getItem('access') || sessionStorage.getItem('access');
    if (!access) return;
    axios
      .get(`${API}/drivingschool/`, { headers: { Authorization: `Bearer ${access}` } })
      .then((r) => {
        const schools = r.data?.results ?? r.data ?? [];
        if (schools.length > 0) setSchoolId(schools[0].id);
      })
      .catch(() => {});
  }, []);

  const {
    templates, loading, error, refresh,
    search, setSearch,
    typeFilter, setTypeFilter,
    total,
  } = useCommunicationTemplates();

  const { stats } = useTemplateUsageStats();

  const [formModal, setFormModal]       = useState({ open: false, initial: null });
  const [previewModal, setPreviewModal] = useState({ open: false, data: null });
  const [saveError, setSaveError]       = useState(null);

  const mutations = useTemplateMutations((type) => {
    const labels = {
      toggled:    '✓ Status updated',
    };
    push(labels[type] ?? '✓ Done');
    setSaveError(null);
    refresh();
    setFormModal({ open: false, initial: null });
  });


  const handleClose = ()  => { setSaveError(null); setFormModal({ open: false, initial: null }); };

  const handleSave = async (form) => {
    setSaveError(null);
    try {
      if (formModal.initial) {
        await mutations.updateTemplate(formModal.initial.id, form);
      } else {
        await mutations.createTemplate(form);
      }
    } catch (err) {
      // Surface backend validation errors back into the modal
      const errData = err?.response?.data;
      setSaveError(errData ?? 'Save failed — please try again');
    }
  };



  const handlePreview = async (t) => {
    try {
      const data = await mutations.previewTemplate(t.id);
      setPreviewModal({ open: true, data });
    } catch { push('Preview failed', 'error'); }
  };

  return (
    <div className="flex min-h-screen bg-[#07101F] text-white font-dm">
      <Sidebar />
      <div className="flex-1 overflow-auto">
      {/* Header */}
        <div className="border-b border-white/[0.06] px-7 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-sora text-[20px] font-bold text-white">Communication Templates</h1>
              <p className="text-[12px] text-white/30 mt-0.5">Build reusable message templates for student communications</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-7 py-6 space-y-6">

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Templates',      value: stats.summary?.total_templates   ?? '—', color: 'text-white' },
              { label: 'Active',               value: stats.summary?.active_templates  ?? '—', color: 'text-emerald-400' },
              { label: 'Never Used',           value: stats.summary?.never_used        ?? '—', color: 'text-amber-400' },
              { label: 'Total Messages Sent',  value: stats.total_messages_created     ?? '—', color: 'text-blue-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#0B1221] border border-white/[0.06] rounded-xl px-4 py-3.5">
                <div className="text-[10px] text-white/25 font-dm uppercase tracking-[0.7px] mb-1">{label}</div>
                <div className={`text-2xl font-bold font-sora ${color}`}>{value}</div>
              </div>
            ))}
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates…"
              className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl pl-9 pr-3 py-2 text-[12px] text-white/70 placeholder-white/20 focus:outline-none focus:border-blue-500/40 transition-all"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 text-[12px] text-white/60 focus:outline-none focus:border-blue-500/40 transition-all"
          >
            <option value="">All types</option>
            {Object.entries(TEMPLATE_TYPES).map(([v, c]) => (
              <option key={v} value={v}>{c.icon} {c.label}</option>
            ))}
          </select>

          <span className="text-[11px] text-white/20 font-dm ml-auto">
            {total} template{total !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <Spinner />
        ) : error ? (
          <EmptyState icon="⚠️" text="Failed to load templates" />
        ) : templates.length === 0 ? (
          <EmptyState icon="📋" text="No templates yet — create your first one!" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {templates.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onPreview={handlePreview}
              />
            ))}
          </div>
        )}

        {/* Most used */}
        {stats?.most_used_templates?.length > 0 && (
          <div className="bg-[#0B1221] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.05]">
              <span className="text-[12px] font-semibold text-white/60 font-sora">Most Used Templates</span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {stats.most_used_templates.map((t) => (
                <div key={t.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-[12px] font-semibold text-white font-dm">{t.name}</div>
                    <TypeBadge type={t.type} />
                  </div>
                  <div className="text-right">
                    <div className="text-[14px] font-bold text-blue-400 font-sora">{t.total_messages}</div>
                    <div className="text-[10px] text-white/25 font-dm">messages</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TemplateFormModal
        open={formModal.open}
        initial={formModal.initial}
        schoolId={schoolId}
        onClose={handleClose}
        onSave={handleSave}
        saving={mutations.saving}
        apiError={saveError}
      />

      <PreviewModal
        open={previewModal.open}
        preview={previewModal.data}
        onClose={() => setPreviewModal({ open: false, data: null })}
      />

      <Toast toasts={toasts} />
    </div>
  );
};

export default InstructorCommunicationTemplatePage;