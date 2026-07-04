import React, { useRef, useState, useEffect } from "react";
import logo from "../assets/logo.png";
import linkedinIcon from "../assets/LinkedIn.svg";
import instagramIcon from "../assets/Instagram.svg";
import xIcon from "../assets/X.svg";
import facebookIcon from "../assets/Facebook.svg";
import whatsappIcon from "../assets/WhatsApp.svg";
import { Link } from "react-router-dom";

const socials = [
  { icon: linkedinIcon, label: "LinkedIn", href: "#" },
  { icon: instagramIcon, label: "Instagram", href: "#" },
  { icon: xIcon, label: "X", href: "#" },
  { icon: facebookIcon, label: "Facebook", href: "#" },
  { icon: whatsappIcon, label: "WhatsApp", href: "#" },
];

function GlowBorder({ as: Tag = "div", radius = "9999px", size = 220, className = "", children, ...rest }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [active, setActive] = useState(false);

  function handleMove(e) {
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  }

  return (
    <Tag
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className={"relative transition-transform duration-200 hover:-translate-y-0.5 " + className}
      style={{ borderRadius: radius }}
      {...rest}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          borderRadius: radius,
          opacity: active ? 1 : 0,
          padding: 1,
          background: "radial-gradient(" + size + "px circle at " + pos.x + "% " + pos.y + "%, rgba(255,255,255,0.9), rgba(102,51,153,0.6) 35%, transparent 60%)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      {children}
    </Tag>
  );
}

export default function LandingPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 200);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className={`w-full min-h-screen bg-[#000B2E] text-white overflow-hidden ${ready ? "start-anim" : ""}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Afacad+Flux:wght@400;500;600&family=Doto:wght@400;500;600;700&family=Poppins:wght@400;500&display=swap');
        .font-afacad { font-family: "Afacad Flux", ui-sans-serif, system-ui, sans-serif; }
        .font-poppins { font-family: "Poppins", ui-sans-serif, system-ui, sans-serif; }
        .font-doto { font-family: "Doto", ui-sans-serif, system-ui, sans-serif; }
        .fullstop-box {
          display: inline-block;
          width: 0.10em;
          height: 0.10em;
          background-color: currentColor;
          margin-left: 0.05em;
          vertical-align: baseline;
          transform: translateY(-0.02em);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { opacity: 0; }
        .start-anim .fade-up { animation: fadeUp 0.7s ease-out both; }
        .fade-up-1 { animation-delay: 0.05s; }
        .fade-up-2 { animation-delay: 0.15s; }
        .fade-up-3 { animation-delay: 0.25s; }
        .fade-up-4 { animation-delay: 0.35s; }
        .fade-up-5 { animation-delay: 0.45s; }

        @media (prefers-reduced-motion: reduce) {
          .fade-up { animation: none; }
        }
      `}</style>

      <header className="relative flex items-center justify-between px-6 sm:px-10 h-[92px]">
        <img src={logo} alt="UPDO" className="h-8 sm:h-9 w-auto" />

        <nav className="flex items-center gap-6 sm:gap-8 font-afacad">
          <Link to="/login" className="text-lg sm:text-xl text-[#F5F5F5] hover:opacity-80 transition-opacity">Log In</Link>
          <GlowBorder as={Link} to="/login" size={140} className="rounded-full px-6 py-2.5 text-lg sm:text-xl text-[#F5F5F5]/80 bg-[rgba(102,51,153,0.20)] hover:bg-[rgba(102,51,153,0.32)]">Get Started</GlowBorder>
        </nav>

        <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </header>

      <section className="flex flex-col items-center text-center px-6 pt-12 sm:pt-16 pb-16">
        <h1 className="fade-up fade-up-1 font-doto text-[40px] sm:text-[56px] lg:text-[72px] leading-[1.15] max-w-4xl">
          Marketing content
          <br />
          in seconds<span className="fullstop-box" /> 
        </h1>

        <p className="fade-up fade-up-2 font-doto mt-8 max-w-3xl text-[#F5F7FA] text-base sm:text-lg lg:text-xl leading-relaxed">
          AI-powered posters, captions &amp; scheduling planner for small businesses <span className="fullstop-box" /> No design skills needed <span className="fullstop-box" />
        </p>

        <div className="fade-up fade-up-3 mt-10 flex flex-col sm:flex-row items-center gap-4 font-afacad">
          <GlowBorder as={Link} to="/login" size={260} className="px-10 py-4 text-lg sm:text-xl text-[#F5F7FA] bg-[rgba(102,51,153,0.80)] hover:bg-[rgba(102,51,153,0.95)]">Start Creating Today</GlowBorder>
          <GlowBorder as={Link} to="/demo" size={200} className="px-10 py-4 text-lg sm:text-xl text-[#F5F5F5] bg-[rgba(102,51,153,0.20)] hover:bg-[rgba(102,51,153,0.32)]">Watch Demo</GlowBorder>
        </div>
      </section>

      <section className="fade-up fade-up-4 px-6 sm:px-10 pb-24">
        <GlowBorder size={420} className="mx-auto max-w-[1338px] py-16 sm:py-20 flex flex-col items-center justify-center gap-3 border border-white/10 bg-gradient-to-r from-[rgba(15,24,51,0.35)] to-[rgba(10,19,48,0.35)]">
          <p className="font-afacad text-xl sm:text-2xl text-white">Write Your Review Here…</p>
          <p className="font-afacad text-base sm:text-lg text-white/70">It Helps Us to Improve</p>
        </GlowBorder>
      </section>

      <footer className="fade-up fade-up-5 px-6 sm:px-10 pb-20">
        <div className="mx-auto max-w-[1338px] flex flex-col items-center gap-10">
          <p className="font-afacad self-start text-lg sm:text-xl text-[#F5F7FA]">Contact Us:</p>

          <div className="flex items-center gap-6 sm:gap-8">
            {socials.map(({ icon, label, href }) => (
              <a key={label} href={href} aria-label={label} className="opacity-60 hover:opacity-100 hover:-translate-y-0.5 transition-all">
                <img src={icon} alt={label} className="w-9 h-9 sm:w-10 sm:h-10" />
              </a>
            ))}
          </div>

          <p className="font-afacad text-sm sm:text-base text-white/50 text-center">
            <a href="#privacy" className="hover:text-white/70 transition-colors">Privacy Policy</a>
            {" "}|{" "}
            <a href="#terms" className="hover:text-white/70 transition-colors">Terms &amp; Conditions</a>
            {" "}Applied
          </p>
        </div>
      </footer>
    </div>
  );
}