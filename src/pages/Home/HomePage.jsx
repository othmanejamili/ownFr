import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
/* ─────────────────────────────────────────────────────────────
   DriveIQ — Premium Homepage
   Stack  : React 18 + Tailwind CSS v3
   Fonts  : Add to index.html <head>:
     <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap" rel="stylesheet">
   tailwind.config.js:
     theme: { extend: { fontFamily: {
       sora: ['Sora', 'sans-serif'],
       dm:   ['DM Sans', 'sans-serif'],
     }}}
───────────────────────────────────────────────────────────── */

// ── Shared tiny components ────────────────────────────────────

const LogoMark = ({ size = 32 }) => (
  <div
    className="bg-blue-600 flex items-center justify-center flex-shrink-0"
    style={{ width: size, height: size, borderRadius: size * 0.28 }}
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

const ArrowUpIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M2 7l3-3 2 2 3-4" stroke="#10B981" strokeWidth="1.2"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlayIcon = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="white">
    <path d="M2 1.5l5 2.5-5 2.5V1.5z" />
  </svg>
);

// ── Section eyebrow pill ──────────────────────────────────────
const Eyebrow = ({ text, dotColor = 'bg-blue-500', textColor = 'text-blue-400',
  borderColor = 'border-blue-500/30', bgColor = 'bg-blue-600/10', className = '' }) => (
  <div className={`inline-flex items-center gap-2 border rounded-full px-3.5 py-1.5 ${bgColor} ${borderColor} ${className}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
    <span className={`text-[11px] font-semibold tracking-[0.4px] ${textColor}`}>{text}</span>
  </div>
);

// ── CTA button variants ───────────────────────────────────────
const BtnPrimary = ({ children, size = 'md', className = '', ...props }) => {
  const sizes = { sm: 'py-2 px-4 text-[13px]', md: 'py-3 px-6 text-[14px]', lg: 'py-3.5 px-8 text-[15px]' };
  return (
    <button
      className={[
        'relative overflow-hidden font-semibold text-white bg-blue-600 rounded-xl',
        'transition-all duration-200 hover:bg-blue-500 hover:-translate-y-0.5',
        'hover:shadow-[0_12px_32px_rgba(37,99,235,0.35)] active:scale-[0.99]',
        'font-dm', sizes[size], className,
      ].join(' ')}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
};

const BtnGhost = ({ children, className = '', ...props }) => (
  <button
    className={[
      'flex items-center gap-2.5 py-3 px-5 text-[14px] font-medium text-white/75',
      'border border-white/10 rounded-xl bg-white/[0.04]',
      'hover:bg-white/[0.07] hover:border-white/20 hover:text-white hover:-translate-y-0.5',
      'transition-all duration-200 active:scale-[0.99] font-dm',
      className,
    ].join(' ')}
    {...props}
  >
    {children}
  </button>
);

// ── Trust strip item ──────────────────────────────────────────
const TrustItem = ({ text }) => (
  <div className="flex items-center gap-1.5 text-[12px] text-white/30">
    <span className="w-1 h-1 rounded-full bg-emerald-400" />
    {text}
  </div>
);

// ─────────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────────
const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav className={[
      'sticky top-0 z-50 flex items-center justify-between px-11 py-4',
      'border-b border-white/[0.06] transition-all duration-300',
      scrolled ? 'bg-[#060B18]/95 backdrop-blur-md' : 'bg-[#060B18]',
    ].join(' ')}>
      <div className="flex items-center gap-2.5">
        <LogoMark size={32} />
        <span className="font-sora text-[15px] font-bold text-white tracking-tight">DriveIQ</span>
      </div>

      <div className="hidden md:flex items-center gap-7">
        {['Features', 'Pricing', 'Schools', 'Blog', 'Docs'].map(l => (
          <a key={l} href="#"
            className="text-[13px] text-white/50 font-medium hover:text-white transition-colors duration-200 font-dm">
            {l}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-2.5">
        <Link to={'/login'} className="hidden sm:block px-4 py-2 text-[13px] font-medium text-white/60 border border-white/10 rounded-lg bg-transparent hover:text-white hover:border-white/25 transition-all duration-200 font-dm">
          Login
        </Link>
        <BtnPrimary size="sm">Start free trial</BtnPrimary>
      </div>
    </nav>
  );
};

// ─────────────────────────────────────────────────────────────
// HERO — floating dashboard cards
// ─────────────────────────────────────────────────────────────
const KpiCard = ({ value, label, delta, deltaUp = true }) => (
  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-2.5">
    <div className="font-sora text-[18px] font-black text-white tracking-tight">{value}</div>
    <div className="text-[10px] text-white/30 mt-0.5">{label}</div>
    {delta && (
      <div className={`text-[10px] font-semibold mt-1 ${deltaUp ? 'text-emerald-400' : 'text-amber-400'}`}>{delta}</div>
    )}
  </div>
);

const ScheduleRow = ({ name, time, status, barColor, badgeBg, badgeText }) => (
  <div className="flex items-center gap-2 py-1.5 border-b border-white/[0.04] last:border-0">
    <div className={`w-0.5 self-stretch rounded-full ${barColor}`} />
    <div className="flex-1 min-w-0">
      <div className="text-[11px] font-semibold text-white/80 truncate">{name}</div>
      <div className="text-[9px] text-white/30 mt-0.5">{time}</div>
    </div>
    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${badgeBg} ${badgeText}`}>
      {status}
    </span>
  </div>
);

