import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../Home/NavBar';
/*
 * DriveIQ — Schools.jsx  (/schools)
 * Stack  : React 18 + Tailwind CSS v3 + React Router v6
 * Fonts  : Sora + DM Sans (same as app-wide)
 *
 * Sections:
 *  1. Hero  — headline, search bar, city filter pills
 *  2. Stats bar  — live platform numbers
 *  3. Featured school card (school of the month)
 *  4. Schools grid  — filterable, searchable
 *  5. Map teaser  — city breakdown
 *  6. CTA strip
 *  7. Footer
 */

// ─── Shared primitives ────────────────────────────────────────

const LogoMark = ({ size = 32 }) => (
  <div
    className="bg-blue-600 flex items-center justify-center flex-shrink-0"
    style={{ width: size, height: size, borderRadius: Math.round(size * 0.28) }}
  >
    <svg width={Math.round(size * 0.56)} height={Math.round(size * 0.56)}
      viewBox="0 0 18 18" fill="none">
      <path d="M9 2L15 7.5V16H3V7.5L9 2Z" fill="white" />
      <rect x="6.5" y="10" width="5" height="6" rx="1" fill="#1D4ED8" />
    </svg>
  </div>
);

const PinIcon = ({ className = '' }) => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={className}>
    <circle cx="5" cy="3.5" r="1.8" stroke="currentColor" strokeWidth="1" />
    <path d="M5 9C5 9 1 6 1 3.5a4 4 0 018 0C9 6 5 9 5 9z"
      stroke="currentColor" strokeWidth="1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
    <path d="M1.5 4.5l2 2 4-4" stroke="currentColor" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StarFilled = () => <span className="text-amber-400 text-[11px]">★</span>;
const StarEmpty  = () => <span className="text-white/15 text-[11px]">★</span>;

const Stars = ({ rating = 5 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) =>
      i <= Math.round(rating) ? <StarFilled key={i} /> : <StarEmpty key={i} />
    )}
  </div>
);

const TrustItem = ({ text }) => (
  <div className="flex items-center gap-1.5 text-[12px] text-white/25 font-dm">
    <span className="w-1 h-1 rounded-full bg-emerald-400" />
    {text}
  </div>
);

