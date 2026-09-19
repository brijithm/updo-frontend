import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
// MOBILE ONLY: same logo used across the app's mobile headers.
import updoLogo from "../assets/logo.png";

// Shared top nav used on Dashboard, Campaign, Scheduler, Brand Settings, and Home.
// Active-route highlighting is handled by NavLink; the underline position
// is tracked separately (desktop only) so it can slide smoothly between tabs.
const NAV_LINKS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Campaign", to: "/campaign" },
  { label: "Scheduler", to: "/scheduler" },
  { label: "Brand Settings", to: "/brand-settings" },
  { label: "Home", to: "/" },
];

export default function Navbar() {
  const location = useLocation();
  const linkRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const active = NAV_LINKS.find((link) =>
      link.to === "/" ? location.pathname === "/" : location.pathname.startsWith(link.to)
    );
    const el = active && linkRefs.current[active.to];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth, opacity: 1 });
    }
  }, [location.pathname]);

  // MOBILE ONLY: burger drawer state + smooth open/close.
  // Open: keyframe slide-in + staggered link entrance (same as Dashboard's drawer).
  // Close: transition plays before the drawer unmounts, no snap-close.
  const [menuOpen, setMenuOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  function closeMenu() {
    setClosing(true);
    setTimeout(() => {
      setMenuOpen(false);
      setClosing(false);
    }, 300); // must match the transition duration below
  }

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      {/* MOBILE ONLY: drawer open animations. No fill-mode on the panel/backdrop
          so the closing transition below can still move them. */}
      <style>{`
        @keyframes navDrawerFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes navDrawerSlideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes navDrawerItemIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .nav-drawer-backdrop { animation: navDrawerFade 250ms ease-out; }
        .nav-drawer-panel    { animation: navDrawerSlideIn 350ms cubic-bezier(0.22, 1, 0.36, 1); }
        .nav-drawer-item     { animation: navDrawerItemIn 450ms cubic-bezier(0.22, 1, 0.36, 1) both; }

        @media (prefers-reduced-motion: reduce) {
          .nav-drawer-backdrop, .nav-drawer-panel, .nav-drawer-item { animation: none; }
        }
      `}</style>

      {/* ===================================================================
          DESKTOP / TABLET (md and up) — original floating pill nav, untouched.
          =================================================================== */}
      <header className="hidden md:flex relative w-full justify-center pt-8">
        {/* Ambient glow behind the nav — gives the backdrop-blur something to catch */}
        <div className="absolute left-1/2 -translate-x-1/2 top-3 w-72 h-14 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <nav className="relative overflow-hidden flex items-center gap-2 bg-purple-900/20 backdrop-blur-xl outline outline-1 outline-offset-[-1px] outline-white/15 shadow-[0_8px_32px_rgba(80,40,150,0.25)] rounded-[50px] px-2 py-2 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-white/0 before:pointer-events-none">
          {/* Logo pill */}
          <div className="relative overflow-hidden bg-purple-800/30 backdrop-blur-md outline outline-1 outline-offset-[-1px] outline-white/10 shadow-[0_2px_10px_rgba(90,40,160,0.2)] rounded-[50px] px-6 py-3 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-white/0 before:pointer-events-none">
            <span className="relative text-neutral-100 text-2xl font-normal font-['K2D']">
              UPDO AI
            </span>
          </div>

          {/* Links */}
          <ul className="relative flex items-center gap-8 px-6">
            {/* Sliding active-tab indicator — repositions on route change */}
            <span
              className="absolute -bottom-1 h-[3px] rounded-full bg-purple-500 shadow-[0_0_4px_1px_rgba(169,88,250,0.5)] transition-all duration-300 ease-out"
              style={{ left: indicator.left, width: indicator.width, opacity: indicator.opacity }}
            />
            {NAV_LINKS.map((link) => (
              <li key={link.to} ref={(el) => (linkRefs.current[link.to] = el)}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `relative pb-1 text-2xl font-normal font-['K2D'] transition-colors duration-300 ${
                      isActive ? "text-white" : "text-white/70 hover:text-white"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* ===================================================================
          MOBILE (<md) — logo + burger header, right-side drawer.
          =================================================================== */}
      <header className="md:hidden sticky top-0 z-30 h-[66px] w-full flex items-center justify-between px-[15px] bg-[#000b2e]/90 backdrop-blur-md border-b border-slate-700/40">
        <img src={updoLogo} alt="UPDO" className="h-7 w-14 object-cover" />
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          className="w-11 h-11 -mr-2 flex items-center justify-center text-indigo-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-300 rounded-lg"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {(menuOpen || closing) && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className={`nav-drawer-backdrop absolute inset-0 bg-black/50 transition-opacity duration-300 ${
              closing ? "opacity-0" : "opacity-100"
            }`}
            onClick={closeMenu}
            aria-hidden="true"
          />
          <nav
            id="mobile-navigation"
            aria-label="Main navigation"
            className={`nav-drawer-panel absolute right-0 top-0 h-full w-[218px] max-w-[80vw] bg-[#00061f] border-l border-slate-700/40 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              closing ? "translate-x-full" : "translate-x-0"
            }`}
          >
            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close navigation menu"
              className="absolute right-[10px] top-[10px] w-11 h-11 flex items-center justify-center text-indigo-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-300 rounded-lg"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <ul className="pt-[111px] pl-6 pr-4 flex flex-col items-start gap-5">
              {NAV_LINKS.map((link, i) => (
                <li
                  key={link.to}
                  className="nav-drawer-item"
                  style={{ animationDelay: `${180 + i * 70}ms` }}
                >
                  <NavLink
                    to={link.to}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `text-indigo-100 text-2xl font-normal font-['K2D'] leading-tight whitespace-nowrap border-b-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300 ${
                        isActive ? "border-purple-500" : "border-transparent"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}