import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import updoLogo from "../assets/logo.png";
import { logout } from "../services/sessionUtils";

const NAV_LINKS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Campaign", to: "/campaign" },
  { label: "Scheduler", to: "/scheduler" },
  { label: "Brand Settings", to: "/brand-settings" },
  { label: "Home", to: "/home" },
];

const OPEN_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const CLOSE_MS = 300;

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const linkRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const active = NAV_LINKS.find((link) => location.pathname.startsWith(link.to));
    const el = active && linkRefs.current[active.to];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth, opacity: 1 });
    }
  }, [location.pathname]);

  // MOBILE drawer
  const [menuOpen, setMenuOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const timerRef = useRef(null);
  const closingRef = useRef(false);

  function openMenu() {
    clearTimeout(timerRef.current);
    closingRef.current = false;
    setMenuOpen(true);
  }

  useEffect(() => {
    if (!menuOpen) return;
    let r2;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setShown(true));
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, [menuOpen]);

  function closeMenu(afterClose) {
    if (closingRef.current) return;
    closingRef.current = true;
    setShown(false);
    timerRef.current = setTimeout(() => {
      setMenuOpen(false);
      closingRef.current = false;
      if (afterClose) afterClose();
    }, CLOSE_MS);
  }

  function handleLinkClick(e, to) {
    e.preventDefault();
    if (location.pathname === to) closeMenu();
    else closeMenu(() => navigate(to));
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

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

  const drawer = menuOpen
    ? createPortal(
        <div className="md:hidden fixed inset-0 z-[100]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            style={{
              opacity: shown ? 1 : 0,
              transition: shown
                ? "opacity 250ms ease-out"
                : `opacity ${CLOSE_MS}ms ease-in`,
            }}
            onClick={() => closeMenu()}
            aria-hidden="true"
          />

          {/* Panel */}
          <nav
            id="mobile-navigation"
            aria-label="Main navigation"
            className="absolute right-0 top-0 h-full w-[218px] max-w-[80vw] bg-[#00061f] border-l border-slate-700/40 shadow-2xl"
            style={{
              transform: shown ? "translateX(0)" : "translateX(100%)",
              transition: shown
                ? `transform 350ms ${OPEN_EASE}`
                : `transform ${CLOSE_MS}ms cubic-bezier(0.4, 0, 1, 1)`,
              willChange: "transform",
            }}
          >
            <button
              type="button"
              onClick={() => closeMenu()}
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
                  style={{
                    opacity: shown ? 1 : 0,
                    transform: shown ? "translateX(0)" : "translateX(40px)",
                    transition: shown
                      ? `opacity 450ms ${OPEN_EASE} ${180 + i * 70}ms, transform 450ms ${OPEN_EASE} ${180 + i * 70}ms`
                      : "opacity 150ms ease-in, transform 150ms ease-in",
                  }}
                >
                  <NavLink
                    to={link.to}
                    onClick={(e) => handleLinkClick(e, link.to)}
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

            {/* Log out */}
            <div
              className="absolute bottom-0 left-0 right-0 px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] border-t border-slate-700/40"
              style={{
                opacity: shown ? 1 : 0,
                transition: shown
                  ? `opacity 450ms ${OPEN_EASE} ${180 + NAV_LINKS.length * 70}ms`
                  : "opacity 150ms ease-in",
              }}
            >
              <button
                type="button"
                onClick={logout}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-slate-600 text-indigo-100 text-base font-['K2D'] hover:bg-slate-800/60 active:scale-[0.98] transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Log out
              </button>
            </div>
          </nav>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {/* DESKTOP / TABLET (md+) */}
      <header className="hidden md:flex relative w-full justify-center pt-8">
        <div className="absolute left-1/2 -translate-x-1/2 top-3 w-72 h-14 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <nav className="relative overflow-hidden flex items-center gap-2 bg-purple-900/20 backdrop-blur-xl outline outline-1 outline-offset-[-1px] outline-white/15 shadow-[0_8px_32px_rgba(80,40,150,0.25)] rounded-[50px] px-2 py-2 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-white/0 before:pointer-events-none">
          <div className="relative overflow-hidden bg-purple-800/30 backdrop-blur-md outline outline-1 outline-offset-[-1px] outline-white/10 shadow-[0_2px_10px_rgba(90,40,160,0.2)] rounded-[50px] px-6 py-3 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-white/0 before:pointer-events-none">
            <span className="relative text-neutral-100 text-2xl font-normal font-['K2D']">
              UPDO AI
            </span>
          </div>

          <ul className="relative flex items-center gap-8 px-6">
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

      {/* MOBILE (<md) header */}
      <header className="md:hidden sticky top-0 z-30 h-[66px] w-full flex items-center justify-between px-[15px] bg-[#000b2e]/90 backdrop-blur-md border-b border-slate-700/40">
        <img src={updoLogo} alt="UPDO" className="h-7 w-14 object-cover" />
        <button
          type="button"
          onClick={openMenu}
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

      {drawer}
    </>
  );
}