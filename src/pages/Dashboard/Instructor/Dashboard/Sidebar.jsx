import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

/* ─────────────────────────────────────────────
   Sidebar — School Instructor Dashboard
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
    blue:  'bg-blue-600/20 text-blue-400',
    amber: 'bg-amber-500/20 text-amber-400',
    red:   'bg-red-500/20 text-red-400',
    green: 'bg-emerald-500/20 text-emerald-400',
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

const icons = {
  grid:        <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><rect x="1" y="1" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/><rect x="8" y="1" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="8" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/><rect x="8" y="8" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/></svg>,
  calendar:    <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 5h12M4 1v2M10 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  students:    <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><circle cx="7" cy="4.5" r="2.8" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 13c0-3 2.5-4.5 5.5-4.5S12 10 12 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  payments:    <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><path d="M2 7h10M7 2v10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/></svg>,
  invoices:    <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 4h6M4 7h6M4 10h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
  reports:     <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><path d="M2 10l3-5 2.5 3L10 4l2 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  messages:    <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><path d="M12 2H2a1 1 0 00-1 1v6a1 1 0 001 1h3l2 2.5L9 10h3a1 1 0 001-1V3a1 1 0 00-1-1z" stroke="currentColor" strokeWidth="1.2"/></svg>,
  feedback:    <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><path d="M7 1l1.4 4h4.1L9.1 7.4l1.4 4.2L7 8.8 3.5 11.6l1.4-4.2L1.5 5h4.1z" stroke="currentColor" strokeWidth="1.1"/></svg>,
  settings:    <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.5 2.5l1 1M10.5 10.5l1 1M11.5 2.5l-1 1M3.5 10.5l-1 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  lessons:     <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><path d="M2 2h8v8H2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 4l2-1v7l-2 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 5h4M4 7h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
  attendance:  <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M7 3v4l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  vehicle:     <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><rect x="1.5" y="5" width="11" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M3.5 10v1.5M10.5 10v1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="4.5" cy="10" r="1.2" stroke="currentColor" strokeWidth="1"/><circle cx="9.5" cy="10" r="1.2" stroke="currentColor" strokeWidth="1"/><path d="M4.5 5l1-2.5h3l1 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  // Additional icons for profile menu
  profile:     <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><circle cx="7" cy="4.5" r="2.8" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 13c0-3 2.5-4.5 5.5-4.5S12 10 12 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  logout:      <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M9.5 9.5L13 7l-3.5-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M13 7H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  help:        <svg viewBox="0 0 14 14" fill="none" className="w-full h-full"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 5.5a1.5 1.5 0 012.8.7c0 1-1.3 1.3-1.3 2.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="7" cy="10.5" r="0.6" fill="currentColor"/></svg>,
};

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/10 rounded ${className}`} />
);

const getInitials = (first = '', last = '') =>
  `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '?';

// ── Profile Popup Menu ────────────────────────────────────────
const ProfileMenu = ({ instructor, fullName, initials, pictureUrl, onClose, menuRef }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const refresh =
      localStorage.getItem('refresh') || sessionStorage.getItem('refresh');

    try {
      await axios.post(
        `${API}/auth/logout/`,
        { refresh },
        {
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem('access') || sessionStorage.getItem('access')
            }`,
          },
        }
      );
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      sessionStorage.removeItem('access');
      sessionStorage.removeItem('refresh');
      delete axios.defaults.headers.common['Authorization'];
      navigate('/login');
    }
  };

  const menuItems = [
    
      {
        icon: icons.profile,
        label: 'My Profile',
        sub: 'View & edit your info',
        onClick: () => { navigate('/dashboard/student/my-profile'); onClose(); },
      },
    
  ];

  return (
    <div
      ref={menuRef}
      className="absolute bottom-[calc(100%+8px)] left-2 right-2 z-50
        bg-[#0F1A2E] border border-white/[0.09] rounded-2xl shadow-2xl shadow-black/60
        overflow-hidden"
      style={{ animation: 'slideUp 0.18s ease' }}
    >
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header — avatar + name */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
        {pictureUrl ? (
          <img
            src={pictureUrl}
            alt={fullName}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30 flex-shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-blue-600
            flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-[12px] font-semibold text-white font-dm truncate">{fullName || '—'}</div>
          <div className="text-[10px] text-white/35 font-dm truncate">
            {instructor?.email || 'School Instructor'}
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1.5">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="w-full flex items-center gap-3 px-4 py-2.5
              hover:bg-white/[0.05] transition-colors group text-left"
          >
            <span className="w-3.5 h-3.5 flex-shrink-0 text-white/35 group-hover:text-white/60 transition-colors">
              {item.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[11.5px] font-medium text-white/70 group-hover:text-white/90 font-dm transition-colors">
                {item.label}
              </div>
              <div className="text-[10px] text-white/25 font-dm">{item.sub}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Divider + Logout */}
      <div className="border-t border-white/[0.06] px-2.5 py-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            hover:bg-red-500/10 transition-colors group text-left"
        >
          <span className="w-3.5 h-3.5 flex-shrink-0 text-red-400/60 group-hover:text-red-400 transition-colors">
            {icons.logout}
          </span>
          <div>
            <div className="text-[11.5px] font-medium text-red-400/70 group-hover:text-red-400 font-dm transition-colors">
              Log out
            </div>
            <div className="text-[10px] text-white/20 font-dm">End your session</div>
          </div>
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
const Sidebar = () => {
  const [school,       setSchool]       = useState(null);
  const [instructor,   setInstructor]   = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [menuOpen,     setMenuOpen]     = useState(false);

  const menuRef    = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: userData } = await axios.get(`${API}/users/me/`, {
          withCredentials: true,
          signal: controller.signal,
        });
        setInstructor(userData);

        const { data: schoolData } = await axios.get(`${API}/drivingschool/`, {
          withCredentials: true,
          signal: controller.signal,
        });
        const school = Array.isArray(schoolData)
          ? schoolData[0]
          : schoolData?.results?.[0] ?? null;
        setSchool(school);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error('[Sidebar] fetch error:', err);
        setError(err.response?.data?.detail || 'Failed to load sidebar data');
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const initials           = instructor ? getInitials(instructor.first_name, instructor.last_name) : '??';
  const fullName           = instructor
    ? `${instructor.first_name ?? ''} ${instructor.last_name ?? ''}`.trim() || instructor.username
    : '';
  const picture_profile_url = instructor?.picture_profile_url;
  const schoolAddr         = school?.address ?? '';

  return (
    <aside
      className="w-[212px] flex-shrink-0 bg-[#0B1221] border-r border-white/[0.06]
        flex flex-col h-screen sticky top-0 overflow-y-auto"
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-2.5 px-4 py-[18px] border-b border-white/[0.06]">
        <LogoMark />
        <span className="font-sora text-[14px] font-bold text-white tracking-tight">DriveOJ</span>
      </div>

      {/* ── School context card ── */}
      <div className="mx-2.5 mt-3 bg-blue-600/10 border border-blue-500/20 rounded-xl px-3 py-2.5 min-h-[68px]">
        {loading ? (
          <div className="space-y-1.5 pt-0.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        ) : error ? (
          <span className="text-[10px] text-red-400/60 font-dm">Unable to load school info</span>
        ) : (
          <>
            <div className="font-sora text-[12px] font-bold text-white mb-1 truncate">
              {school?.name || '—'}
            </div>
            {schoolAddr && (
              <div className="flex items-center gap-1 text-[10px] text-white/35 font-dm">
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <circle cx="4.5" cy="3.2" r="1.6" stroke="currentColor" strokeWidth="0.9" />
                  <path d="M4.5 8.5C4.5 8.5 1 5.8 1 3.2a3.5 3.5 0 017 0c0 2.6-3.5 5.3-3.5 5.3z" stroke="currentColor" strokeWidth="0.9" />
                </svg>
                <span className="truncate">{schoolAddr}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 pt-1">
        <SectionLabel text="MAIN" />
        <NavItem to="/dashboard/instructor"                    icon={icons.grid}        label="Dashboard"   />
        <NavItem to={'/dashboard/instructor/students'}          icon={icons.students}    label="Students"    />
        <NavItem to={'/dashboard/instructor/schedule'}            icon={icons.calendar}    label="Schedule"    />
        <NavItem to={'/dashboard/instructor/lesson'}             icon={icons.lessons}     label="Lessons"     />
        <NavItem to={'/dashboard/instructor/attendance'}   icon={icons.attendance}  label="Attendance"  />
        <NavItem to={'/dashboard/instructor/vehicle'}            icon={icons.vehicle}     label="Vehicle"     />

        <SectionLabel text="FINANCE" />
        <NavItem to={'/dashboard/instructor/analytics'}          icon={icons.reports}     label="Analytics"   />

        <SectionLabel text="ENGAGE" />
        <NavItem to={'/dashboard/instructor/template'}            icon={icons.messages}    label="Template"    />
        <NavItem to={'/dashboard/instructor/messages'}   icon={icons.messages}    label="Messages"    badgeColor="red" />
        <NavItem to={'/dashboard/instructor/feedback'}           icon={icons.feedback}    label="Feedback"    />

        <SectionLabel text="ACCOUNT" />
        <NavItem to="/dashboard/instructor/my-profile"   icon={icons.profile}     label="My profile" />

      </nav>

      {/* ── Profile footer ── */}
      <div className="p-3 border-t border-white/[0.06] relative">
        {/* Profile popup menu — rendered above the trigger */}
        {menuOpen && (
          <ProfileMenu
            instructor={instructor}
            fullName={fullName}
            initials={initials}
            pictureUrl={picture_profile_url}
            onClose={() => setMenuOpen(false)}
            menuRef={menuRef}
          />
        )}

        {/* Trigger button */}
        <button
          ref={triggerRef}
          onClick={() => setMenuOpen((v) => !v)}
          className={[
            'w-full flex items-center gap-2.5 bg-[#0F1A2E] border rounded-xl px-3 py-2.5',
            'cursor-pointer transition-all duration-200 text-left',
            menuOpen
              ? 'border-blue-500/40 bg-blue-600/10'
              : 'border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.03]',
          ].join(' ')}
        >
          {loading ? (
            <>
              <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </>
          ) : (
            <>
              {picture_profile_url ? (
                <img
                  src={picture_profile_url}
                  alt={fullName}
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-blue-600
                  flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-semibold text-white font-dm truncate">
                  {fullName || '—'}
                </div>
                <div className="text-[10px] text-white/30 font-dm">School Instructor</div>
              </div>

              {/* Chevron — rotates when open */}
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none"
                className={`ml-auto text-white/30 flex-shrink-0 transition-transform duration-200 ${menuOpen ? 'rotate-180 text-blue-400' : ''}`}
              >
                <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>

        {error && !loading && (
          <p className="mt-1.5 text-[9px] text-red-400/50 font-dm text-center">
            Could not load profile
          </p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;