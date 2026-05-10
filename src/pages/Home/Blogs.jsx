// Blog.jsx — DriveIQ blog page
// Same design system: #060B18 bg · Sora + DM Sans · indigo/violet/emerald accents
// Stack: React 18 + Tailwind CSS v3

import { useState } from 'react';
import NavBar from './NavBar';

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

const TrustItem = ({ text }) => (
  <div className="flex items-center gap-1.5 text-[12px] text-white/25 font-dm">
    <span className="w-1 h-1 rounded-full bg-emerald-400" />{text}
  </div>
);
const TrustSep = () => <div className="w-px h-3 bg-white/10" />;

// ── Tag chip ─────────────────────────────────────────────────
const TAG_STYLES = {
  Product:    'bg-blue-600/15 text-blue-400 border-blue-500/20',
  Guide:      'bg-violet-600/15 text-violet-400 border-violet-500/20',
  Industry:   'bg-emerald-600/15 text-emerald-400 border-emerald-500/20',
  Feature:    'bg-cyan-600/15 text-cyan-400 border-cyan-500/20',
  Tips:       'bg-amber-600/15 text-amber-400 border-amber-500/20',
  Update:     'bg-rose-600/15 text-rose-400 border-rose-500/20',
};
const Tag = ({ label }) => (
  <span className={`inline-block text-[10px] font-bold tracking-[0.4px] px-2 py-0.5 rounded-full border font-dm
    ${TAG_STYLES[label] ?? 'bg-white/5 text-white/40 border-white/10'}`}>
    {label}
  </span>
);

// ── Data ─────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Product', 'Guide', 'Industry', 'Feature', 'Tips', 'Update'];

const FEATURED = {
  tag: 'Product',
  readTime: '6 min read',
  date: 'May 8, 2026',
  title: 'How DriveIQ cut admin time by 80% for Auto École Atlas',
  excerpt: 'We sat down with Karim Alaoui, owner of one of Casablanca\'s top-rated driving schools, to learn how switching to DriveIQ transformed his operations — from scheduling chaos to seamless automation.',
  author: { initials: 'KA', name: 'Karim Alaoui', role: 'School Owner · Atlas', color: 'bg-blue-600' },
  gradient: 'from-blue-600/20 via-violet-600/10 to-transparent',
  accentColor: 'text-blue-400',
  borderColor: 'border-blue-500/30',
};

const POSTS = [
  {
    tag: 'Guide', readTime: '8 min', date: 'May 5, 2026',
    title: 'Setting up your first automated lesson reminder in 5 minutes',
    excerpt: 'No-shows cost schools thousands of MAD a month. Here\'s how to set up SMS reminders that reduce absences by up to 60%.',
    author: { initials: 'DS', name: 'DriveIQ Team', role: 'Product', color: 'bg-violet-600' },
    accent: 'violet',
  },
  {
    tag: 'Industry', readTime: '5 min', date: 'Apr 28, 2026',
    title: 'Morocco\'s driving school industry: 2026 trends and what they mean for your school',
    excerpt: 'New licensing requirements, rising student demand, and digital-first expectations are reshaping how schools compete.',
    author: { initials: 'SA', name: 'Sara Andaloussi', role: 'Research', color: 'bg-emerald-700' },
    accent: 'emerald',
  },
  {
    tag: 'Feature', readTime: '4 min', date: 'Apr 20, 2026',
    title: 'Introducing AI scheduling: let DriveIQ fill your calendar automatically',
    excerpt: 'Our new AI optimizer analyzes instructor availability, student preferences, and vehicle schedules to suggest the perfect timetable.',
    author: { initials: 'DS', name: 'DriveIQ Team', role: 'Engineering', color: 'bg-cyan-700' },
    accent: 'cyan',
  },
  {
    tag: 'Tips', readTime: '6 min', date: 'Apr 14, 2026',
    title: '7 things top-rated instructors do differently (and how to track them)',
    excerpt: 'After analyzing 50,000 lessons on DriveIQ, we found clear patterns in what separates 4.9-star instructors from the rest.',
    author: { initials: 'YB', name: 'Youssef Bennis', role: 'Data', color: 'bg-amber-700' },
    accent: 'amber',
  },
  {
    tag: 'Update', readTime: '3 min', date: 'Apr 7, 2026',
    title: 'DriveIQ v2.4 — faster invoicing, bulk SMS, and a new student portal',
    excerpt: 'This sprint we focused on the three most-requested features from our school owners. Here\'s everything that shipped.',
    author: { initials: 'DS', name: 'DriveIQ Team', role: 'Product', color: 'bg-rose-700' },
    accent: 'rose',
  },
  {
    tag: 'Guide', readTime: '10 min', date: 'Mar 31, 2026',
    title: 'The complete guide to student progress tracking in DriveIQ',
    excerpt: 'From theory hours to driving tests — learn how to use progress dashboards to spot at-risk students before they fall behind.',
    author: { initials: 'FO', name: 'Fatima Ouazzani', role: 'Customer Success', color: 'bg-indigo-700' },
    accent: 'blue',
  },
];

