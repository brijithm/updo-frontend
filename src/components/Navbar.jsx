import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

// Shared top nav used on Dashboard, Campaign, Brand Settings, and Home.
// Active-route highlighting is handled by NavLink; the underline position
// is tracked separately so it can slide smoothly between tabs.
const NAV_LINKS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Campaign", to: "/campaign" },
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

  return (
    <header className="relative w-full flex justify-center pt-8">
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
  );
}