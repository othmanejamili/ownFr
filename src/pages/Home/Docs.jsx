// Docs.jsx — DriveOJ documentation page
// Same design system: #060B18 bg · Sora + DM Sans · indigo/violet/emerald accents
// Stack: React 18 + Tailwind CSS v3

import { useState } from 'react';
import NavBar from './NavBar';
import Footer from './Footer';
// ── Shared primitives ────────────────────────────────────────
const LogoMark = ({ size = 32 }) => (
  <div className="bg-blue-600 flex items-center justify-center flex-shrink-0"
    style={{ width: size, height: size, borderRadius: Math.round(size * 0.28) }}>
    <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 18 18" fill="none">
      <path d="M9 2L15 7.5V16H3V7.5L9 2Z" fill="white" />
      <rect x="6.5" y="10" width="5" height="6" rx="1" fill="#1D4ED8" />
    </svg>
  </div>
);

const Eyebrow = ({ text, dotColor = 'bg-blue-400', textColor = 'text-blue-400',
  borderColor = 'border-blue-500/30', bgColor = 'bg-blue-600/10', className = '' }) => (
  <div className={`inline-flex items-center gap-2 border rounded-full px-3.5 py-1.5
    ${bgColor} ${borderColor} ${className}`}>
    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotColor}`} />
    <span className={`text-[11px] font-semibold tracking-[0.4px] font-dm ${textColor}`}>{text}</span>
  </div>
);

// ── Icons ────────────────────────────────────────────────────
const Icons = {
  Book:      () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2h5a2 2 0 0 1 2 2v9H3a1 1 0 0 1-1-1V2z" stroke="currentColor" strokeWidth="1.2"/><path d="M9 4h4a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H9V4z" stroke="currentColor" strokeWidth="1.2"/></svg>,
  Rocket:    () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2C8 2 5 5 5 9a3 3 0 0 0 6 0c0-4-3-7-3-7z" stroke="currentColor" strokeWidth="1.2"/><path d="M5 9l-2 3M11 9l2 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  Code:      () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 5L2 8l3 3M11 5l3 3-3 3M9 3l-2 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Settings:  () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>,
  Calendar:  () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 6h14M5 1v2M11 1v2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>,
  Star:      () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.8 5h5.2l-4.2 3 1.6 5L8 11.5 3.6 14l1.6-5L1 6h5.2z" stroke="currentColor" strokeWidth="1.1"/></svg>,
  Users:     () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 14c0-2.8 2.2-4.5 5-4.5s5 1.7 5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.1"/><path d="M14 14c0-2.2-1.3-3.5-3-4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>,
  Message:   () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 2H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h3l2 2.5L10 11h3a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" stroke="currentColor" strokeWidth="1.2"/></svg>,
  Revenue:   () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2"/><path d="M8 4v8M6 6h3a1 1 0 0 1 0 2H7a1 1 0 0 0 0 2h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>,
  Key:       () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="5.5" cy="7.5" r="3.5" stroke="currentColor" strokeWidth="1.2"/><path d="M8.5 7.5h6M12.5 7.5v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  Webhook:   () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="4" cy="12" r="2" stroke="currentColor" strokeWidth="1.1"/><circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.1"/><circle cx="8" cy="3" r="2" stroke="currentColor" strokeWidth="1.1"/><path d="M8 5l-4 5M8 5l4 5M4 10l4-5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
  ChevRight: () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Search:    () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  ExternalLink: () => <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5 2H2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/><path d="M7 1h3v3M10 1L5.5 5.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

// ── Sidebar nav data ─────────────────────────────────────────
const NAV_SECTIONS = [
  {
    section: 'Getting started',
    accent: 'blue',
    items: [
      { label: 'Introduction',         slug: 'introduction',     active: true },
      { label: 'Quick start (5 min)',   slug: 'quickstart' },
      { label: 'Core concepts',         slug: 'concepts' },
      { label: 'Your first school',     slug: 'first-school' },
    ],
  },
  {
    section: 'School management',
    accent: 'violet',
    items: [
      { label: 'Adding students',       slug: 'students' },
      { label: 'Managing instructors',  slug: 'instructors' },
      { label: 'Vehicle fleet',         slug: 'vehicles' },
      { label: 'School settings',       slug: 'school-settings' },
    ],
  },
  {
    section: 'Scheduling',
    accent: 'emerald',
    items: [
      { label: 'Creating lessons',      slug: 'lessons' },
      { label: 'Calendar view',         slug: 'calendar' },
      { label: 'AI auto-scheduling',    slug: 'ai-scheduling',    badge: 'New' },
      { label: 'Conflict detection',    slug: 'conflicts' },
    ],
  },
  {
    section: 'Payments & invoicing',
    accent: 'amber',
    items: [
      { label: 'Invoice creation',      slug: 'invoices' },
      { label: 'Payment tracking',      slug: 'payments' },
      { label: 'Revenue reports',       slug: 'revenue' },
      { label: 'Subscription plans',    slug: 'subscriptions' },
    ],
  },
  {
    section: 'Communications',
    accent: 'cyan',
    items: [
      { label: 'SMS reminders',         slug: 'sms' },
      { label: 'Email templates',       slug: 'email' },
      { label: 'Announcement centre',   slug: 'announcements' },
    ],
  },
  {
    section: 'API reference',
    accent: 'rose',
    items: [
      { label: 'Authentication',        slug: 'auth' },
      { label: 'Endpoints overview',    slug: 'endpoints' },
      { label: 'Webhooks',              slug: 'webhooks',         badge: 'Beta' },
      { label: 'Rate limits',           slug: 'rate-limits' },
    ],
  },
];

const ACCENT_DOT = {
  blue:   'bg-blue-500', violet: 'bg-violet-500', emerald: 'bg-emerald-500',
  amber:  'bg-amber-500', cyan:   'bg-cyan-500',  rose:    'bg-rose-500',
};
const ACCENT_ACTIVE = {
  blue:   'text-blue-400 bg-blue-600/10',
  violet: 'text-violet-400 bg-violet-600/10',
  emerald:'text-emerald-400 bg-emerald-600/10',
  amber:  'text-amber-400 bg-amber-600/10',
  cyan:   'text-cyan-400 bg-cyan-600/10',
  rose:   'text-rose-400 bg-rose-600/10',
};
const BADGE_ACCENT = {
  New:  'bg-blue-600/20 text-blue-400',
  Beta: 'bg-amber-600/20 text-amber-400',
};

// ── Main content cards ───────────────────────────────────────
const QUICK_CARDS = [
  { icon: 'Rocket', accent: 'blue',   title: 'Quick start',       desc: 'Get your school set up and running your first lesson in under 5 minutes.',    link: 'Read guide' },
  { icon: 'Users',  accent: 'violet', title: 'Add your team',     desc: 'Invite instructors, set their availability, and assign vehicles to schedules.', link: 'Read guide' },
  { icon: 'Code',   accent: 'emerald',title: 'API access',        desc: 'Connect DriveOJ to your own systems using our REST API and webhooks.',          link: 'View docs' },
  { icon: 'Star',   accent: 'cyan',   title: 'AI scheduling',     desc: 'Let DriveOJ fill your calendar automatically based on availability and demand.',  link: 'Learn more' },
];

const QC_ACCENT = {
  blue:    { icon: 'bg-blue-600/15 text-blue-400',    border: 'border-blue-500/20 hover:border-blue-500/40',    label: 'text-blue-400' },
  violet:  { icon: 'bg-violet-600/15 text-violet-400', border: 'border-violet-500/20 hover:border-violet-500/40', label: 'text-violet-400' },
  emerald: { icon: 'bg-emerald-600/15 text-emerald-400',border:'border-emerald-500/20 hover:border-emerald-500/40',label:'text-emerald-400'},
  cyan:    { icon: 'bg-cyan-600/15 text-cyan-400',    border: 'border-cyan-500/20 hover:border-cyan-500/40',    label: 'text-cyan-400' },
};

// ── Code block ───────────────────────────────────────────────
const CodeBlock = ({ code, lang = 'bash' }) => (
  <div className="bg-[#060B18] border border-white/[0.07] rounded-xl overflow-hidden mt-4 mb-6">
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
      <span className="text-[10px] font-mono text-white/30 font-semibold tracking-widest uppercase">{lang}</span>
      <button className="text-[10px] text-white/25 hover:text-white/60 font-dm transition-colors">Copy</button>
    </div>
    <pre className="px-4 py-4 overflow-x-auto">
      <code className="text-[12px] text-emerald-300 font-mono leading-relaxed">{code}</code>
    </pre>
  </div>
);

// ── Alert box ────────────────────────────────────────────────
const Alert = ({ type = 'info', children }) => {
  const styles = {
    info:    { wrap: 'bg-blue-600/8 border-blue-500/20', icon: 'text-blue-400', dot: 'bg-blue-500' },
    tip:     { wrap: 'bg-emerald-600/8 border-emerald-500/20', icon: 'text-emerald-400', dot: 'bg-emerald-500' },
    warning: { wrap: 'bg-amber-600/8 border-amber-500/20', icon: 'text-amber-400', dot: 'bg-amber-500' },
  };
  const s = styles[type];
  return (
    <div className={`flex gap-3 border rounded-xl px-4 py-3.5 mb-4 ${s.wrap}`}>
      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${s.dot}`} />
      <p className="text-[13px] text-white/60 font-dm leading-relaxed">{children}</p>
    </div>
  );
};

