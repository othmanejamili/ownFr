import { useState } from 'react';
import NavBar from './NavBar';
/*
 * DriveIQ — Pricing Page
 * Stack  : React 18 + Tailwind CSS v3
 * Fonts  : Add to index.html <head>:
 *   <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
 * tailwind.config.js — extend fontFamily:
 *   fontFamily: { sora: ['Sora','sans-serif'], dm: ['DM Sans','sans-serif'] }
 */

// ─── Shared primitives ───────────────────────────────────────

const LogoMark = ({ size = 32 }) => (
  <div
    className="bg-blue-600 flex items-center justify-center flex-shrink-0"
    style={{ width: size, height: size, borderRadius: Math.round(size * 0.28) }}
  >
    <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 18 18" fill="none">
      <path d="M9 2L15 7.5V16H3V7.5L9 2Z" fill="white" />
      <rect x="6.5" y="10" width="5" height="6" rx="1" fill="#1D4ED8" />
    </svg>
  </div>
);

const CheckIcon = ({ className = '' }) => (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="none" className={className}>
    <path d="M1.5 4.5l2 2 4-4" stroke="currentColor" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CrossIcon = () => (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
    <path d="M2 7l5-5M7 7L2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="#FBBF24">
    <path d="M6 1l1.3 3.7H11L8.2 6.9l1 3.5L6 8.5l-3.2 1.9 1-3.5L1 4.7h3.7z" />
  </svg>
);

const PlayIcon = () => (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="white">
    <path d="M2 1.5l6 3-6 3V1.5z" />
  </svg>
);

// ─── Eyebrow pill ────────────────────────────────────────────
const Eyebrow = ({ text, dotColor = 'bg-blue-400', textColor = 'text-blue-400',
  borderColor = 'border-blue-500/30', bgColor = 'bg-blue-600/10', className = '' }) => (
  <div className={`inline-flex items-center gap-2 border rounded-full px-3.5 py-1.5
    ${bgColor} ${borderColor} ${className}`}>
    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotColor}`} />
    <span className={`text-[11px] font-semibold tracking-[0.4px] font-dm ${textColor}`}>{text}</span>
  </div>
);

// ─── Trust strip ─────────────────────────────────────────────
const TrustItem = ({ text }) => (
  <div className="flex items-center gap-1.5 text-[12px] text-white/25 font-dm">
    <span className="w-1 h-1 rounded-full bg-emerald-400" />
    {text}
  </div>
);

const TrustSep = () => <div className="w-px h-3 bg-white/10" />;

// ─── Nav ─────────────────────────────────────────────────────
<NavBar />

// ─── Billing toggle ──────────────────────────────────────────
const BillingToggle = ({ billing, onChange }) => {
  const isAnnual = billing === 'annual';
  return (
    <div className="inline-flex items-center gap-3.5 bg-white/[0.04] border border-white/[0.08]
      rounded-full px-5 py-2 mb-14">
      <span
        onClick={() => onChange('monthly')}
        className={`text-[13px] font-medium cursor-pointer transition-colors duration-200 font-dm select-none
          ${!isAnnual ? 'text-white font-semibold' : 'text-white/40 hover:text-white/60'}`}>
        Monthly
      </span>
      {/* Track */}
      <button
        onClick={() => onChange(isAnnual ? 'monthly' : 'annual')}
        className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0
          ${isAnnual ? 'bg-emerald-500' : 'bg-blue-600'}`}
      >
        <span className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full
          shadow-sm transition-transform duration-300
          ${isAnnual ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
      <span
        onClick={() => onChange('annual')}
        className={`text-[13px] font-medium cursor-pointer transition-colors duration-200 font-dm select-none
          ${isAnnual ? 'text-white font-semibold' : 'text-white/40 hover:text-white/60'}`}>
        Annual
      </span>
      <span className="bg-emerald-500/15 border border-emerald-500/25 rounded-full
        px-2.5 py-1 text-[11px] font-bold text-emerald-400 font-dm">
        Save 25%
      </span>
    </div>
  );
};