const HeroVisual = () => (
  <div className="relative h-[440px] w-full max-w-[360px] mx-auto lg:mx-0">

    {/* Revenue floating card */}
    <div className="absolute top-4 left-0 z-40 bg-[#0D1526] border border-violet-500/20 rounded-2xl p-4 w-48 shadow-2xl animate-[floatB_6s_ease-in-out_infinite]">
      <div className="text-[10px] text-white/30 font-semibold tracking-widest mb-1.5">MONTHLY REVENUE</div>
      <div className="font-sora text-[24px] font-black text-white tracking-tight">48,200</div>
      <div className="text-[10px] text-white/30 mt-0.5">MAD this month</div>
      <div className="flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-emerald-400">
        <ArrowUpIcon /> +34% vs last month
      </div>
    </div>

    {/* Main dashboard card */}
    <div className="absolute top-0 right-0 z-30 bg-[#0F1A2E] border border-white/[0.08] rounded-2xl p-4 w-[310px] shadow-[0_24px_80px_rgba(0,0,0,0.5)] hover:-translate-y-1 hover:-rotate-[0.3deg] transition-transform duration-300">
      {/* Fake browser chrome */}
      <div className="flex items-center gap-1.5 mb-3">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/60" />
          <div className="w-2 h-2 rounded-full bg-amber-500/60" />
          <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
        </div>
        <div className="flex-1 bg-white/[0.04] rounded h-4 ml-2" />
      </div>
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <KpiCard value="248" label="Active students" delta="+12 this week" />
        <KpiCard value="91%" label="Pass rate avg" delta="-2% vs avg" deltaUp={false} />
        <KpiCard value="31" label="Lessons today" delta="3 confirmed" />
        <KpiCard value="6" label="Instructors" delta="All available" />
      </div>
      {/* Schedule */}
      <div className="text-[9px] font-bold text-white/30 tracking-[0.8px] mb-1.5">TODAY'S SCHEDULE</div>
      <ScheduleRow name="Karim Benali" time="09:00 – 10:30 · Route A" status="Confirmed"
        barColor="bg-blue-500" badgeBg="bg-blue-500/15" badgeText="text-blue-300" />
      <ScheduleRow name="Lina Oussama" time="11:00 – 12:30 · Highway" status="In progress"
        barColor="bg-violet-500" badgeBg="bg-violet-500/15" badgeText="text-violet-300" />
      <ScheduleRow name="Yassir Moktari" time="14:00 – 15:30 · City" status="Upcoming"
        barColor="bg-emerald-500" badgeBg="bg-emerald-500/15" badgeText="text-emerald-300" />
    </div>

    {/* Payment notification */}
    <div className="absolute bottom-24 right-0 z-40 bg-[#0D1526] border border-emerald-500/20 rounded-xl p-3 w-52 shadow-2xl animate-[floatC_4s_ease-in-out_infinite]">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1l1.5 4h4L9 7.5l1.5 4L7 9l-3.5 2.5L5 7.5 1.5 5h4z" fill="#10B981" />
          </svg>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-white/85">Payment received</div>
          <div className="text-[10px] text-white/35 mt-0.5">Sara M. — 850 MAD · just now</div>
        </div>
      </div>
    </div>

    {/* Students stat */}
    <div className="absolute bottom-6 left-0 z-40 bg-[#0D1526] border border-white/[0.08] rounded-2xl p-4 w-40 shadow-2xl animate-[floatA_5s_ease-in-out_infinite]">
      <div className="font-sora text-[24px] font-black text-white tracking-tight">248+</div>
      <div className="text-[10px] text-white/30 mt-0.5">Active students</div>
      <div className="flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-emerald-400">
        <ArrowUpIcon /> Growing 12% monthly
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// HERO SECTION
// ─────────────────────────────────────────────────────────────
const HeroSection = () => (
  <section className="relative px-11 py-20 overflow-hidden min-h-[600px] flex items-center">
    {/* Background layers */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'linear-gradient(rgba(37,99,235,1) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,1) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
      <div className="absolute w-[560px] h-[560px] rounded-full -top-36 -left-24 pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(37,99,235,0.18) 0%,transparent 70%)' }} />
      <div className="absolute w-[400px] h-[400px] rounded-full -top-20 right-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(124,58,237,0.14) 0%,transparent 70%)' }} />
      <div className="absolute w-[280px] h-[280px] rounded-full -bottom-16 right-52 pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(6,182,212,0.1) 0%,transparent 70%)' }} />
    </div>

    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-14 w-full max-w-6xl mx-auto">
      {/* Left copy */}
      <div className="flex-1 min-w-0">
        <Eyebrow text="New — AI scheduling now live"
          dotColor="bg-violet-400" textColor="text-violet-300"
          borderColor="border-violet-500/35" bgColor="bg-violet-600/15"
          className="mb-6 animate-[fadeUp_0.6s_ease_forwards]" />

        <h1 className="font-sora text-[48px] lg:text-[54px] font-black text-white leading-[1.05] tracking-[-2px] mb-5 animate-[fadeUp_0.7s_ease_forwards]">
          The operating system<br />
          <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
            for driving schools
          </span>
        </h1>

        <p className="text-[16px] text-white/50 leading-relaxed max-w-[440px] mb-9 font-dm animate-[fadeUp_0.8s_ease_forwards]">
          Stop managing spreadsheets. DriveIQ gives you one command center for every lesson, student, payment, and instructor — so you can focus on the road ahead.
        </p>

        <div className="flex items-center gap-3 mb-7 flex-wrap animate-[fadeUp_0.9s_ease_forwards]">
          <BtnPrimary size="lg">Start free — 14 days</BtnPrimary>
          <BtnGhost>
            <div className="w-5 h-5 rounded-full border border-white/25 flex items-center justify-center flex-shrink-0">
              <PlayIcon />
            </div>
            Watch demo
          </BtnGhost>
        </div>

        <div className="flex items-center gap-4 flex-wrap animate-[fadeUp_1s_ease_forwards]">
          <TrustItem text="No credit card required" />
          <div className="w-px h-3.5 bg-white/10" />
          <TrustItem text="Setup in under 5 minutes" />
          <div className="w-px h-3.5 bg-white/10" />
          <TrustItem text="Cancel anytime" />
        </div>
      </div>

      {/* Right visual */}
      <div className="w-full lg:w-auto animate-[fadeUp_0.8s_ease_forwards]">
        <HeroVisual />
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────
// LOGOS STRIP
// ─────────────────────────────────────────────────────────────
const LogosStrip = () => (
  <div className="px-11 py-6 border-t border-b border-white/[0.06] bg-white/[0.015]">
    <div className="max-w-6xl mx-auto flex items-center gap-0">
      <span className="text-[11px] text-white/25 font-semibold tracking-[0.5px] whitespace-nowrap pr-8 border-r border-white/[0.06] font-dm">
        TRUSTED BY SCHOOLS IN
      </span>
      <div className="flex flex-1 overflow-hidden">
        {['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir'].map((city, i, arr) => (
          <div key={city}
            className={`flex-1 flex items-center justify-center py-1 ${i < arr.length - 1 ? 'border-r border-white/[0.06]' : ''}`}>
            <span className="font-sora text-[12px] font-bold text-white/25 tracking-tight">{city}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// FEATURE CARDS
// ─────────────────────────────────────────────────────────────
const MiniBar = ({ label, pct, color }) => (
  <div className="flex items-center gap-2">
    <span className="text-[10px] text-white/40 w-10 flex-shrink-0 font-dm">{label}</span>
    <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
    <span className="text-[9px] text-white/30 w-14 text-right font-dm">{pct}%</span>
  </div>
);

const FeatureCard = ({ icon, title, desc, accentClass, iconBg, iconColor, mini, wide = false }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={[
        'relative bg-[#0F1A2E] border border-white/[0.07] rounded-2xl p-7',
        'transition-all duration-300 cursor-default overflow-hidden',
        hovered ? 'border-white/[0.13] -translate-y-1' : '',
        wide ? 'col-span-2' : '',
      ].join(' ')}
      style={{ boxShadow: hovered ? '0 20px 60px rgba(0,0,0,0.35)' : 'none' }}
    >
      {/* Glow on hover */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 ${accentClass} ${hovered ? 'opacity-100' : ''}`} />

      <div className="relative z-10">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${iconBg}`}>
          <div className={iconColor}>{icon}</div>
        </div>
        <h3 className="font-sora text-[16px] font-bold text-white tracking-tight mb-2">{title}</h3>
        <p className="text-[13px] text-white/50 leading-relaxed mb-5 font-dm">{desc}</p>
        {mini && (
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3.5 flex flex-col gap-2.5">
            {mini}
          </div>
        )}
      </div>
    </div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.4"/><path d="M6 2v16M14 2v16M2 7h16M2 13h16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
      title: 'Smart scheduling', desc: 'Drag-and-drop calendar. Auto-detect conflicts. SMS reminders sent automatically.',
      accentClass: '[background:radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_60%)]',
      iconBg: 'bg-blue-600/15', iconColor: 'text-blue-400',
      mini: <>
        <div className="text-[9px] text-white/25 font-bold tracking-widest mb-1 font-dm">WEEKLY LOAD</div>
        <MiniBar label="Mon" pct={85} color="bg-blue-500" />
        <MiniBar label="Wed" pct={60} color="bg-blue-500" />
        <MiniBar label="Fri" pct={95} color="bg-blue-500" />
      </>
    },
    {
      icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.4"/><path d="M2 18c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
      title: 'Student progress', desc: 'Track every lesson, exam result, and payment. Know exactly where each student stands.',
      accentClass: '[background:radial-gradient(circle_at_top_left,rgba(124,58,237,0.08),transparent_60%)]',
      iconBg: 'bg-violet-600/15', iconColor: 'text-violet-400',
      mini: <>
        <div className="text-[9px] text-white/25 font-bold tracking-widest mb-1 font-dm">PASS RATE BY MONTH</div>
        <MiniBar label="Jan" pct={80} color="bg-violet-500" />
        <MiniBar label="Feb" pct={87} color="bg-violet-500" />
        <MiniBar label="Mar" pct={91} color="bg-violet-500" />
      </>
    },
    {
      icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M2 9h16M6 2v3M14 2v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="14" cy="13" r="2" stroke="currentColor" strokeWidth="1.2"/></svg>,
      title: 'Payments & invoices', desc: 'Auto-generate invoices, track unpaid balances, and send payment reminders in one click.',
      accentClass: '[background:radial-gradient(circle_at_top_left,rgba(16,185,129,0.08),transparent_60%)]',
      iconBg: 'bg-emerald-600/15', iconColor: 'text-emerald-400',
      mini: <>
        <div className="text-[9px] text-white/25 font-bold tracking-widest mb-1 font-dm">PAYMENT STATUS</div>
        <MiniBar label="Paid" pct={78} color="bg-emerald-500" />
        <MiniBar label="Pending" pct={22} color="bg-amber-500" />
      </>
    },
    {
      icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 10h14M10 3v14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4"/></svg>,
      title: 'Instructor management', desc: 'Assign instructors to students, track availability, and monitor performance across your whole team.',
      accentClass: '[background:radial-gradient(circle_at_top_left,rgba(6,182,212,0.08),transparent_60%)]',
      iconBg: 'bg-cyan-600/15', iconColor: 'text-cyan-400',
      wide: true,
      mini: (
        <div className="flex gap-3 flex-wrap">
          {[
            { init: 'KA', color: 'bg-blue-600',   name: 'Karim A.',  sub: '5 lessons today' },
            { init: 'SM', color: 'bg-violet-600', name: 'Sara M.',   sub: '3 lessons today' },
            { init: 'YM', color: 'bg-emerald-600',name: 'Yassir M.', sub: 'Available now' },
          ].map(p => (
            <div key={p.init} className="flex items-center gap-2 flex-1 min-w-[120px]">
              <div className={`w-7 h-7 rounded-full ${p.color} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}>{p.init}</div>
              <div>
                <div className="text-[11px] font-semibold text-white/80 font-dm">{p.name}</div>
                <div className="text-[10px] text-white/30 font-dm">{p.sub}</div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2l1.8 5.4H18l-4.9 3.5 1.8 5.6L10 13l-4.9 3.5 1.8-5.6L2 7.4h6.2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
      title: 'AI-powered insights', desc: 'Predict dropout risk, optimize scheduling, and surface your most profitable routes — automatically.',
      accentClass: '[background:radial-gradient(circle_at_top_left,rgba(245,158,11,0.08),transparent_60%)]',
      iconBg: 'bg-amber-600/15', iconColor: 'text-amber-400',
    },
  ];

  return (
    <section className="px-11 py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <Eyebrow text="Everything you need" className="mb-5" />
        <h2 className="font-sora text-[40px] font-black text-white tracking-[-1.2px] leading-[1.1] mb-4">
          Built for the way{' '}
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            driving schools
          </span>{' '}
          actually work
        </h2>
        <p className="text-[15px] text-white/45 leading-relaxed max-w-[480px] mb-14 font-dm">
          Not a generic tool with a coat of paint. Every feature was designed around how real driving schools operate.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={i} className={f.wide ? 'lg:col-span-2' : ''}>
              <FeatureCard {...f} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// SHOWCASE / TABS
// ─────────────────────────────────────────────────────────────
const CalendarVisual = () => {
  const days = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  const cells = [
    { n:1,t:'' },{n:2,t:'has'},{n:3,t:''},{n:4,t:'busy'},{n:5,t:'has'},{n:6,t:''},{n:7,t:''},
    {n:8,t:'has'},{n:9,t:''},{n:10,t:'has'},{n:11,t:''},{n:12,t:'busy'},{n:13,t:''},{n:14,t:''},
    {n:15,t:''},{n:16,t:'has'},{n:17,t:''},{n:18,t:'today'},{n:19,t:'has'},{n:20,t:'busy'},{n:21,t:''},
    {n:22,t:'has'},{n:23,t:''},{n:24,t:'busy'},{n:25,t:'has'},{n:26,t:''},{n:27,t:''},{n:28,t:'has'},
  ];
  const cellStyle = (t) => {
    if (t === 'has')   return 'bg-blue-600/18 text-blue-300 hover:bg-blue-600/30';
    if (t === 'busy')  return 'bg-violet-600/18 text-violet-300 hover:bg-violet-600/30';
    if (t === 'today') return 'bg-blue-600 text-white';
    return 'text-white/30 hover:bg-white/[0.04]';
  };
  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#162035] border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500/60" />
          <div className="w-2 h-2 rounded-full bg-amber-500/60" />
          <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
        </div>
        <span className="text-[11px] text-white/35 ml-2 font-medium font-dm">April 2026</span>
        <div className="ml-auto bg-blue-600 rounded-md px-2.5 py-1 text-[10px] font-semibold text-white cursor-pointer font-dm">+ Add lesson</div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {days.map(d => <div key={d} className="text-center text-[9px] font-bold text-white/25 py-1 tracking-wider font-dm">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map(c => (
            <div key={c.n} className={`h-8 rounded-lg flex items-center justify-center text-[10px] font-semibold cursor-default transition-colors duration-200 ${cellStyle(c.t)}`}>
              {c.n}
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4">
          {[['bg-blue-500','Lessons'],['bg-violet-500','Exams'],['bg-blue-600','Today']].map(([bg,lbl]) => (
            <div key={lbl} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-sm ${bg}`} />
              <span className="text-[10px] text-white/30 font-dm">{lbl}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StudentsVisual = () => {
  const students = [
    { name: 'Karim Benali',   lessons: 14, progress: 87, status: 'On track',   color: 'text-emerald-400', bg: 'bg-emerald-400' },
    { name: 'Lina Oussama',   lessons: 8,  progress: 55, status: 'In progress',color: 'text-blue-400',    bg: 'bg-blue-400' },
    { name: 'Yassir Moktari', lessons: 20, progress: 100,status: 'Passed',     color: 'text-violet-400',  bg: 'bg-violet-400' },
    { name: 'Sara Moussaoui', lessons: 3,  progress: 18, status: 'New',        color: 'text-amber-400',   bg: 'bg-amber-400' },
  ];
  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-[#162035] border-b border-white/[0.06]">
        <span className="text-[11px] font-semibold text-white/50 font-dm">Student tracker</span>
        <div className="bg-white/[0.05] rounded-lg px-3 py-1.5 text-[10px] text-white/30 font-dm">248 total</div>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {students.map(s => (
          <div key={s.name} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-semibold text-white/80 font-dm">{s.name}</span>
              <span className={`text-[10px] font-semibold ${s.color} font-dm`}>{s.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${s.bg}`} style={{ width: `${s.progress}%` }} />
              </div>
              <span className="text-[10px] text-white/30 min-w-[28px] text-right font-dm">{s.progress}%</span>
            </div>
            <div className="text-[10px] text-white/25 mt-1.5 font-dm">{s.lessons} lessons completed</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PaymentsVisual = () => {
  const rows = [
    { name: 'Karim Benali',  date: 'Apr 18', amount: '850 MAD', status: 'Paid',    sc:'text-emerald-400', sb:'bg-emerald-400/10 border-emerald-400/20' },
    { name: 'Lina Oussama',  date: 'Apr 17', amount: '600 MAD', status: 'Pending', sc:'text-amber-400',   sb:'bg-amber-400/10 border-amber-400/20' },
    { name: 'Sara Moussaoui',date: 'Apr 15', amount: '1,200 MAD',status:'Paid',    sc:'text-emerald-400', sb:'bg-emerald-400/10 border-emerald-400/20' },
    { name: 'Yassir M.',     date: 'Apr 14', amount: '850 MAD', status: 'Overdue', sc:'text-red-400',     sb:'bg-red-400/10 border-red-400/20' },
  ];
  return (
    <div className="bg-[#0F1A2E] border border-white/[0.07] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-[#162035] border-b border-white/[0.06]">
        <span className="text-[11px] font-semibold text-white/50 font-dm">Payment tracker</span>
        <span className="text-[10px] text-emerald-400 font-semibold font-dm">+48,200 MAD</span>
      </div>
      <div className="p-4 flex flex-col gap-2">
        {rows.map(r => (
          <div key={r.name} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
            <div>
              <div className="text-[12px] font-semibold text-white/80 font-dm">{r.name}</div>
              <div className="text-[10px] text-white/25 font-dm">{r.date}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-[12px] font-semibold text-white/80 font-dm">{r.amount}</div>
              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${r.sc} ${r.sb} font-dm`}>{r.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const showcaseTabs = [
  { label: 'Schedule', title: 'Visual scheduling that actually makes sense', desc: 'Color-coded by instructor. Conflict detection built-in. Drag lessons to reschedule — students get notified instantly. No more double-bookings.', features: ['Drag-and-drop rescheduling','Auto conflict detection','SMS reminders sent automatically'], visual: <CalendarVisual /> },
  { label: 'Students', title: 'Every student, tracked from day one', desc: 'From first lesson to final exam — see every hour driven, every test taken, and every payment made. Export full reports in seconds.', features: ['Full lesson history','Exam results & notes','Outstanding balance tracker'], visual: <StudentsVisual /> },
  { label: 'Payments', title: 'Get paid faster, with zero chasing', desc: 'Auto-generate invoices after every lesson. Set payment plans. Send automated reminders. Know exactly who owes what — at a glance.', features: ['Auto invoice generation','Payment plan support','Overdue balance alerts'], visual: <PaymentsVisual /> },
];

const ShowcaseSection = () => {
  const [active, setActive] = useState(0);
  const t = showcaseTabs[active];
  return (
    <section className="px-11 py-20 bg-[#0B1221] border-t border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <Eyebrow text="See it in action"
          dotColor="bg-violet-400" textColor="text-violet-300"
          borderColor="border-violet-500/30" bgColor="bg-violet-600/10"
          className="mb-4" />
        <h2 className="font-sora text-[38px] font-black text-white tracking-[-1.2px] leading-[1.1] mb-10">
          Your school,{' '}
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">live on screen</span>
        </h2>

        <div className="flex gap-1.5 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1 w-fit mb-10">
          {showcaseTabs.map((tab, i) => (
            <button key={tab.label} onClick={() => setActive(i)}
              className={[
                'px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 font-dm',
                active === i ? 'bg-blue-600 text-white font-semibold' : 'text-white/35 hover:text-white/60',
              ].join(' ')}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="font-sora text-[26px] font-bold text-white tracking-tight leading-snug mb-4">{t.title}</h3>
            <p className="text-[14px] text-white/45 leading-relaxed mb-6 font-dm">{t.desc}</p>
            <div className="flex flex-col gap-2.5 mb-8">
              {t.features.map(f => (
                <div key={f} className="flex items-center gap-3 text-[13px] text-white/65 font-dm">
                  <div className="w-4 h-4 rounded-md bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <CheckIcon />
                  </div>
                  {f}
                </div>
              ))}
            </div>
            <BtnPrimary size="md">Explore this feature</BtnPrimary>
          </div>
          <div className="transition-all duration-300">{t.visual}</div>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// METRICS
// ─────────────────────────────────────────────────────────────
const MetricsSection = () => {
  const metrics = [
    { val: '248', sup: '+', label: 'Schools running on DriveIQ', delta: '↑ Growing 12% per month', accent: 'from-blue-500' },
    { val: '91',  sup: '%', label: 'Average student pass rate',  delta: '↑ 18% above national avg', accent: 'from-violet-500' },
    { val: '3',   sup: 'hrs',label: 'Admin time saved weekly',   delta: '↑ Per school on average', accent: 'from-emerald-500' },
    { val: '4.9', sup: '/5', label: 'Average user satisfaction', delta: '↑ Based on 400+ reviews', accent: 'from-amber-500' },
  ];
  return (
    <section className="px-11 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <Eyebrow text="Real results" dotColor="bg-emerald-400" textColor="text-emerald-300" borderColor="border-emerald-500/30" bgColor="bg-emerald-600/10" className="mb-4 justify-center" />
          <h2 className="font-sora text-[36px] font-black text-white tracking-[-1.2px]">
            The numbers speak{' '}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">for themselves</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 border border-white/[0.08] rounded-2xl overflow-hidden">
          {metrics.map((m, i) => (
            <div key={i} className={`relative p-8 overflow-hidden ${i < metrics.length - 1 ? 'border-r border-white/[0.08]' : ''}`}>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${m.accent} to-transparent`} />
              <div className="font-sora text-[42px] font-black text-white tracking-[-2px] leading-none">
                {m.val}<span className="text-[22px] tracking-tight">{m.sup}</span>
              </div>
              <div className="text-[13px] text-white/45 mt-2.5 font-dm">{m.label}</div>
              <div className="text-[11px] font-semibold text-emerald-400 mt-1.5 font-dm">{m.delta}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────────────────────
const TestimonialsSection = () => {
  const testimonials = [
    { quote: "DriveIQ cut our admin work in half. Scheduling used to take 3 hours a week — now it's 20 minutes.", name: 'Karim Alaoui', role: 'Owner · Auto École Atlas, Casablanca', init: 'KA', color: 'bg-blue-600' },
    { quote: "Logging into DriveIQ every morning is the first thing I do — everything I need is right there.", name: 'Sara Moussaoui', role: 'Owner · Auto École Lumière, Rabat', init: 'SM', color: 'bg-violet-600' },
    { quote: "The student tracking alone is worth it. I can see exactly who's ready for their exam and who needs more sessions.", name: 'Yassir Moktari', role: 'Instructor · Auto École Étoile, Marrakech', init: 'YM', color: 'bg-emerald-600' },
  ];
  return (
    <section className="px-11 py-20 bg-[#0B1221] border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <Eyebrow text="What schools say" dotColor="bg-blue-400" textColor="text-blue-300" borderColor="border-blue-500/30" bgColor="bg-blue-600/10" className="mb-4 justify-center" />
          <h2 className="font-sora text-[34px] font-black text-white tracking-[-1.2px]">
            Trusted by real schools,{' '}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">every day</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-[#0F1A2E] border border-white/[0.07] rounded-2xl p-6 hover:border-white/[0.12] hover:-translate-y-1 transition-all duration-300">
              <div className="flex gap-0.5 mb-4">
                {[1,2,3,4,5].map(s => <svg key={s} width="12" height="12" viewBox="0 0 12 12" fill="#FBBF24"><path d="M6 1l1.3 3.7H11L8.2 6.9l1 3.5L6 8.5l-3.2 1.9 1-3.5L1 4.7h3.7z"/></svg>)}
              </div>
              <p className="text-[13px] text-white/55 leading-relaxed italic mb-6 font-dm">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${t.color} flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0`}>{t.init}</div>
                <div>
                  <div className="text-[12px] font-semibold text-white/80 font-dm">{t.name}</div>
                  <div className="text-[11px] text-white/30 font-dm">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// CTA BOTTOM
// ─────────────────────────────────────────────────────────────
const CtaSection = () => (
  <section className="px-11 py-24 text-center relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%)' }} />
    </div>
    <div className="relative z-10 max-w-2xl mx-auto">
      <Eyebrow text="Start today" dotColor="bg-violet-400" textColor="text-violet-300"
        borderColor="border-violet-500/30" bgColor="bg-violet-600/10"
        className="mb-6 justify-center" />
      <h2 className="font-sora text-[44px] font-black text-white tracking-[-1.5px] leading-[1.1] mb-5">
        Ready to run your school{' '}
        <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
          on autopilot?
        </span>
      </h2>
      <p className="text-[15px] text-white/45 leading-relaxed mb-10 font-dm">
        Join 248+ driving schools already saving hours every week. No card required, full access for 14 days.
      </p>
      <div className="flex items-center gap-3 justify-center flex-wrap mb-8">
        <BtnPrimary size="lg">Start free trial</BtnPrimary>
        <BtnGhost>
          <div className="w-5 h-5 rounded-full border border-white/25 flex items-center justify-center flex-shrink-0">
            <PlayIcon />
          </div>
          Watch 2-min demo
        </BtnGhost>
      </div>
      <div className="flex items-center gap-4 justify-center flex-wrap">
        <TrustItem text="No credit card" />
        <div className="w-px h-3.5 bg-white/10" />
        <TrustItem text="Cancel anytime" />
        <div className="w-px h-3.5 bg-white/10" />
        <TrustItem text="SSL secured" />
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="px-11 py-7 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-4">
    <div className="flex items-center gap-2">
      <LogoMark size={24} />
      <span className="font-sora text-[13px] font-bold text-white/40">DriveIQ © 2026</span>
    </div>
    <div className="flex gap-5">
      {['Privacy','Terms','Contact','Status'].map(l => (
        <a key={l} href="#" className="text-[12px] text-white/25 hover:text-white/50 transition-colors duration-200 font-dm">{l}</a>
      ))}
    </div>
    <span className="text-[11px] text-white/20 font-dm">Made with care in Morocco</span>
  </footer>
);

// ─────────────────────────────────────────────────────────────
// ROOT PAGE
// ─────────────────────────────────────────────────────────────
const HomePage = () => (
  <div className="min-h-screen bg-[#060B18] font-dm text-white overflow-x-hidden">
    <style>{`
      @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(7px)} }
      @keyframes floatC { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    `}</style>
    <Nav />
    <HeroSection />
    <LogosStrip />
    <FeaturesSection />
    <ShowcaseSection />
    <MetricsSection />
    <TestimonialsSection />
    <CtaSection />
    <Footer />
  </div>
);

export default HomePage;