const Eyebrow = ({
  text,
  dotColor = 'bg-blue-400',
  textColor = 'text-blue-400',
  borderColor = 'border-blue-500/30',
  bgColor = 'bg-blue-600/10',
  className = '',
}) => (
  <div className={`inline-flex items-center gap-2 border rounded-full px-3.5 py-1.5
    ${bgColor} ${borderColor} ${className}`}>
    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotColor}`} />
    <span className={`text-[11px] font-semibold tracking-[0.4px] font-dm ${textColor}`}>
      {text}
    </span>
  </div>
);

// ─── Schools data ─────────────────────────────────────────────
const SCHOOLS = [
  {
    id: 1, initials: 'AA', name: 'Auto École Atlas',      city: 'Casablanca',
    students: 142, instructors: 6, passRate: 97, rating: 5.0,
    plan: 'Enterprise', rank: 1, color: 'bg-violet-700',
    tags: ['Top rated', 'School of Month'],
    featured: true,
    ownerQuote: '"DriveIQ made us the #1 school in Casablanca. Our admin time dropped from 3 hours to 20 minutes a week."',
    ownerName: 'Karim Alaoui',
    yearsOnPlatform: 3,
  },
  {
    id: 2, initials: 'EL', name: 'École Lumière',          city: 'Rabat',
    students: 118, instructors: 5, passRate: 94, rating: 5.0,
    plan: 'Pro', rank: 2, color: 'bg-blue-700',
    tags: ['Top rated'], featured: false,
  },
  {
    id: 3, initials: 'AE', name: 'Auto École Étoile',      city: 'Marrakech',
    students: 97,  instructors: 4, passRate: 91, rating: 4.0,
    plan: 'Pro', rank: 3, color: 'bg-emerald-700',
    tags: ['Pro plan'], featured: false,
  },
  {
    id: 4, initials: 'RS', name: 'Route Sûre',              city: 'Fès',
    students: 76,  instructors: 3, passRate: 87, rating: 4.0,
    plan: 'Pro', rank: 4, color: 'bg-cyan-700',
    tags: ['Pro plan'], featured: false,
  },
  {
    id: 5, initials: 'MR', name: 'MaRoad Academy',          city: 'Tanger',
    students: 64,  instructors: 3, passRate: 82, rating: 4.0,
    plan: 'Pro', rank: 5, color: 'bg-amber-700',
    tags: ['Rising fast'], featured: false,
  },
  {
    id: 6, initials: 'PS', name: 'Permis School',           city: 'Agadir',
    students: 53,  instructors: 2, passRate: 79, rating: 4.0,
    plan: 'Starter', rank: 6, color: 'bg-violet-600',
    tags: ['Starter plan'], featured: false,
  },
  {
    id: 7, initials: 'DC', name: 'Drive Casa',              city: 'Casablanca',
    students: 49,  instructors: 2, passRate: 76, rating: 4.0,
    plan: 'Starter', rank: 7, color: 'bg-blue-600',
    tags: ['New this month'], featured: false,
  },
  {
    id: 8, initials: 'RA', name: 'Road Academy',            city: 'Rabat',
    students: 44,  instructors: 2, passRate: 74, rating: 3.0,
    plan: 'Starter', rank: 8, color: 'bg-teal-700',
    tags: [], featured: false,
  },
];

const CITIES = ['All cities', 'Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir'];

const CITY_DATA = [
  { name: 'Casablanca', count: 89, pct: 36 },
  { name: 'Rabat',      count: 52, pct: 21 },
  { name: 'Marrakech',  count: 38, pct: 15 },
  { name: 'Tanger',     count: 31, pct: 13 },
  { name: 'Fès',        count: 24, pct: 10 },
  { name: 'Other cities',count: 14, pct: 5  },
];

// ─── Rank badge ───────────────────────────────────────────────
const RankBadge = ({ rank }) => {
  if (rank === 1) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-400/15 text-amber-400">🥇 #1</span>;
  if (rank === 2) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-400/12 text-slate-400">🥈 #2</span>;
  if (rank === 3) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-700/15 text-amber-600">🥉 #3</span>;
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/[0.06] text-white/30">#{rank}</span>;
};

// Pass rate bar color
const rateColor = (pct) => {
  if (pct >= 90) return 'bg-emerald-500';
  if (pct >= 80) return 'bg-blue-500';
  return 'bg-amber-500';
};
const rateTxtColor = (pct) => {
  if (pct >= 90) return 'text-emerald-400';
  if (pct >= 80) return 'text-blue-400';
  return 'text-amber-400';
};

// Plan tag
const PlanTag = ({ plan }) => {
  const cls = plan === 'Enterprise'
    ? 'bg-violet-600/15 text-violet-300 border-violet-600/25'
    : plan === 'Pro'
    ? 'bg-blue-600/15 text-blue-300 border-blue-600/25'
    : 'bg-white/[0.06] text-white/40 border-white/[0.08]';
  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border font-dm ${cls}`}>
      {plan}
    </span>
  );
};

