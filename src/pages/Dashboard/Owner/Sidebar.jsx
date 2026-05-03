import { NavLink, useLocation } from 'react-router-dom';

/* ─────────────────────────────────────────────
   Sidebar — School Owner Dashboard
   Sticky left panel with school context card,
   nav groups, and owner profile footer.
───────────────────────────────────────────── */

const LogoMark = () => (
  <div className="w-7 h-7 bg-blue-600 rounded-[7px] flex items-center justify-center flex-shrink-0">
    <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
      <path d="M9 2L15 7.5V16H3V7.5L9 2Z" fill="white" />
      <rect x="6.5" y="10" width="5" height="6" rx="1" fill="#1D4ED8" />
    </svg>
  </div>
);

const NavItem = ({ to, icon, label, badge, badgeColor = 'blue' }) => {
  const badgeStyles = {
    blue:   'bg-blue-600/20 text-blue-400',
    amber:  'bg-amber-500/20 text-amber-400',
    red:    'bg-red-500/20 text-red-400',
    green:  'bg-emerald-500/20 text-emerald-400',
  };

  return (
    <NavLink
      to={to}
      className={({ isActive }) => [
        'flex items-center gap-2.5 px-2.5 py-2 rounded-[9px] mx-2 my-px',
        'text-[12px] font-medium transition-all duration-200 group',
        isActive
          ? 'bg-blue-600/15 text-blue-300 font-semibold'
          : 'text-white/40 hover:bg-white/[0.04] hover:text-white/80',
      ].join(' ')}
    >
      <span className="w-3.5 h-3.5 flex-shrink-0 opacity-70 group-[.active]:opacity-100">
        {icon}
      </span>
      <span className="flex-1 font-dm">{label}</span>
      {badge !== undefined && (
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md font-dm ${badgeStyles[badgeColor]}`}>
          {badge}
        </span>
      )}
    </NavLink>
  );
};

const SectionLabel = ({ text }) => (
  <div className="px-4 pt-3 pb-1 text-[10px] font-bold text-white/20 tracking-[0.8px] font-dm">
    {text}
  </div>
);

// ── SVG icons ─────────────────────────────────────────────────
const icons = {
  grid: <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><rect x="1" y="1" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/><rect x="8" y="1" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="8" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/><rect x="8" y="8" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/></svg>,
  calendar: <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 5h12M4 1v2M10 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  students: <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><circle cx="7" cy="4.5" r="2.8" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 13c0-3 2.5-4.5 5.5-4.5S12 10 12 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  instructors: <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><path d="M7 1l1.4 4h4.1L9.1 7.4l1.4 4.2L7 8.8 3.5 11.6l1.4-4.2L1.5 5h4.1z" stroke="currentColor" strokeWidth="1.1"/></svg>,
  payments: <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><path d="M2 7h10M7 2v10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/></svg>,
  invoices: <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 4h6M4 7h6M4 10h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
  reports: <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><path d="M2 10l3-5 2.5 3L10 4l2 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  messages: <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><path d="M12 2H2a1 1 0 00-1 1v6a1 1 0 001 1h3l2 2.5L9 10h3a1 1 0 001-1V3a1 1 0 00-1-1z" stroke="currentColor" strokeWidth="1.2"/></svg>,
  feedback: <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><path d="M7 1l1.4 4h4.1L9.1 7.4l1.4 4.2L7 8.8 3.5 11.6l1.4-4.2L1.5 5h4.1z" stroke="currentColor" strokeWidth="1.1"/></svg>,
  settings: <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.5 2.5l1 1M10.5 10.5l1 1M11.5 2.5l-1 1M3.5 10.5l-1 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
};

// ─────────────────────────────────────────────────────────────
const Sidebar = () => (
  <aside className="w-[212px] flex-shrink-0 bg-[#0B1221] border-r border-white/[0.06]
    flex flex-col h-screen sticky top-0 overflow-y-auto">

    {/* Logo */}
    <div className="flex items-center gap-2.5 px-4 py-[18px] border-b border-white/[0.06]">
      <LogoMark />
      <span className="font-sora text-[14px] font-bold text-white tracking-tight">DriveIQ</span>
    </div>

    {/* School context card */}
    <div className="mx-2.5 mt-3 bg-blue-600/10 border border-blue-500/20 rounded-xl px-3 py-2.5">
      <div className="font-sora text-[12px] font-bold text-white mb-1">Auto École Atlas</div>
      <div className="flex items-center gap-1 text-[10px] text-white/35 font-dm mb-2">
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
          <circle cx="4.5" cy="3.2" r="1.6" stroke="currentColor" strokeWidth="0.9" />
          <path d="M4.5 8.5C4.5 8.5 1 5.8 1 3.2a3.5 3.5 0 017 0c0 2.6-3.5 5.3-3.5 5.3z"
            stroke="currentColor" strokeWidth="0.9" />
        </svg>
        Casablanca, Morocco
      </div>
      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md
        bg-violet-600/20 text-violet-400 font-dm">
        Pro Plan
      </span>
    </div>

    {/* Nav */}
    <nav className="flex-1 pt-1">
      <SectionLabel text="MAIN" />
      <NavItem to="/dashboard"     icon={icons.grid}        label="Dashboard" />
      <NavItem to="/schedule"      icon={icons.calendar}    label="Schedule"    badge={31}  badgeColor="blue" />
      <NavItem to="/students"      icon={icons.students}    label="Students"    badge={142} badgeColor="blue" />
      <NavItem to="/instructors"   icon={icons.instructors} label="Instructors" />

      <SectionLabel text="FINANCE" />
      <NavItem to="/payments"      icon={icons.payments}    label="Payments"    badge={3}   badgeColor="amber" />
      <NavItem to="/invoices"      icon={icons.invoices}    label="Invoices" />
      <NavItem to="/reports"       icon={icons.reports}     label="Reports" />

      <SectionLabel text="ENGAGE" />
      <NavItem to="/messages"      icon={icons.messages}    label="Messages"    badge={5}   badgeColor="red" />
      <NavItem to="/feedback"      icon={icons.feedback}    label="Feedback" />

      <SectionLabel text="SYSTEM" />
      <NavItem to="/settings"      icon={icons.settings}    label="Settings" />
    </nav>

    {/* Owner profile */}
    <div className="p-3 border-t border-white/[0.06]">
      <div className="flex items-center gap-2.5 bg-[#0F1A2E] border border-white/[0.07]
        rounded-xl px-3 py-2.5 cursor-pointer hover:border-white/[0.12] transition-colors">
        <div className="w-7 h-7 rounded-full bg-violet-700 flex items-center justify-center
          text-[10px] font-bold text-white flex-shrink-0 font-dm">
          KA
        </div>
        <div className="min-w-0">
          <div className="text-[12px] font-semibold text-white font-dm truncate">Karim Alaoui</div>
          <div className="text-[10px] text-white/30 font-dm">School Owner</div>
        </div>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ml-auto text-white/25 flex-shrink-0">
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  </aside>
);

export default Sidebar;