const ACCENT_POST = {
  violet:  'border-violet-500/20 hover:border-violet-500/40',
  emerald: 'border-emerald-500/20 hover:border-emerald-500/40',
  cyan:    'border-cyan-500/20 hover:border-cyan-500/40',
  amber:   'border-amber-500/20 hover:border-amber-500/40',
  rose:    'border-rose-500/20 hover:border-rose-500/40',
  blue:    'border-blue-500/20 hover:border-blue-500/40',
};

// ── Featured post ────────────────────────────────────────────
const FeaturedPost = ({ post }) => (
  <div className={`relative rounded-[20px] border ${post.borderColor} bg-[#0F1A2E]
    overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1
    hover:border-blue-400/50`}
    style={{ boxShadow: '0 20px 60px rgba(37,99,235,0.08)' }}>
    {/* gradient bg */}
    <div className={`absolute inset-0 bg-gradient-to-br ${post.gradient} pointer-events-none`} />
    {/* grid texture */}
    <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
      style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

    <div className="relative z-10 p-8 md:p-10">
      <div className="flex items-center gap-3 mb-5">
        <Eyebrow text="Featured story" dotColor="bg-blue-400" textColor="text-blue-400"
          borderColor="border-blue-500/30" bgColor="bg-blue-600/10" />
        <Tag label={post.tag} />
        <span className="text-[11px] text-white/25 font-dm ml-auto">{post.readTime} · {post.date}</span>
      </div>

      <h2 className="font-sora text-[28px] md:text-[34px] font-black text-white tracking-[-1px]
        leading-[1.15] mb-4 max-w-2xl group-hover:text-blue-100 transition-colors duration-200">
        {post.title}
      </h2>
      <p className="text-[14px] text-white/45 leading-relaxed mb-7 max-w-xl font-dm">
        {post.excerpt}
      </p>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full ${post.author.color} flex items-center justify-center
            text-[10px] font-bold text-white flex-shrink-0`}>
            {post.author.initials}
          </div>
          <div>
            <div className="text-[12px] font-semibold text-white font-dm">{post.author.name}</div>
            <div className="text-[10px] text-white/30 font-dm">{post.author.role}</div>
          </div>
        </div>
        <span className={`text-[13px] font-semibold font-dm ${post.accentColor}
          group-hover:underline underline-offset-2`}>
          Read story →
        </span>
      </div>
    </div>
  </div>
);

// ── Post card ────────────────────────────────────────────────
const PostCard = ({ post }) => (
  <div className={`bg-[#0F1A2E] border ${ACCENT_POST[post.accent] ?? 'border-white/[0.07] hover:border-white/[0.14]'}
    rounded-[16px] p-6 flex flex-col cursor-pointer group transition-all duration-250 hover:-translate-y-1`}>
    <div className="flex items-center gap-2 mb-4">
      <Tag label={post.tag} />
      <span className="text-[10px] text-white/25 font-dm ml-auto">{post.readTime} · {post.date}</span>
    </div>
    <h3 className="font-sora text-[15px] font-bold text-white leading-snug mb-3
      group-hover:text-blue-100 transition-colors duration-200 flex-1">
      {post.title}
    </h3>
    <p className="text-[12px] text-white/40 leading-relaxed mb-5 font-dm line-clamp-3">
      {post.excerpt}
    </p>
    <div className="flex items-center gap-2 pt-4 border-t border-white/[0.05]">
      <div className={`w-6 h-6 rounded-full ${post.author.color} flex items-center justify-center
        text-[8px] font-bold text-white flex-shrink-0`}>
        {post.author.initials}
      </div>
      <span className="text-[11px] text-white/40 font-dm flex-1">{post.author.name}</span>
      <span className="text-[11px] text-white/30 font-dm group-hover:text-blue-400 transition-colors">→</span>
    </div>
  </div>
);

// ── Newsletter strip ─────────────────────────────────────────
const Newsletter = () => (
  <div className="max-w-4xl mx-auto px-6 md:px-11 mb-16">
    <div className="relative rounded-[20px] border border-violet-700/25 bg-[#0F1A2E] overflow-hidden px-8 py-10">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 65%)' }} />
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
        <div className="flex-1 text-center md:text-left">
          <Eyebrow text="Stay in the loop" dotColor="bg-violet-400" textColor="text-violet-300"
            borderColor="border-violet-500/30" bgColor="bg-violet-600/10" className="mb-3 justify-center md:justify-start" />
          <h3 className="font-sora text-[22px] font-black text-white tracking-[-0.5px] mb-1">
            Weekly insights for school owners
          </h3>
          <p className="text-[13px] text-white/40 font-dm">
            Tips, product updates, and industry news — every Thursday. No spam.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto flex-shrink-0">
          <input type="email" placeholder="your@email.com"
            className="flex-1 md:w-56 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10
              text-white text-[13px] placeholder-white/25 font-dm
              focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40
              transition-all duration-200" />
          <button className="px-5 py-2.5 bg-violet-700 hover:bg-violet-600 text-white text-[13px]
            font-bold rounded-xl transition-all duration-200 font-dm whitespace-nowrap
            shadow-[0_4px_16px_rgba(124,58,237,0.25)]">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ── Footer ───────────────────────────────────────────────────
const Footer = () => (
  <footer className="px-6 md:px-11 py-6 border-t border-white/[0.06] flex items-center
    justify-between flex-wrap gap-4">
    <div className="flex items-center gap-2">
      <LogoMark size={24} />
      <span className="font-sora text-[13px] font-bold text-white/35">DriveIQ © 2026</span>
    </div>
    <div className="flex gap-5">
      {['Privacy','Terms','Contact','Status'].map(l => (
        <a key={l} href="#"
          className="text-[12px] text-white/20 hover:text-white/50 transition-colors font-dm">{l}</a>
      ))}
    </div>
    <span className="text-[11px] text-white/15 font-dm">Made with care in Morocco 🇲🇦</span>
  </footer>
);

// ── Root ─────────────────────────────────────────────────────
const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? POSTS
    : POSTS.filter(p => p.tag === activeCategory);

  return (
    <div className="min-h-screen bg-[#060B18] font-dm text-white overflow-x-hidden">
      <NavBar />

      {/* ── HERO ── */}
      <section className="relative px-6 md:px-11 pt-20 pb-12 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgba(37,99,235,1) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,1) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
          <div className="absolute w-[480px] h-[480px] rounded-full -top-32 left-1/2 -translate-x-1/2"
            style={{ background: 'radial-gradient(circle,rgba(37,99,235,0.12) 0%,transparent 70%)' }} />
        </div>
        <div className="relative z-10">
          <Eyebrow text="DriveIQ Blog" className="mb-5 justify-center" />
          <h1 className="font-sora text-[44px] md:text-[56px] font-black text-white tracking-[-2px]
            leading-[1.05] mb-4">
            Insights for school<br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400
              bg-clip-text text-transparent">owners & instructors</span>
          </h1>
          <p className="text-[15px] text-white/40 max-w-md mx-auto mb-4 leading-relaxed font-dm">
            Product updates, driving school tips, industry research, and real stories from schools using DriveIQ.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap mt-2">
            <TrustItem text="Published weekly" />
            <TrustSep />
            <TrustItem text="No paywalls" />
            <TrustSep />
            <TrustItem text="Written by practitioners" />
          </div>
        </div>
      </section>

      {/* ── FEATURED ── */}
      <div className="max-w-4xl mx-auto px-6 md:px-11 mb-10">
        <FeaturedPost post={FEATURED} />
      </div>

      {/* ── CATEGORY FILTER ── */}
      <div className="max-w-4xl mx-auto px-6 md:px-11 mb-8">
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={[
                'px-4 py-2 rounded-full text-[12px] font-semibold font-dm transition-all duration-200 border',
                activeCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600 shadow-[0_4px_14px_rgba(37,99,235,0.3)]'
                  : 'bg-white/[0.04] text-white/40 border-white/[0.07] hover:bg-white/[0.08] hover:text-white/70',
              ].join(' ')}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── POSTS GRID ── */}
      <div className="max-w-4xl mx-auto px-6 md:px-11 mb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-white/20 text-[14px] font-dm">
            No posts in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((post, i) => <PostCard key={i} post={post} />)}
          </div>
        )}
      </div>

      {/* ── NEWSLETTER ── */}
      <Newsletter />

      <Footer />
    </div>
  );
};

export default Blog;