// ── Docs content (Introduction page) ─────────────────────────
const DocsContent = ({ activeSlug }) => (
  <div className="flex-1 min-w-0">
    {/* Breadcrumb */}
    <div className="flex items-center gap-1.5 text-[11px] text-white/25 font-dm mb-6">
      <span>Docs</span>
      <Icons.ChevRight />
      <span>Getting started</span>
      <Icons.ChevRight />
      <span className="text-white/60">Introduction</span>
    </div>

    {/* Page header */}
    <div className="mb-8">
      <Eyebrow text="Getting started" className="mb-4" />
      <h1 className="font-sora text-[32px] font-black text-white tracking-[-1px] mb-3">
        Welcome to DriveOJ
      </h1>
      <p className="text-[15px] text-white/45 leading-relaxed font-dm max-w-xl">
        DriveOJ is a platform that helps driving schools manage students, instructors, schedules, payments, and communications — all in one place.
      </p>
    </div>

    {/* Quick start cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
      {QUICK_CARDS.map(card => {
        const a = QC_ACCENT[card.accent];
        const IconComp = Icons[card.icon];
        return (
          <div key={card.title}
            className={`bg-[#0F1A2E] border ${a.border} rounded-[14px] p-5 cursor-pointer
              group transition-all duration-200 hover:-translate-y-0.5`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${a.icon}`}>
              {IconComp && <IconComp />}
            </div>
            <div className="font-sora text-[14px] font-bold text-white mb-1.5">{card.title}</div>
            <p className="text-[12px] text-white/40 leading-relaxed mb-3 font-dm">{card.desc}</p>
            <span className={`text-[12px] font-semibold font-dm ${a.label} group-hover:underline underline-offset-2`}>
              {card.link} →
            </span>
          </div>
        );
      })}
    </div>

    {/* Section divider */}
    <div className="h-px bg-white/[0.06] mb-8" />

    {/* What is DriveOJ */}
    <h2 className="font-sora text-[20px] font-bold text-white tracking-[-0.5px] mb-4">
      What is DriveOJ?
    </h2>
    <p className="text-[14px] text-white/50 leading-relaxed mb-4 font-dm">
      DriveOJ is built specifically for driving schools across Morocco and the MENA region. It handles the full student lifecycle — from enrollment and scheduling through to exam prep and invoicing — so school owners and instructors can focus on teaching.
    </p>
    <Alert type="tip">
      DriveOJ works for both single-location schools and multi-branch networks. Your plan determines how many schools, students, and instructors you can manage.
    </Alert>

    {/* Architecture */}
    <h2 className="font-sora text-[20px] font-bold text-white tracking-[-0.5px] mb-4 mt-8">
      Key concepts
    </h2>
    <div className="flex flex-col gap-3 mb-8">
      {[
        { label: 'School',      desc: 'The top-level entity. You can own multiple schools on Pro or Enterprise plans.',       accent: 'bg-blue-600/15 text-blue-400' },
        { label: 'Student',     desc: 'Enrolled learners. Each student has a profile with progress, documents, and history.',  accent: 'bg-violet-600/15 text-violet-400' },
        { label: 'Instructor',  desc: 'Teaching staff. Instructors are assigned lessons and linked to vehicles.',               accent: 'bg-emerald-600/15 text-emerald-400' },
        { label: 'Lesson',      desc: 'A scheduled session — either theory or driving — with a start time, duration, and status.', accent: 'bg-cyan-600/15 text-cyan-400' },
        { label: 'Vehicle',     desc: 'A car or motorbike in your fleet. Vehicles are booked per lesson to prevent conflicts.',  accent: 'bg-amber-600/15 text-amber-400' },
      ].map(item => (
        <div key={item.label} className="flex gap-3 items-start bg-[#0F1A2E] border border-white/[0.05]
          rounded-xl px-4 py-3.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 flex-shrink-0 font-dm ${item.accent}`}>
            {item.label}
          </span>
          <p className="text-[13px] text-white/50 font-dm leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>

    {/* Install */}
    <h2 className="font-sora text-[20px] font-bold text-white tracking-[-0.5px] mb-4">
      Installation (API / SDK)
    </h2>
    <p className="text-[14px] text-white/50 leading-relaxed mb-2 font-dm">
      If you're integrating DriveOJ programmatically, install the client SDK:
    </p>
    <CodeBlock lang="bash" code={`npm install @driveOJ/sdk\n# or\npip install driveOJ`} />

    <Alert type="info">
      The DriveOJ REST API uses JWT Bearer tokens. See the <span className="text-blue-400 cursor-pointer">Authentication</span> guide for details.
    </Alert>

    <CodeBlock lang="javascript" code={`import DriveOJ from '@driveOJ/sdk';

const client = new DriveOJ({
  baseURL: 'https://api.driveOJ.ma',
  token: process.env.DRIVEOJ_TOKEN,
});

// Fetch all students for a school
const students = await client.students.list({ school_id: 'sch_abc123' });
console.log(students.results);`} />

    {/* Next steps */}
    <h2 className="font-sora text-[20px] font-bold text-white tracking-[-0.5px] mb-4 mt-8">
      Next steps
    </h2>
    <div className="flex flex-col gap-2 mb-10">
      {[
        { label: 'Quick start guide',           sub: '5 min setup walkthrough',               slug: 'quickstart',   color: 'text-blue-400' },
        { label: 'Scheduling your first lesson', sub: 'Create a lesson with a student + car',  slug: 'lessons',      color: 'text-violet-400' },
        { label: 'Setting up SMS reminders',     sub: 'Reduce no-shows automatically',         slug: 'sms',          color: 'text-emerald-400' },
        { label: 'API authentication',           sub: 'Connect your own apps',                  slug: 'auth',         color: 'text-cyan-400' },
      ].map(item => (
        <div key={item.label}
          className="flex items-center gap-3 bg-[#0F1A2E] border border-white/[0.06]
            hover:border-white/[0.12] rounded-xl px-4 py-3.5 cursor-pointer group
            transition-all duration-150">
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-white font-dm">{item.label}</div>
            <div className="text-[11px] text-white/30 font-dm">{item.sub}</div>
          </div>
          <span className={`text-[12px] font-dm ${item.color} group-hover:translate-x-0.5 transition-transform duration-150`}>→</span>
        </div>
      ))}
    </div>

    {/* Page footer nav */}
    <div className="flex items-center justify-between pt-6 border-t border-white/[0.06]">
      <div className="text-[12px] text-white/20 font-dm">← Previous</div>
      <div className="text-[12px] text-blue-400 font-semibold font-dm cursor-pointer hover:text-blue-300">
        Quick start →
      </div>
    </div>
  </div>
);

// ── Docs sidebar ─────────────────────────────────────────────
const DocsSidebar = ({ activeSlug, onSelect }) => (
  <aside className="w-[220px] flex-shrink-0 hidden lg:flex flex-col sticky top-0
    h-screen overflow-y-auto bg-[#0B1221] border-r border-white/[0.06] py-4">
    {/* Search */}
    <div className="px-4 mb-4">
      <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07]
        rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.06] transition-colors">
        <Icons.Search />
        <span className="text-[12px] text-white/25 font-dm">Search docs…</span>
        <span className="ml-auto text-[10px] text-white/15 font-mono border border-white/10
          rounded px-1.5 py-0.5">⌘K</span>
      </div>
    </div>

    {NAV_SECTIONS.map(section => (
      <div key={section.section} className="mb-1">
        <div className="px-4 py-2 flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${ACCENT_DOT[section.accent]}`} />
          <span className="text-[10px] font-bold text-white/25 tracking-[0.8px] font-dm uppercase">
            {section.section}
          </span>
        </div>
        {section.items.map(item => (
          <button key={item.slug}
            onClick={() => onSelect(item.slug)}
            className={[
              'w-full flex items-center gap-2 px-4 py-2 mx-0 text-left transition-all duration-150',
              'text-[12px] font-dm font-medium',
              item.slug === activeSlug
                ? `${ACCENT_ACTIVE[section.accent]} font-semibold`
                : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]',
            ].join(' ')}>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${BADGE_ACCENT[item.badge] ?? ''}`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    ))}

    {/* Bottom links */}
    <div className="mt-auto px-4 pt-4 border-t border-white/[0.06] space-y-2">
      {[
        { label: 'Changelog', icon: 'Star' },
        { label: 'GitHub',    icon: 'Code' },
        { label: 'Status',    icon: 'Key' },
      ].map(item => {
        const IconComp = Icons[item.icon];
        return (
          <button key={item.label}
            className="w-full flex items-center gap-2.5 text-[11px] text-white/25
              hover:text-white/55 font-dm transition-colors py-1">
            {IconComp && <IconComp />}
            {item.label}
            <Icons.ExternalLink />
          </button>
        );
      })}
    </div>
  </aside>
);

// ── Right TOC ────────────────────────────────────────────────
const TableOfContents = () => (
  <aside className="w-[180px] flex-shrink-0 hidden xl:flex flex-col sticky top-0 h-screen
    overflow-y-auto py-6 pl-4 border-l border-white/[0.05]">
    <div className="text-[10px] font-bold text-white/25 tracking-[0.8px] font-dm uppercase mb-3">
      On this page
    </div>
    {[
      'What is DriveOJ?',
      'Key concepts',
      'Installation',
      'Next steps',
    ].map(item => (
      <button key={item}
        className="text-left text-[11px] text-white/30 hover:text-white/70 font-dm
          py-1.5 transition-colors leading-snug border-l-2 border-transparent
          hover:border-blue-500/50 pl-2 -ml-px">
        {item}
      </button>
    ))}
  </aside>
);

// ── Footer ───────────────────────────────────────────────────
<Footer />

// ── Root ─────────────────────────────────────────────────────
const Docs = () => {
  const [activeSlug, setActiveSlug] = useState('introduction');

  return (
    <div className="min-h-screen bg-[#060B18] font-dm text-white overflow-x-hidden flex flex-col">
      <NavBar />

      {/* ── HERO STRIP ── */}
      <div className="relative border-b border-white/[0.06] bg-[#060B18] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(37,99,235,0.1) 0%, transparent 60%)' }} />
        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-11 py-10">
          <Eyebrow text="Documentation" className="mb-4" />
          <h1 className="font-sora text-[34px] md:text-[42px] font-black text-white tracking-[-1.5px] mb-3">
            DriveOJ Docs
          </h1>
          <p className="text-[14px] text-white/40 font-dm max-w-lg">
            Everything you need to set up, manage, and integrate your driving school platform.
          </p>
          {/* Quick search */}
          <div className="mt-5 flex items-center gap-2 bg-[#0F1A2E] border border-white/[0.08]
            rounded-xl px-4 py-3 max-w-sm cursor-pointer hover:border-blue-500/30 transition-colors group">
            <Icons.Search />
            <span className="text-[13px] text-white/25 font-dm flex-1 group-hover:text-white/40 transition-colors">
              Search documentation…
            </span>
            <span className="text-[10px] text-white/15 font-mono border border-white/10
              rounded px-1.5 py-0.5">⌘K</span>
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT: sidebar + content + TOC ── */}
      <div className="flex flex-1 min-h-0">
        <DocsSidebar activeSlug={activeSlug} onSelect={setActiveSlug} />

        {/* Scrollable content area */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="flex gap-8 max-w-4xl mx-auto px-6 md:px-10 py-10">
            <DocsContent activeSlug={activeSlug} />
            <TableOfContents />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Docs;