// ─── Featured school card ─────────────────────────────────────
const FeaturedCard = ({ school }) => (
  <div className="relative bg-gradient-to-br from-[#0F1A2E] via-[#13173a] to-[#0F1A2E]
    border border-violet-700/30 rounded-[22px] p-8 flex flex-col lg:flex-row gap-8
    items-start lg:items-center overflow-hidden
    hover:border-violet-600/50 hover:-translate-y-1 transition-all duration-300
    cursor-pointer"
    style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>

    {/* Glow */}
    <div className="absolute pointer-events-none w-96 h-96 rounded-full -top-24 -right-16"
      style={{ background: 'radial-gradient(circle,rgba(124,58,237,0.14) 0%,transparent 70%)' }} />

    {/* Badge */}
    <div className="absolute top-5 right-5 flex items-center gap-2
      bg-gradient-to-r from-violet-700 to-violet-500 rounded-full px-3.5 py-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
      <span className="text-[11px] font-bold text-white tracking-[0.3px] font-dm">
        Top performer — April 2026
      </span>
    </div>

    {/* Avatar */}
    <div className={`relative z-10 w-16 h-16 lg:w-20 lg:h-20 rounded-[18px] flex items-center
      justify-center font-sora text-[22px] font-black text-white flex-shrink-0
      ${school.color}`}>
      {school.initials}
    </div>

    {/* Info */}
    <div className="relative z-10 flex-1 min-w-0">
      <div className="flex items-center gap-3 mb-1 flex-wrap">
        <h3 className="font-sora text-[22px] font-black text-white tracking-tight">
          {school.name}
        </h3>
        <RankBadge rank={school.rank} />
      </div>
      <div className="flex items-center gap-1.5 text-[13px] text-white/40 mb-5 font-dm">
        <PinIcon className="text-white/30" />
        {school.city}, Morocco
        <span className="mx-2 text-white/15">·</span>
        <span className="text-white/35">{school.yearsOnPlatform} years on DriveIQ</span>
      </div>
      <div className="flex gap-5 flex-wrap">
        {[
          { v: school.students,    l: 'Students' },
          { v: `${school.passRate}%`, l: 'Pass rate' },
          { v: `${school.rating} ★`,  l: 'Rating' },
          { v: school.instructors, l: 'Instructors' },
        ].map((s) => (
          <div key={s.l}>
            <div className="font-sora text-[20px] font-black text-white tracking-tight">{s.v}</div>
            <div className="text-[10px] text-white/30 mt-0.5 font-dm">{s.l}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Quote + CTA */}
    <div className="relative z-10 flex-shrink-0 max-w-[280px]">
      {school.ownerQuote && (
        <>
          <p className="text-[13px] text-white/50 italic leading-relaxed mb-2 font-dm">
            {school.ownerQuote}
          </p>
          <div className="text-[11px] text-white/25 mb-4 font-dm">
            — {school.ownerName}, Owner
          </div>
        </>
      )}
      <button className="flex items-center gap-2 px-5 py-2.5 bg-violet-700/25
        border border-violet-600/40 rounded-xl text-[13px] font-semibold text-violet-300
        hover:bg-violet-700/40 hover:text-white transition-all duration-200 font-dm">
        View full profile <ArrowIcon />
      </button>
    </div>
  </div>
);

// ─── School card ──────────────────────────────────────────────
const CARD_GLOWS = [
  '[&:hover]:shadow-blue-600/10',
  '[&:hover]:shadow-violet-600/10',
  '[&:hover]:shadow-emerald-600/10',
  '[&:hover]:shadow-cyan-600/10',
  '[&:hover]:shadow-amber-600/10',
];

const SchoolCard = ({ school, index }) => {
  const [hovered, setHovered] = useState(false);

  const glowBg = [
    'rgba(37,99,235,0.08)',
    'rgba(124,58,237,0.08)',
    'rgba(16,185,129,0.08)',
    'rgba(6,182,212,0.07)',
    'rgba(245,158,11,0.07)',
  ][index % 5];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative bg-[#0F1A2E] border border-white/[0.07] rounded-[20px] p-6
        flex flex-col transition-all duration-300 cursor-pointer overflow-hidden
        hover:border-white/[0.14] hover:-translate-y-1"
      style={{
        boxShadow: hovered ? '0 20px 50px rgba(0,0,0,0.35)' : 'none',
      }}
    >
      {/* Glow on hover */}
      <div
        className="absolute inset-0 rounded-[20px] pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at top left, ${glowBg}, transparent 55%)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Top row */}
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-[13px] flex items-center justify-center
          font-sora text-[14px] font-black text-white flex-shrink-0 ${school.color}`}>
          {school.initials}
        </div>
        <RankBadge rank={school.rank} />
      </div>

      {/* Name & location */}
      <div className="relative z-10 mb-4">
        <h3 className="font-sora text-[16px] font-bold text-white tracking-tight mb-1">
          {school.name}
        </h3>
        <div className="flex items-center gap-1.5 text-[12px] text-white/35 font-dm">
          <PinIcon className="text-white/25" />
          {school.city}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="relative z-10 grid grid-cols-2 gap-2 mb-4">
        {[
          { v: school.students,    l: 'Students' },
          { v: school.instructors, l: 'Instructors' },
        ].map((m) => (
          <div key={m.l} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-2.5">
            <div className="font-sora text-[17px] font-bold text-white tracking-tight">{m.v}</div>
            <div className="text-[9px] text-white/30 mt-0.5 font-dm">{m.l}</div>
          </div>
        ))}
      </div>

      {/* Pass rate */}
      <div className="relative z-10 mb-4">
        <div className="flex justify-between text-[10px] mb-1.5 font-dm">
          <span className="text-white/35">Pass rate</span>
          <span className={`font-semibold ${rateTxtColor(school.passRate)}`}>
            {school.passRate}%
          </span>
        </div>
        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${rateColor(school.passRate)}`}
            style={{ width: `${school.passRate}%` }}
          />
        </div>
      </div>

      {/* Stars */}
      <div className="relative z-10 mb-4">
        <Stars rating={school.rating} />
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-auto pt-4 border-t border-white/[0.05]
        flex items-center justify-between">
        <PlanTag plan={school.plan} />
        <span className={`text-[11px] font-semibold flex items-center gap-1.5 transition-colors duration-200
          font-dm ${hovered ? 'text-white/70' : 'text-white/25'}`}>
          View <ArrowIcon />
        </span>
      </div>
    </div>
  );
};

// ─── Add-your-school card ─────────────────────────────────────
const AddSchoolCard = () => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`flex flex-col items-center justify-center text-center
        rounded-[20px] p-6 cursor-pointer transition-all duration-300 min-h-[260px]
        border border-dashed
        ${hov
          ? 'bg-blue-600/10 border-blue-500/50'
          : 'bg-blue-600/[0.06] border-blue-600/30'}`}
    >
      <div className="w-12 h-12 rounded-[14px] bg-blue-600/20 flex items-center
        justify-center mb-4 transition-all duration-300"
        style={{ background: hov ? 'rgba(37,99,235,0.25)' : undefined }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4v12M4 10h12" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="font-sora text-[15px] font-bold text-white/70 mb-2">
        Add your school
      </h3>
      <p className="text-[12px] text-white/30 leading-relaxed max-w-[160px] mb-5 font-dm">
        Join 248 schools already running smarter on DriveIQ
      </p>
      <Link to="/register"
        className="px-4 py-2 bg-blue-600/20 border border-blue-500/40 rounded-lg
          text-[12px] font-semibold text-blue-400 hover:bg-blue-600/30 hover:text-white
          transition-all duration-200 font-dm">
        Start free →
      </Link>
    </div>
  );
};

