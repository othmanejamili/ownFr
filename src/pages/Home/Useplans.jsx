// src/hooks/usePlans.js
// Fetches GET /api/subscriptionplan/ and maps backend shape → PlanCard shape

import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}`;

// ── Visual config per plan position (1st, 2nd, 3rd, …) ──────
// Since your backend has no accent/icon field we assign them by index.
// Add more entries if you ever add a 4th plan.
const VISUAL_CONFIG = [
  {
    accent: 'blue',
    btnLabel: 'Start free trial →',
    icon: `<path d="M10 2L16 6V14L10 18L4 14V6L10 2Z" stroke="currentColor" strokeWidth="1.4" />`,
    taglineFallback: 'For schools just getting started with digital management.',
  },
  {
    accent: 'purple',
    btnLabel: 'Start free trial →',
    icon: `<path d="M10 2l1.8 5.4H18l-4.9 3.5 1.8 5.6L10 13l-4.9 3.5 1.8-5.6L2 7.4h6.2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />`,
    taglineFallback: 'For growing schools ready to automate and scale.',
  },
  {
    accent: 'cyan',
    btnLabel: 'Contact sales →',
    icon: `<path d="M10 2l1.5 4h4L12 8.5l1.5 4.5L10 10.5l-3.5 2.5L8 8.5 4.5 6h4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2" />`,
    taglineFallback: 'For school networks managing operations at scale.',
  },
];

// ── Human-readable labels for feature keys ───────────────────
const FEATURE_LABELS = {
  smart_scheduling:          'Smart scheduling & calendar',
  calendar:                  'Smart scheduling & calendar',
  basic_student_tracking:    'Basic student tracking',
  manual_invoicing:          'Manual invoicing',
  email_support:             'Email support',
  email_reminders:           'Email reminders',
  sms_reminders:             'SMS & email reminders',
  analytics_dashboard:       'Analytics dashboard',
  full_analytics_dashboard:  'Full analytics dashboard',
  ai_insights:               'AI insights',
  ai_scheduling_optimizer:   'AI scheduling optimizer',
  auto_invoicing:            'Auto invoicing & payments',
  online_payments:           'Online payments',
  priority_chat_support:     'Priority chat support',
  student_progress_reports:  'Student progress reports',
  api_access:                'API access & integrations',
  white_label:               'Custom branding & white-label',
  custom_branding:           'Custom branding',
  sla_guarantee:             'SLA & 99.9% uptime guarantee',
  '24_7_phone_support':      '24/7 priority phone support',
  dedicated_account_manager: 'Dedicated account manager',
  unlimited_storage:         'Unlimited storage',
  custom_reports:            'Custom reports & exports',
  advanced_ai_insights:      'Advanced AI insights',
  onboarding_support:        'Onboarding support',
  training_sessions:         'Training sessions included',
  unlimited_api_calls:       'Unlimited API calls',
  sso_enabled:               'Single sign-on (SSO)',
  audit_logs:                'Audit logs',
  webhooks:                  'Webhooks',
  custom_domain:             'Custom domain',
  predictive_analytics:      'Predictive analytics',
  advanced_automation:       'Advanced automation',
  international_payments:    'International payments',
};

// Keys to skip — they're shown in the card header (students/instructors/schools), not as features
const SKIP_KEYS = new Set([
  'max_schools', 'max_students', 'max_instructors',
  'data_retention_years', 'on_premise_options',
]);

/**
 * Turn a raw API plan object → the shape PlanCard expects.
 * @param {object} apiPlan   — single item from results[]
 * @param {number} index     — position in the list (0-based)
 * @param {boolean} isFirst  — true for the very first plan (for "intro" feature line)
 */
const adaptPlan = (apiPlan, index, plans) => {
  const vis = VISUAL_CONFIG[index] ?? VISUAL_CONFIG[VISUAL_CONFIG.length - 1];
  const featureMap = apiPlan.features ?? {};

  // ── Capacity line (always first feature) ─────────────────
  const maxSchools      = featureMap.max_schools      ?? 1;
  const maxStudents     = featureMap.max_students     ?? apiPlan.max_students;
  const maxInstructors  = featureMap.max_instructors  ?? apiPlan.max_instructors;

  const fmt = (v) => (v === -1 ? 'Unlimited' : v);

  const capacityFeature = {
    text: `${fmt(maxSchools) === 'Unlimited' ? 'Unlimited' : `Up to ${maxSchools}`} school${maxSchools !== 1 ? 's' : ''}, ${fmt(maxStudents) === 'Unlimited' ? 'unlimited' : `${fmt(maxStudents)}`} students, ${fmt(maxInstructors) === 'Unlimited' ? 'unlimited' : `${fmt(maxInstructors)}`} instructors`,
    included: true,
  };

  // ── "Everything in X, plus:" line for 2nd plan onwards ───
  const introFeature = index > 0
    ? { text: `Everything in ${plans[index - 1]?.name ?? 'previous plan'}, plus:`, included: true, highlight: true }
    : null;

  // ── Remaining feature rows ────────────────────────────────
  const featureRows = Object.entries(featureMap)
    .filter(([key]) => !SKIP_KEYS.has(key))
    .map(([key, val]) => {
      const label = FEATURE_LABELS[key] ?? key.replace(/_/g, ' ');
      // val can be: true | false | string (e.g. "99.9%") | number
      const included = val === true || (typeof val === 'string' && val.length > 0) || (typeof val === 'number' && val > 0);
      return { text: label, included };
    })
    // sort: included first, then alphabetical
    .sort((a, b) => {
      if (a.included === b.included) return a.text.localeCompare(b.text);
      return a.included ? -1 : 1;
    });

  // ── Annual price: 25% off monthly ────────────────────────
  const monthlyPrice = parseFloat(apiPlan.price);
  const annualPrice  = Math.round(monthlyPrice * 0.75);

  return {
    key:          String(apiPlan.id),
    name:         apiPlan.name.charAt(0).toUpperCase() + apiPlan.name.slice(1),
    tagline:      vis.taglineFallback,
    monthlyPrice,
    annualPrice,
    accent:       vis.accent,
    btnLabel:     vis.btnLabel,
    featured:     apiPlan.is_popular ?? false,
    iconPath:     vis.icon,       // raw SVG path string — rendered in PlanCard
    features: [
      ...(introFeature ? [introFeature] : []),
      capacityFeature,
      ...featureRows,
    ],
    // extra raw fields you might want for subscription flow
    _raw: apiPlan,
  };
};

// ── Hook ─────────────────────────────────────────────────────
const usePlans = () => {
  const [plans, setPlans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchPlans = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`${API_URL}/subscriptionplan/`);
        const raw = data.results ?? data; // handle both paginated and plain arrays
        if (!cancelled) {
          // pass raw list so adaptPlan can reference previous plan names
          const adapted = raw.map((plan, idx) => adaptPlan(plan, idx, raw));
          setPlans(adapted);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.detail ?? 'Failed to load plans');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPlans();
    return () => { cancelled = true; };
  }, []);

  return { plans, loading, error };
};

export default usePlans;