// ─── Plan data ───────────────────────────────────────────────
const PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    tagline: 'For new schools just getting started with digital management.',
    monthlyPrice: 299,
    annualPrice: 224,
    accent: 'blue',
    btnLabel: 'Start free trial →',
    featured: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L16 6V14L10 18L4 14V6L10 2Z" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
    features: [
      { text: 'Up to 1 school & 5 instructors', included: true },
      { text: 'Up to 50 students', included: true },
      { text: 'Smart scheduling & calendar', included: true },
      { text: 'Basic student tracking', included: true },
      { text: 'Manual invoicing', included: true },
      { text: 'Email support', included: true },
      { text: 'SMS reminders', included: false },
      { text: 'Analytics dashboard', included: false },
      { text: 'AI insights', included: false },
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    tagline: 'For growing schools ready to automate everything and scale.',
    monthlyPrice: 699,
    annualPrice: 524,
    accent: 'purple',
    btnLabel: 'Start free trial →',
    featured: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2l1.8 5.4H18l-4.9 3.5 1.8 5.6L10 13l-4.9 3.5 1.8-5.6L2 7.4h6.2z"
          stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    ),
    features: [
      { text: 'Everything in Starter, plus:', included: true, highlight: true },
      { text: 'Up to 3 schools & unlimited instructors', included: true },
      { text: 'Up to 300 students', included: true },
      { text: 'SMS & email reminders', included: true },
      { text: 'Auto invoicing & payments', included: true },
      { text: 'Full analytics dashboard', included: true },
      { text: 'Student progress reports', included: true },
      { text: 'Priority chat support', included: true },
      { text: 'AI scheduling optimizer', included: false },
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    tagline: 'For school networks managing operations at scale.',
    monthlyPrice: 1499,
    annualPrice: 1124,
    accent: 'cyan',
    btnLabel: 'Contact sales →',
    featured: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2l1.5 4h4L12 8.5l1.5 4.5L10 10.5l-3.5 2.5L8 8.5 4.5 6h4z"
          stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2" />
      </svg>
    ),
    features: [
      { text: 'Everything in Pro, plus:', included: true, highlight: true },
      { text: 'Unlimited schools & students', included: true },
      { text: 'AI scheduling optimizer', included: true },
      { text: 'Custom branding & white-label', included: true },
      { text: 'API access & integrations', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'SLA & 99.9% uptime guarantee', included: true },
      { text: '24/7 priority phone support', included: true },
    ],
  },
];

// accent color maps
const ACCENT = {
  blue: {
    iconBg: 'bg-blue-600/18 text-blue-400',
    nameTxt: 'text-blue-400',
    checkBg: 'bg-blue-600/18 text-blue-400',
    btn: 'bg-blue-600/18 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 hover:text-white hover:border-blue-500/50',
    glow: 'bg-blue-600/10',
    glowPos: 'top-0 left-0',
  },
  purple: {
    iconBg: 'bg-violet-600/20 text-violet-400',
    nameTxt: 'text-violet-400',
    checkBg: 'bg-violet-600/20 text-violet-400',
    btn: 'bg-violet-700 text-white border-none shadow-[0_8px_24px_rgba(124,58,237,0.3)] hover:bg-violet-600 hover:shadow-[0_12px_32px_rgba(124,58,237,0.45)] hover:-translate-y-px',
    glow: 'bg-violet-600/15',
    glowPos: 'top-0 left-1/2 -translate-x-1/2',
  },
  cyan: {
    iconBg: 'bg-cyan-600/16 text-cyan-400',
    nameTxt: 'text-cyan-400',
    checkBg: 'bg-cyan-600/16 text-cyan-400',
    btn: 'bg-cyan-600/15 text-cyan-400 border border-cyan-600/25 hover:bg-cyan-600/25 hover:text-white hover:border-cyan-500/40',
    glow: 'bg-cyan-500/8',
    glowPos: 'top-0 right-0',
  },
};