// ─── City map section ─────────────────────────────────────────
const MapSection = () => (
  <section className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-11 pb-20">
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-[22px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
        <div>
          <h3 className="font-sora text-[18px] font-bold text-white mb-1">
            Schools across Morocco
          </h3>
          <p className="text-[12px] text-white/35 font-dm">248 active schools in 24 cities</p>
        </div>
        <button className="px-4 py-2 bg-blue-600/15 border border-blue-500/30 rounded-lg
          text-[12px] font-semibold text-blue-400 hover:bg-blue-600/25 hover:text-white
          transition-all duration-200 font-dm">
          View full map →
        </button>
      </div>

      {/* Body */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Visual placeholder */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden
          aspect-video flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-3">🇲🇦</div>
            <div className="font-sora text-[22px] font-black text-white tracking-tight mb-1">Morocco</div>
            <div className="text-[12px] text-white/30 font-dm mb-4">248 schools · 6 major cities</div>
            <div className="flex gap-3 justify-center flex-wrap">
              {[
                { bg: 'bg-blue-600',    ring: 'ring-blue-600/30' },
                { bg: 'bg-violet-600',  ring: 'ring-violet-600/30' },
                { bg: 'bg-emerald-600', ring: 'ring-emerald-600/30' },
                { bg: 'bg-amber-600',   ring: 'ring-amber-600/30' },
              ].map((d, i) => (
                <div key={i}
                  className={`w-3 h-3 rounded-full ring-4 ${d.bg} ${d.ring}
                    animate-pulse`}
                  style={{ animationDelay: `${i * 400}ms` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* City list */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-bold text-white/25 tracking-widest mb-1 font-dm">
            SCHOOLS BY CITY
          </div>
          {CITY_DATA.map((city) => (
            <div key={city.name}
              className="flex items-center justify-between px-4 py-3
                bg-white/[0.03] border border-white/[0.05] rounded-xl
                hover:bg-white/[0.05] hover:border-white/[0.10] transition-all duration-200 cursor-pointer">
              <div>
                <div className="text-[13px] font-semibold text-white/80 font-dm">{city.name}</div>
                <div className="text-[11px] text-white/30 font-dm">{city.count} schools</div>
              </div>
              <div className="flex items-center gap-3">
                {/* Mini bar */}
                <div className="w-20 h-1.5 bg-white/[0.06] rounded-full overflow-hidden hidden sm:block">
                  <div className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${city.pct * 2.5}%` }} />
                </div>
                <span className="text-[12px] font-semibold text-blue-400 font-dm min-w-[32px] text-right">
                  {city.pct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ─── Stats bar ────────────────────────────────────────────────
const StatsBar = () => (
  <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-11 mb-16 relative z-10">
    <div className="grid grid-cols-2 sm:grid-cols-4 bg-white/[0.03]
      border border-white/[0.07] rounded-2xl overflow-hidden">
      {[
        { val: '248',   lbl: 'Schools on DriveIQ',   delta: '↑ +7 this week' },
        { val: '1,247', lbl: 'Active students',       delta: '↑ +84 this month' },
        { val: '91%',   lbl: 'Average pass rate',     delta: '↑ Best in Morocco' },
        { val: '4.9',   lbl: 'Platform rating',       delta: '↑ 400+ reviews' },
      ].map((s, i, arr) => (
        <div key={s.lbl}
          className={`px-5 py-5 text-center
            ${i < arr.length - 1 ? 'border-r border-b sm:border-b-0 border-white/[0.06]' : ''}`}>
          <div className="font-sora text-[26px] font-black text-white tracking-tight leading-none mb-1">
            {s.val}
          </div>
          <div className="text-[11px] text-white/30 font-dm mb-1">{s.lbl}</div>
          <div className="text-[10px] font-semibold text-emerald-400 font-dm">{s.delta}</div>
        </div>
      ))}
    </div>
  </div>
);

// ─── CTA strip ────────────────────────────────────────────────
const CtaStrip = () => (
  <div className="mx-5 sm:mx-8 lg:mx-11 mb-16 relative rounded-[22px] overflow-hidden
    border border-violet-700/25
    bg-gradient-to-br from-[#0F1A2E] via-[#13173a] to-[#0F1A2E]">
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-96 h-96 rounded-full"
        style={{ background: 'radial-gradient(circle,rgba(124,58,237,0.13) 0%,transparent 70%)' }} />
    </div>
    <div className="relative z-10 text-center px-8 py-16">
      <Eyebrow
        text="Join the network"
        dotColor="bg-violet-400" textColor="text-violet-300"
        borderColor="border-violet-500/30" bgColor="bg-violet-600/10"
        className="mb-6 justify-center"
      />
      <h2 className="font-sora text-[38px] font-black text-white tracking-[-1.2px]
        leading-[1.1] mb-4">
        Your school belongs<br />
        on this{' '}
        <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400
          bg-clip-text text-transparent">
          list.
        </span>
      </h2>
      <p className="text-[15px] text-white/40 mb-10 leading-relaxed max-w-lg mx-auto font-dm">
        248 schools already run smarter on DriveIQ. Start your 14-day free trial and see
        the difference in your first week.
      </p>
      <div className="flex gap-3 justify-center items-center flex-wrap mb-7">
        <Link to="/register"
          className="px-8 py-3.5 bg-violet-700 hover:bg-violet-600 text-white text-[14px]
            font-bold rounded-xl transition-all duration-200 hover:-translate-y-0.5
            shadow-[0_8px_24px_rgba(124,58,237,0.25)] hover:shadow-[0_14px_32px_rgba(124,58,237,0.4)]
            font-dm">
          Add my school — free
        </Link>
        <Link to="/pricing"
          className="px-6 py-3.5 border border-white/15 rounded-xl bg-transparent
            text-white/70 text-[14px] font-medium hover:bg-white/[0.05] hover:text-white
            hover:border-white/30 transition-all duration-200 font-dm">
          See pricing →
        </Link>
      </div>
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <TrustItem text="No credit card" />
        <div className="w-px h-3 bg-white/10" />
        <TrustItem text="Setup in 5 minutes" />
        <div className="w-px h-3 bg-white/10" />
        <TrustItem text="Cancel anytime" />
      </div>
    </div>
  </div>
);

// ─── Footer ───────────────────────────────────────────────────
const Footer = () => (
  <footer className="px-5 sm:px-11 py-6 border-t border-white/[0.06]
    flex items-center justify-between flex-wrap gap-4">
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

// ─────────────────────────────────────────────────────────────
// ROOT PAGE COMPONENT
// ─────────────────────────────────────────────────────────────
const SchoolsPage = () => {
  const [search,     setSearch]     = useState('');
  const [activeCity, setActiveCity] = useState('All cities');

  const featuredSchool = SCHOOLS.find((s) => s.featured);

  const filteredSchools = useMemo(() => {
    return SCHOOLS.filter((s) => {
      if (s.featured) return false; // shown separately
      const matchCity   = activeCity === 'All cities' || s.city === activeCity;
      const matchSearch = !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.city.toLowerCase().includes(search.toLowerCase());
      return matchCity && matchSearch;
    });
  }, [search, activeCity]);

  return (
    <div className="min-h-screen bg-[#060B18] font-dm text-white overflow-x-hidden">

      <NavBar />

      {/* ── HERO ── */}
      <section className="relative px-5 sm:px-8 lg:px-11 pt-20 pb-10 text-center overflow-hidden">
        {/* Bg layers */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(37,99,235,1) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,1) 1px,transparent 1px)',
              backgroundSize: '48px 48px',
            }} />
          <div className="absolute w-[600px] h-[600px] rounded-full -top-52 left-1/2 -translate-x-1/2"
            style={{ background: 'radial-gradient(circle,rgba(37,99,235,0.12) 0%,transparent 70%)' }} />
          <div className="absolute w-80 h-80 rounded-full -top-10 right-16"
            style={{ background: 'radial-gradient(circle,rgba(124,58,237,0.09) 0%,transparent 70%)' }} />
          <div className="absolute w-64 h-64 rounded-full -top-10 left-16"
            style={{ background: 'radial-gradient(circle,rgba(6,182,212,0.07) 0%,transparent 70%)' }} />
        </div>

        <div className="relative z-10">
          <Eyebrow text="248 schools & growing" className="mb-6 justify-center" />

          <h1 className="font-sora text-[44px] lg:text-[52px] font-black text-white
            tracking-[-2px] leading-[1.07] mb-5">
            Schools that run{' '}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400
              bg-clip-text text-transparent">
              smarter,
            </span>
            <br />faster, better.
          </h1>

          <p className="text-[15px] text-white/45 max-w-xl mx-auto mb-10 leading-[1.75] font-dm">
            Real driving schools. Real results. See how DriveIQ is transforming auto-écoles
            across Morocco — from Casablanca to Agadir.
          </p>

          {/* Search bar */}
          <div className="relative max-w-lg mx-auto mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search schools by name or city…"
              className="w-full pl-12 pr-28 py-3.5 bg-white/[0.05] border border-white/[0.12]
                rounded-xl text-[14px] text-white placeholder:text-white/25 font-dm
                outline-none transition-all duration-250
                focus:border-blue-500 focus:bg-blue-600/[0.08] focus:ring-2 focus:ring-blue-500/20"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2
              bg-blue-600 hover:bg-blue-500 border-none rounded-lg text-[12px]
              font-semibold text-white transition-colors duration-200 font-dm">
              Search
            </button>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 justify-center flex-wrap">
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => setActiveCity(city)}
                className={[
                  'px-4 py-1.5 rounded-full text-[12px] font-medium border transition-all duration-200 font-dm',
                  activeCity === city
                    ? 'bg-blue-600/18 border-blue-500/40 text-blue-300 font-semibold'
                    : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:border-white/20 hover:text-white/70',
                ].join(' ')}
              >
                {city}
              </button>
            ))}
            {/* Extra filter pills */}
            {['Top rated ★', 'Highest pass rate'].map((f) => (
              <button key={f}
                className="px-4 py-1.5 rounded-full text-[12px] font-medium border
                  bg-white/[0.03] border-white/[0.08] text-white/40
                  hover:border-white/20 hover:text-white/70 transition-all duration-200 font-dm">
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <StatsBar />

      {/* ── FEATURED SCHOOL ── */}
      {featuredSchool && (
        <section className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-11 mb-10">
          <div className="flex items-center gap-3 mb-5">
            <span className="font-sora text-[20px] font-black text-white tracking-tight">
              ✦ School of the month
            </span>
          </div>
          <FeaturedCard school={featuredSchool} />
        </section>
      )}

      {/* ── GRID ── */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-11 mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-sora text-[22px] font-black text-white tracking-tight">
            All schools{' '}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400
              bg-clip-text text-transparent">
              ({filteredSchools.length + 1})
            </span>
          </h2>
          <button className="flex items-center gap-1.5 text-[13px] text-white/35
            hover:text-white/70 transition-colors font-dm">
            View on map <ArrowIcon />
          </button>
        </div>

        {filteredSchools.length === 0 && search ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <div className="font-sora text-[18px] font-bold text-white/60 mb-2">
              No schools found
            </div>
            <div className="text-[14px] text-white/30 font-dm">
              Try a different city or school name
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchools.map((school, i) => (
              <SchoolCard key={school.id} school={school} index={i} />
            ))}
            {/* Add your school CTA card */}
            {(activeCity === 'All cities' && !search) && <AddSchoolCard />}
          </div>
        )}
      </section>

      {/* ── MAP SECTION ── */}
      <MapSection />

      {/* ── CTA ── */}
      <CtaStrip />

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
};

export default SchoolsPage;