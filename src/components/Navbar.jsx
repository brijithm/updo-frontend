import { NavLink } from "react-router-dom";

// Shared top nav used on Dashboard, Campaign, Brand Settings, and Home.
// Active-route highlighting is handled entirely by NavLink — no backend needed.
const NAV_LINKS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Campaign", to: "/campaign" },
  { label: "Brand Settings", to: "/brand-settings" },
  { label: "Home", to: "/" },
];

export default function Navbar() {
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
        <ul className="flex items-center gap-8 px-6">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `relative pb-1 text-2xl font-normal font-['K2D'] transition-colors ${
                    isActive
                      ? "text-white after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-[3px] after:rounded-full after:bg-purple-500 after:shadow-[0_0_4px_1px_rgba(169,88,250,0.5)]"
                      : "text-white/70 hover:text-white"
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