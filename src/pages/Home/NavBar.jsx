import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

/*
 * DriveIQ — NavBar.jsx
 * Stack  : React 18 + Tailwind CSS v3 + React Router v6
 * Fonts  : Sora + DM Sans (same as rest of app)
 *
 * Features:
 *  - Sticky with scroll-aware blur/bg transition
 *  - Active route highlighting via useLocation
 *  - Fully responsive: desktop / tablet / mobile
 *  - Mobile: slide-down drawer menu with overlay
 *  - Hamburger → X animated icon
 *  - Closes on route change, outside click, or Escape key
 *  - Keyboard accessible (focus trap optional)
 */

// ── Logo mark ────────────────────────────────────────────────
const LogoMark = ({ size = 32 }) => (
  <div
    className="bg-blue-600 flex items-center justify-center flex-shrink-0"
    style={{ width: size, height: size, borderRadius: Math.round(size * 0.28) }}
  >
    <svg
      width={Math.round(size * 0.56)}
      height={Math.round(size * 0.56)}
      viewBox="0 0 18 18"
      fill="none"
    >
      <path d="M9 2L15 7.5V16H3V7.5L9 2Z" fill="white" />
      <rect x="6.5" y="10" width="5" height="6" rx="1" fill="#1D4ED8" />
    </svg>
  </div>
);

// ── Nav links config ─────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Features', to: '/#features' },
  { label: 'Pricing',  to: '/pricing' },
  { label: 'Schools',  to: '/schools' },
  { label: 'Blog',     to: '/blog' },
  { label: 'Docs',     to: '/docs' },
];

// ── Hamburger / Close icon ────────────────────────────────────
const MenuIcon = ({ open }) => (
  <div className="relative w-5 h-5 flex flex-col justify-center gap-[5px]">
    <span
      className={[
        'block h-[1.5px] bg-white/70 rounded-full transition-all duration-300 origin-center',
        open ? 'rotate-45 translate-y-[6.5px]' : '',
      ].join(' ')}
    />
    <span
      className={[
        'block h-[1.5px] bg-white/70 rounded-full transition-all duration-200',
        open ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100',
      ].join(' ')}
    />
    <span
      className={[
        'block h-[1.5px] bg-white/70 rounded-full transition-all duration-300 origin-center',
        open ? '-rotate-45 -translate-y-[6.5px]' : '',
      ].join(' ')}
    />
  </div>
);

// ── Mobile menu overlay ───────────────────────────────────────
const MobileMenu = ({ open, onClose, activeRoute }) => {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={[
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* Drawer */}
      <div
        className={[
          'fixed top-0 left-0 right-0 z-50 bg-[#0B1221] border-b border-white/[0.08]',
          'transition-transform duration-350 ease-[cubic-bezier(0.32,0.72,0,1)]',
          open ? 'translate-y-0' : '-translate-y-full',
        ].join(' ')}
      >
        {/* Drawer top bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <LogoMark size={30} />
            <span className="font-sora text-[15px] font-bold text-white tracking-tight">
              DriveIQ
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-9 h-9 flex items-center justify-center rounded-lg
              bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08]
              transition-colors duration-200"
          >
            <MenuIcon open={true} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="px-5 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link, i) => {
            const isActive = activeRoute === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={[
                  'flex items-center justify-between px-4 py-3.5 rounded-xl',
                  'text-[15px] font-medium font-dm transition-all duration-200',
                  'border',
                  isActive
                    ? 'bg-blue-600/15 border-blue-500/25 text-blue-300'
                    : 'bg-transparent border-transparent text-white/55 hover:bg-white/[0.04] hover:text-white hover:border-white/[0.07]',
                ].join(' ')}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* CTA buttons */}
        <div className="px-5 pb-6 pt-2 flex flex-col gap-3 border-t border-white/[0.06]">
          {/* Trust badge */}
          <div className="flex items-center justify-center gap-2 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[12px] text-white/30 font-dm">
              14-day free trial · No card required
            </span>
          </div>

          <Link
            to="/login"
            onClick={onClose}
            className="w-full py-3 text-center text-[14px] font-semibold font-dm
              text-white/65 border border-white/[0.12] rounded-xl
              hover:text-white hover:border-white/25 hover:bg-white/[0.04]
              transition-all duration-200"
          >
            Login
          </Link>

          <Link
            to="/register"
            onClick={onClose}
            className="w-full py-3 text-center text-[14px] font-bold font-dm
              text-white bg-blue-600 rounded-xl
              hover:bg-blue-500 active:scale-[0.99]
              transition-all duration-200
              shadow-[0_8px_24px_rgba(37,99,235,0.25)]"
          >
            Start free trial
          </Link>
        </div>
      </div>
    </>
  );
};

// ── Main NavBar component ─────────────────────────────────────
const NavBar = () => {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const location                  = useLocation();
  const activeRoute               = location.pathname;

  // Scroll detection
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={[
          'sticky top-0 z-40 transition-all duration-300',
          'border-b border-white/[0.06]',
          scrolled
            ? 'bg-[#060B18]/95 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.04)]'
            : 'bg-[#060B18]',
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-5 sm:px-8 lg:px-11 py-4">

          {/* ── Logo ── */}
          <Link
            to="/"
            className="flex items-center gap-2.5 flex-shrink-0"
            aria-label="DriveIQ home"
          >
            <LogoMark size={32} />
            <span className="font-sora text-[15px] font-bold text-white tracking-tight">
              DriveIQ
            </span>
          </Link>

          {/* ── Desktop nav links (lg+) ── */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              const isActive = activeRoute === link.to ||
                (link.to !== '/' && activeRoute.startsWith(link.to.replace('/#', '/')));
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={[
                    'px-3.5 py-2 rounded-lg text-[13px] font-medium font-dm',
                    'transition-all duration-200',
                    isActive
                      ? 'text-white bg-white/[0.07]'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.04]',
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ── Desktop CTA (sm+) ── */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              to="/login"
              className="px-4 py-2 text-[13px] font-medium font-dm text-white/60
                border border-white/[0.10] rounded-lg bg-transparent
                hover:text-white hover:border-white/25 hover:bg-white/[0.04]
                transition-all duration-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-[13px] font-semibold font-dm text-white
                bg-blue-600 rounded-lg hover:bg-blue-500
                hover:-translate-y-px transition-all duration-200
                shadow-[0_4px_14px_rgba(37,99,235,0.25)]"
            >
              Start free trial
            </Link>
          </div>

          {/* ── Mobile: Login link + hamburger ── */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              to="/login"
              className="px-3 py-1.5 text-[12px] font-medium font-dm text-white/55
                border border-white/[0.10] rounded-lg
                hover:text-white hover:border-white/25
                transition-all duration-200"
            >
              Login
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="w-9 h-9 flex items-center justify-center rounded-lg
                bg-white/[0.05] border border-white/[0.08]
                hover:bg-white/[0.09] transition-colors duration-200"
            >
              <MenuIcon open={false} />
            </button>
          </div>

          {/* ── Tablet: hamburger only (sm to lg) ── */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="hidden sm:flex lg:hidden w-9 h-9 items-center justify-center
              rounded-lg bg-white/[0.05] border border-white/[0.08]
              hover:bg-white/[0.09] transition-colors duration-200"
          >
            <MenuIcon open={false} />
          </button>

        </div>
      </header>

      {/* Mobile / tablet drawer (shown below lg) */}
      <div className="lg:hidden">
        <MobileMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          activeRoute={activeRoute}
        />
      </div>
    </>
  );
};

export default NavBar;