// ─── Plan card ───────────────────────────────────────────────
const PlanCard = ({ plan, billing }) => {
  const a = ACCENT[plan.accent];
  const price = billing === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  const annualTotal = (plan.annualPrice * 12).toLocaleString();

  return (
    <div className={[
      'relative flex flex-col rounded-[22px] p-7 transition-all duration-300 overflow-hidden',
      'border hover:-translate-y-1.5',
      plan.featured
        ? 'bg-gradient-to-b from-[#0F1A2E] to-[#13173a] border-violet-700/80 hover:border-violet-500'
        : 'bg-[#0F1A2E] border-white/[0.08] hover:border-white/[0.14]',
    ].join(' ')}
      style={{ boxShadow: plan.featured ? '0 20px 60px rgba(124,58,237,0.15)' : undefined }}
    >
      {/* Glow orb */}
      <div className={`absolute pointer-events-none w-48 h-48 rounded-full -top-12 -right-10 ${a.glow}`}
        style={{ background: `radial-gradient(circle, ${plan.accent === 'blue' ? 'rgba(37,99,235,0.12)' : plan.accent === 'purple' ? 'rgba(124,58,237,0.16)' : 'rgba(6,182,212,0.1)'} 0%, transparent 70%)` }} />

      {/* Popular badge */}
      {plan.featured && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-700 to-violet-500
          rounded-b-xl px-4 py-1.5 text-[11px] font-bold text-white tracking-[0.4px] whitespace-nowrap z-10">
          ✦ Most popular
        </div>
      )}

      {/* Icon */}
      <div className={`relative z-10 w-11 h-11 rounded-xl flex items-center justify-center
        mb-5 ${plan.featured ? 'mt-4' : ''} ${a.iconBg}`}>
        {plan.icon}
      </div>

      {/* Name & tagline */}
      <div className={`relative z-10 text-[12px] font-bold tracking-[0.7px] uppercase mb-2 font-dm ${a.nameTxt}`}>
        {plan.name}
      </div>
      <p className="relative z-10 text-[13px] text-white/40 leading-relaxed mb-6 font-dm">
        {plan.tagline}
      </p>

      {/* Price */}
      <div className="relative z-10 mb-6">
        <div className="flex items-start gap-1">
          <span className="text-[18px] font-bold text-white/55 mt-2 font-dm">MAD</span>
          <span className="font-sora text-[44px] font-black text-white tracking-[-2px] leading-none">
            {price.toLocaleString()}
          </span>
          <span className="text-[13px] font-medium text-white/30 self-end mb-1.5 ml-0.5 font-dm">/mo</span>
        </div>
        <p className="text-[11px] text-white/25 mt-1.5 font-dm">
          {billing === 'annual'
            ? <span>Billed as <span className="text-emerald-400 font-semibold">{annualTotal} MAD/yr</span> — save 25%</span>
            : 'Billed monthly'}
        </p>
      </div>

      {/* CTA */}
      <button className={`relative z-10 w-full py-3 rounded-xl text-[14px] font-bold
        transition-all duration-200 active:scale-[0.99] mb-6 font-dm ${a.btn}`}>
        {plan.btnLabel}
      </button>

      {/* Divider */}
      <div className="relative z-10 h-px bg-white/[0.06] mb-5" />

      {/* Features */}
      <div className="relative z-10 flex flex-col gap-2.5 flex-1">
        {plan.features.map((f, i) => (
          <div key={i} className={`flex items-start gap-2.5 text-[13px] font-dm
            ${f.included ? (f.highlight ? 'text-white/80' : 'text-white/60') : 'text-white/22'}`}>
            <div className={`w-[17px] h-[17px] rounded-[5px] flex items-center justify-center
              flex-shrink-0 mt-[1px] ${f.included ? a.checkBg : 'bg-white/[0.05] text-white/20'}`}>
              {f.included ? <CheckIcon /> : <CrossIcon />}
            </div>
            {f.highlight
              ? <span><strong className={`font-semibold ${a.nameTxt}`}>{f.text.split(',')[0]}</strong>{f.text.includes(',') ? f.text.slice(f.text.indexOf(',')) : ''}</span>
              : f.text}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Comparison table ─────────────────────────────────────────
const YES = () => <span className="text-emerald-400 text-[15px]">✓</span>;
const NO  = () => <span className="text-white/15 text-[15px]">—</span>;

const TABLE_ROWS = [
  { cat: 'SCHOOLS & USERS' },
  { label: 'Schools',      starter: '1',       pro: 'Up to 3',   enterprise: 'Unlimited' },
  { label: 'Students',     starter: '50',       pro: '300',       enterprise: 'Unlimited' },
  { label: 'Instructors',  starter: '5',        pro: 'Unlimited', enterprise: 'Unlimited' },
  { cat: 'SCHEDULING' },
  { label: 'Smart calendar',         starter: <YES/>, pro: <YES/>, enterprise: <YES/> },
  { label: 'Conflict detection',     starter: <YES/>, pro: <YES/>, enterprise: <YES/> },
  { label: 'AI scheduling optimizer',starter: <NO/>,  pro: <NO/>,  enterprise: <YES/> },
  { cat: 'COMMUNICATIONS' },
  { label: 'Email reminders',         starter: <YES/>, pro: <YES/>, enterprise: <YES/> },
  { label: 'SMS reminders',           starter: <NO/>,  pro: <YES/>, enterprise: <YES/> },
  { label: 'Custom message templates',starter: <NO/>,  pro: <YES/>, enterprise: <YES/> },
  { cat: 'PAYMENTS & BILLING' },
  { label: 'Manual invoicing', starter: <YES/>, pro: <YES/>, enterprise: <YES/> },
  { label: 'Auto invoicing',   starter: <NO/>,  pro: <YES/>, enterprise: <YES/> },
  { label: 'Payment plans',    starter: <NO/>,  pro: <YES/>, enterprise: <YES/> },
  { cat: 'ANALYTICS & REPORTS' },
  { label: 'Basic reports',              starter: <YES/>, pro: <YES/>, enterprise: <YES/> },
  { label: 'Advanced analytics',         starter: <NO/>,  pro: <YES/>, enterprise: <YES/> },
  { label: 'Custom reports & exports',   starter: <NO/>,  pro: <NO/>,  enterprise: <YES/> },
  { cat: 'PLATFORM & SUPPORT' },
  { label: 'API access',        starter: <NO/>,      pro: <NO/>,           enterprise: <YES/> },
  { label: 'White-label',       starter: <NO/>,      pro: <NO/>,           enterprise: <YES/> },
  { label: 'Support level',     starter: 'Email',    pro: 'Priority chat', enterprise: '24/7 phone' },
  { label: 'Uptime SLA',        starter: <NO/>,      pro: <NO/>,           enterprise: '99.9%' },
];

const ComparisonTable = () => (
  <section className="max-w-4xl mx-auto px-11 pb-20">
    <div className="text-center mb-10">
      <h2 className="font-sora text-[32px] font-black text-white tracking-[-1px] mb-3">
        Compare all features
      </h2>
      <p className="text-[14px] text-white/40 font-dm">See exactly what's included in each plan</p>
    </div>

    <div className="bg-[#0F1A2E] border border-white/[0.08] rounded-[18px] overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-4 bg-[#162035] border-b border-white/[0.07]">
        <div className="px-5 py-4 text-[11px] font-semibold text-white/40 tracking-[0.6px] font-dm">
          FEATURE
        </div>
        {['Starter', 'Pro ✦', 'Enterprise'].map((h, i) => (
          <div key={h} className={`px-5 py-4 text-center text-[12px] font-bold tracking-[0.5px] font-dm
            ${i === 1 ? 'text-violet-400' : 'text-white/40'}`}>
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      {TABLE_ROWS.map((row, i) => {
        if (row.cat) {
          return (
            <div key={i} className="grid grid-cols-4 bg-white/[0.02] border-b border-white/[0.05]">
              <div className="col-span-4 px-5 py-2.5 text-[10px] font-bold text-white/25
                tracking-[0.8px] font-dm">
                {row.cat}
              </div>
            </div>
          );
        }
        return (
          <div key={i}
            className="grid grid-cols-4 border-b border-white/[0.04] last:border-0
              hover:bg-white/[0.02] transition-colors duration-150 group">
            <div className="px-5 py-3.5 text-[13px] text-white/55 font-dm">{row.label}</div>
            <div className="px-5 py-3.5 text-[12px] text-white/55 text-center font-semibold font-dm">
              {row.starter}
            </div>
            <div className="px-5 py-3.5 text-[12px] text-white/65 text-center font-semibold font-dm
              bg-violet-600/[0.06] group-hover:bg-violet-600/[0.1]">
              {row.pro}
            </div>
            <div className="px-5 py-3.5 text-[12px] text-white/55 text-center font-semibold font-dm">
              {row.enterprise}
            </div>
          </div>
        );
      })}
    </div>
  </section>
);

// ─── FAQ ──────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: 'Can I try DriveIQ before paying?',
    a: 'Yes — every plan includes a full 14-day free trial with no credit card required. You get complete access to all features in your chosen plan. No limitations, no surprises.',
  },
  {
    q: 'Can I change my plan at any time?',
    a: 'Absolutely. You can upgrade or downgrade your plan at any time from your account settings. Upgrades take effect immediately; downgrades apply at the start of your next billing cycle.',
  },
  {
    q: 'How does the annual discount work?',
    a: 'When you switch to annual billing, you get 25% off the monthly price — paid as one annual charge. For example, the Pro plan goes from 699 MAD/mo to 524 MAD/mo (billed as 6,288 MAD/year).',
  },
  {
    q: 'What happens if I exceed my student limit?',
    a: "We'll notify you when you're approaching your limit and make it easy to upgrade. Your data is never at risk — you won't lose anything, you'll simply be prompted to move to a higher plan.",
  },
  {
    q: 'Is my data safe with DriveIQ?',
    a: 'Yes. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We perform daily backups and comply with local data protection regulations. Your student and school data is never sold or shared.',
  },
  {
    q: 'Do you offer discounts for new schools?',
    a: 'We offer special onboarding pricing for new driving schools in their first year. Contact our team to learn more about our school launch programme.',
  },
];

const FaqItem = ({ item, open, onToggle }) => (
  <div className={`border rounded-xl overflow-hidden transition-all duration-200 mb-2
    bg-[#0F1A2E] ${open ? 'border-violet-700/50' : 'border-white/[0.07] hover:border-white/[0.12]'}`}>
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-5 py-4 text-left gap-3"
    >
      <span className="text-[14px] font-semibold text-white/85 flex-1 font-dm">{item.q}</span>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
        transition-all duration-250
        ${open ? 'bg-violet-600/20 text-violet-400 rotate-180' : 'bg-white/[0.06] text-white/35'}`}>
        <ChevronDown />
      </div>
    </button>
    <div className={`overflow-hidden transition-all duration-350 ease-in-out
      ${open ? 'max-h-48 pb-5' : 'max-h-0'}`}>
      <p className="px-5 text-[13px] text-white/45 leading-relaxed font-dm">{item.a}</p>
    </div>
  </div>
);

const FaqSection = () => {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <section className="max-w-2xl mx-auto px-11 pb-20">
      <div className="text-center mb-10">
        <h2 className="font-sora text-[30px] font-black text-white tracking-[-0.8px] mb-3">
          Questions? Answered.
        </h2>
        <p className="text-[14px] text-white/40 font-dm">
          Everything you need to know before signing up.
        </p>
      </div>
      {FAQ_ITEMS.map((item, i) => (
        <FaqItem key={i} item={item} open={openIdx === i}
          onToggle={() => setOpenIdx(openIdx === i ? null : i)} />
      ))}
    </section>
  );
};

// ─── Social proof strip ───────────────────────────────────────
const SocialProof = () => (
  <div className="flex items-center justify-center gap-8 py-8 px-11 border-t border-b border-white/[0.06]
    bg-white/[0.015] mb-16 flex-wrap">
    {[
      { val: '248+', lbl: 'Schools active' },
      { val: '4.9',  lbl: '★ average rating' },
      { val: '14d',  lbl: 'Free trial, no card' },
      { val: '91%',  lbl: 'Avg pass rate' },
    ].map((s) => (
      <div key={s.val} className="text-center px-6 border-r border-white/[0.06] last:border-0">
        <div className="font-sora text-[26px] font-black text-white tracking-[-1px] leading-none mb-1">
          {s.val}
        </div>
        <div className="text-[11px] text-white/30 font-dm">{s.lbl}</div>
      </div>
    ))}
    <div className="flex items-center gap-2 px-6 border-r border-white/[0.06]">
      <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <StarIcon key={i} />)}</div>
      <span className="text-[12px] text-white/35 font-dm">400+ reviews</span>
    </div>
    <div className="flex items-center gap-2 px-6">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span className="text-[12px] text-white/35 font-dm">Live across Morocco</span>
    </div>
  </div>
);

// ─── Bottom CTA strip ─────────────────────────────────────────
const CtaStrip = () => (
  <div className="mx-11 mb-16 relative rounded-[22px] overflow-hidden border border-violet-700/25
    bg-gradient-to-br from-[#0F1A2E] via-[#13173a] to-[#0F1A2E]">
    {/* Orb */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-96 h-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 70%)' }} />
    </div>
    <div className="relative z-10 text-center px-12 py-16">
      <Eyebrow text="Start today" dotColor="bg-violet-400" textColor="text-violet-300"
        borderColor="border-violet-500/30" bgColor="bg-violet-600/10" className="mb-6 justify-center" />
      <h2 className="font-sora text-[40px] font-black text-white tracking-[-1.5px] leading-[1.1] mb-4">
        Ready to run your school{' '}
        <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400
          bg-clip-text text-transparent">
          on autopilot?
        </span>
      </h2>
      <p className="text-[15px] text-white/40 mb-10 leading-relaxed font-dm max-w-lg mx-auto">
        Join 248+ driving schools already saving hours every week.<br />
        No card required, full access for 14 days.
      </p>
      <div className="flex gap-3 justify-center items-center flex-wrap mb-8">
        <button className="px-8 py-3.5 bg-violet-700 hover:bg-violet-600 text-white text-[14px]
          font-bold rounded-xl transition-all duration-200 hover:-translate-y-0.5
          shadow-[0_8px_24px_rgba(124,58,237,0.25)] hover:shadow-[0_14px_32px_rgba(124,58,237,0.4)] font-dm">
          Start free with Pro
        </button>
        <button className="flex items-center gap-2 px-6 py-3.5 border border-white/15 rounded-xl
          bg-transparent text-white/70 text-[14px] font-medium hover:bg-white/[0.05]
          hover:text-white hover:border-white/30 transition-all duration-200 font-dm">
          <div className="w-5 h-5 rounded-full border border-white/25 flex items-center justify-center">
            <PlayIcon />
          </div>
          Watch 2-min demo
        </button>
      </div>
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <TrustItem text="No credit card" />
        <TrustSep />
        <TrustItem text="Cancel anytime" />
        <TrustSep />
        <TrustItem text="Setup in 5 minutes" />
        <TrustSep />
        <TrustItem text="SSL secured" />
      </div>
    </div>
  </div>
);

// ─── Footer ───────────────────────────────────────────────────
const Footer = () => (
  <footer className="px-11 py-6 border-t border-white/[0.06] flex items-center
    justify-between flex-wrap gap-4">
    <div className="flex items-center gap-2">
      <LogoMark size={24} />
      <span className="font-sora text-[13px] font-bold text-white/35">DriveIQ © 2026</span>
    </div>
    <div className="flex gap-5">
      {['Privacy', 'Terms', 'Contact', 'Status'].map((l) => (
        <a key={l} href="#"
          className="text-[12px] text-white/20 hover:text-white/50 transition-colors font-dm">
          {l}
        </a>
      ))}
    </div>
    <span className="text-[11px] text-white/15 font-dm">Made with care in Morocco 🇲🇦</span>
  </footer>
);

// ─── Hero section ─────────────────────────────────────────────
const PricingHero = ({ billing, onBillingChange }) => (
  <section className="relative px-11 pt-20 pb-14 text-center overflow-hidden">
    {/* Bg layers */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(37,99,235,1) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,1) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
      <div className="absolute w-[520px] h-[520px] rounded-full -top-40 left-1/2 -translate-x-1/2"
        style={{ background: 'radial-gradient(circle,rgba(37,99,235,0.14) 0%,transparent 70%)' }} />
      <div className="absolute w-72 h-72 rounded-full top-0 right-20"
        style={{ background: 'radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 70%)' }} />
      <div className="absolute w-56 h-56 rounded-full top-0 left-20"
        style={{ background: 'radial-gradient(circle,rgba(6,182,212,0.07) 0%,transparent 70%)' }} />
    </div>

    <div className="relative z-10">
      <Eyebrow text="Simple, transparent pricing" className="mb-6 justify-center" />
      <h1 className="font-sora text-[50px] font-black text-white tracking-[-2px] leading-[1.07] mb-5">
        One price.<br />
        <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400
          bg-clip-text text-transparent">
          No surprises.
        </span>
      </h1>
      <p className="text-[16px] text-white/45 max-w-lg mx-auto mb-10 leading-relaxed font-dm">
        Start free. Scale as you grow. Every plan includes a 14-day trial with full access — no card required.
      </p>
      <div className="flex justify-center">
        <BillingToggle billing={billing} onChange={onBillingChange} />
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────
const Pricing = () => {
  const [billing, setBilling] = useState('monthly');

  return (
    <div className="min-h-screen bg-[#060B18] font-dm text-white overflow-x-hidden">
      <NavBar />
      <PricingHero billing={billing} onBillingChange={setBilling} />

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto px-11 mb-20">
        {PLANS.map((plan) => (
          <PlanCard key={plan.key} plan={plan} billing={billing} />
        ))}
      </div>

      <SocialProof />
      <ComparisonTable />
      <FaqSection />
      <CtaStrip />
      <Footer />
    </div>
  );
};

export default Pricing;