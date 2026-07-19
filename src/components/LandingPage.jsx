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
];

function GlowBorder({ as: Tag = "div", radius = "9999px", size = 220, lift = true, className = "", children, ...rest }) {
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
      className={`relative transition-transform duration-300 ease-out ${lift ? "hover:-translate-y-0.5" : ""} ${className}`}
      style={{ borderRadius: radius }}
      {...rest}
    >
      {/* Always-on spinning gradient ring */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 spin-glow transition-opacity duration-500 ease-out"
        style={{
          borderRadius: radius,
          opacity: active ? 0 : 0.9,
          padding: 1.5,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      {/* Hover-tracked cursor glow */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-out"
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

function Stars({ value, onChange, size = "text-base" }) {
  const items = [1, 2, 3, 4, 5];
  return (
    <div className={`flex items-center gap-0.5 ${size}`}>
      {items.map((n) => (
        <span
          key={n}
          onClick={onChange ? () => onChange(n) : undefined}
          className={`${onChange ? "cursor-pointer" : ""} ${n <= value ? "text-[#FFD166]" : "text-white/20"} transition-colors duration-150`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function PenIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 20l1.2-4.2a2 2 0 01.53-.92L16.6 4a2 2 0 012.83 0l.57.57a2 2 0 010 2.83L9.14 18.27a2 2 0 01-.92.53L4 20z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.06"
      />
      <path d="M14.5 6.1l3.4 3.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M4 20l1.4-3.9 2.5 2.5L4 20z" fill="currentColor" />
    </svg>
  );
}

const SEED_REVIEWS = [
  { id: "r1", name: "Ananya R.", business: "Bakery Owner", rating: 5, text: "UPDO cut our poster creation time from hours to minutes. The AI understands our brand better than some designers we've hired in the past." },
  { id: "r2", name: "Karthik S.", business: "Gym Studio", rating: 4, text: "Great tool for quick social posts. Would love a bit more layout variety but overall very happy with the output quality." },
  { id: "r3", name: "Priya M.", business: "Boutique Owner", rating: 5, text: "The scheduling planner alone saves me so much stress every week. Highly recommend for small business owners juggling everything solo." },
  { id: "r4", name: "Rahul V.", business: "Cafe Owner", rating: 5, text: "Posters look like they came from a proper design agency. My Instagram engagement has genuinely improved since switching over." },
  { id: "r5", name: "Divya K.", business: "Salon Owner", rating: 4, text: "Simple to use, no design skills needed like they promise. The captions feature is a nice bonus I wasn't expecting." },
  { id: "r6", name: "Sanjay P.", business: "Fitness Coach", rating: 5, text: "Switched from generic templates to UPDO and never looked back. Faster, smarter, and far more on-brand every single time." },
];

function ReviewCarousel() {
  const [reviews, setReviews] = useState(SEED_REVIEWS);
  const [isHovering, setIsHovering] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formName, setFormName] = useState("");
  const [formText, setFormText] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [expandedReview, setExpandedReview] = useState(null);

  const isPaused = isHovering || formOpen || expandedReview !== null;
  const track = [...reviews, ...reviews];

  const trackRef = useRef(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    let frameId;
    let lastTime = null;
    const speed = 45; // px per second

    function tick(now) {
      if (lastTime === null) lastTime = now;
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (!pausedRef.current && trackRef.current) {
        posRef.current += speed * dt;
        const halfWidth = trackRef.current.scrollWidth / 2;
        if (halfWidth > 0 && posRef.current >= halfWidth) {
          posRef.current -= halfWidth;
        }
        trackRef.current.style.transform = `translateX(-${posRef.current}px)`;
      }
      frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  function handleSubmitReview(e) {
    e.preventDefault();
    if (!formText.trim()) return;
    const newReview = {
      id: `local-${Date.now()}`,
      name: formName.trim() || "Anonymous",
      business: "New review",
      rating: formRating,
      text: formText.trim(),
    };
    setReviews((prev) => [newReview, ...prev]);
    setFormName("");
    setFormText("");
    setFormRating(5);
    setFormOpen(false);
    setJustSubmitted(true);
    setTimeout(() => setJustSubmitted(false), 3000);
  }

  useEffect(() => {
    if (!expandedReview) return;
    function onKey(e) {
      if (e.key === "Escape") setExpandedReview(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expandedReview]);

  return (
    <div
      className="relative w-full overflow-x-hidden overflow-y-visible"
      style={{
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
        maskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div ref={trackRef} className="flex items-center py-2" style={{ willChange: "transform" }}>
        {track.map((review, i) => {
          const key = `${review.id}-${i}`;
          return (
            <div
              key={key}
              className="review-capsule flex-shrink-0 mr-5 w-[260px] sm:w-[300px] rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-4 transition-colors duration-300 ease-out hover:border-white/20 hover:bg-white/[0.07]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-afacad text-sm sm:text-base text-white">{review.name}</p>
                  <p className="font-afacad text-xs text-white/50">{review.business}</p>
                </div>
                <Stars value={review.rating} size="text-xs sm:text-sm" />
              </div>

              <div className="mt-3">
                <p className="font-afacad text-xs sm:text-sm text-white/70 leading-relaxed clamp-3">{review.text}</p>
              </div>

              <button
                onClick={() => setExpandedReview(review)}
                className="mt-3 inline-flex items-center gap-1 rounded-full bg-[rgba(102,51,153,0.35)] hover:bg-[rgba(102,51,153,0.55)] px-3 py-1 text-[11px] sm:text-xs text-white/90 transition-colors duration-200"
              >
                Read full ⤢
              </button>
            </div>
          );
        })}
      </div>

      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-50 flex items-center">
        <div
          className={`relative transition-all duration-500 ease-out border border-white/15 shadow-2xl rounded-3xl flex items-center justify-center ${
            formOpen ? "w-[300px] sm:w-[380px] py-6 px-5 sm:px-6 bg-[#0F1233]" : "px-6 py-3 bg-[#0F1233]/90 backdrop-blur-md"
          }`}
        >
          {formOpen && (
            <button
              onClick={() => setFormOpen(false)}
              aria-label="Close"
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors duration-200"
            >
              ✕
            </button>
          )}

          {formOpen ? (
            <form onSubmit={handleSubmitReview} className="w-full flex flex-col gap-3 pr-2">
              <p className="font-afacad text-sm sm:text-base text-white">Your Review</p>
              <Stars value={formRating} onChange={setFormRating} size="text-lg" />
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Your name (optional)"
                className="font-afacad w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              />
              <textarea
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                placeholder="Tell us what you think…"
                rows={3}
                className="font-afacad w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-none"
              />
              <button
                type="submit"
                className="font-afacad w-full rounded-xl bg-[rgba(102,51,153,0.8)] hover:bg-[rgba(102,51,153,0.95)] py-2 text-sm text-white transition-colors duration-200"
              >
                Post Review
              </button>
            </form>
          ) : justSubmitted ? (
            <p className="font-afacad text-base sm:text-lg text-white">Thanks for your review ✓</p>
          ) : (
            <button onClick={() => setFormOpen(true)} className="font-afacad flex items-center gap-2 text-base sm:text-lg text-white">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/85">
                <PenIcon className="w-3.5 h-3.5 text-[#1a1a2e]" />
              </span>
              Tap to Review
            </button>
          )}
        </div>
      </div>

      {expandedReview && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 modal-fade"
          onClick={() => setExpandedReview(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl rounded-3xl border border-white/15 bg-[#0F1233] shadow-2xl px-7 py-8 sm:px-10 sm:py-10 modal-pop"
          >
            <button
              onClick={() => setExpandedReview(null)}
              aria-label="Close"
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors duration-200"
            >
              ✕
            </button>

            <div className="flex items-start justify-between gap-3 pr-12">
              <div>
                <p className="font-afacad text-lg sm:text-xl text-white">{expandedReview.name}</p>
                <p className="font-afacad text-sm text-white/50">{expandedReview.business}</p>
              </div>
              <Stars value={expandedReview.rating} size="text-base sm:text-lg" />
            </div>

            <p className="font-afacad mt-6 text-base sm:text-lg text-white/80 leading-relaxed max-h-[55vh] overflow-y-auto pr-1">
              {expandedReview.text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
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
          from { opacity: 0; transform: translateY(18px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .fade-up { opacity: 0; }
        .start-anim .fade-up { animation: fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .fade-up-0 { animation-delay: 0s; }
        .fade-up-1 { animation-delay: 0.1s; }
        .fade-up-2 { animation-delay: 0.2s; }
        .fade-up-3 { animation-delay: 0.3s; }
        .fade-up-4 { animation-delay: 0.42s; }
        .fade-up-5 { animation-delay: 0.54s; }

        .clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @property --border-angle {
          syntax: '<angle>';
          inherits: false;
          initial-value: 0deg;
        }
        .spin-glow {
          background: conic-gradient(from var(--border-angle), rgba(255,255,255,0.05), rgba(200,160,255,0.95) 10%, rgba(102,51,153,0.5) 24%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.05) 100%);
          animation: spinBorderAngle 6s linear infinite;
        }
        @keyframes spinBorderAngle {
          to { --border-angle: 360deg; }
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .modal-fade { animation: modalFadeIn 0.25s ease-out both; }

        @keyframes modalPopIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-pop { animation: modalPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }

        @media (prefers-reduced-motion: reduce) {
          .fade-up { animation: none; opacity: 1; }
          .modal-fade, .modal-pop { animation: none; }
        }
      `}</style>

      <header className="fade-up fade-up-0 relative flex items-center justify-between px-6 sm:px-10 h-[92px]">
        <img src={logo} alt="UPDO" className="h-8 sm:h-9 w-auto" />

        <nav className="flex items-center gap-6 sm:gap-8 font-afacad">
          <Link to="/login" className="text-lg sm:text-xl text-[#F5F5F5] hover:opacity-80 transition-opacity duration-300">Log In</Link>
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
        <GlowBorder
          size={420}
          lift={false}
          className="mx-auto max-w-[1338px] py-14 sm:py-16 border border-white/10 bg-gradient-to-r from-[rgba(15,24,51,0.35)] to-[rgba(10,19,48,0.35)]"
        >
          <div className="px-4 sm:px-8">
            <p className="font-afacad text-center text-lg sm:text-xl text-white/70 mb-6">Loved by small businesses like yours</p>
            <ReviewCarousel />
          </div>
        </GlowBorder>
      </section>

      <footer className="fade-up fade-up-5 px-6 sm:px-10 pb-20">
        <div className="mx-auto max-w-[1338px] flex flex-col items-center gap-10">
          <p className="font-afacad self-start text-lg sm:text-xl text-[#F5F7FA]">Contact Us:</p>

          <div className="flex items-center gap-6 sm:gap-8">
            {socials.map(({ icon, label, href }) => (
              <a key={label} href={href} aria-label={label} className="opacity-60 hover:opacity-100 hover:-translate-y-0.5 transition-all duration-300 ease-out">
                <img src={icon} alt={label} className="w-9 h-9 sm:w-10 sm:h-10" />
              </a>
            ))}
          </div>

          <p className="font-afacad text-sm sm:text-base text-white/50 text-center">
            <Link to="/privacy-policy" className="hover:text-white/70 transition-colors duration-300">Privacy Policy</Link>
            {" "}|{" "}
            <Link to="/terms" className="hover:text-white/70 transition-colors duration-300">Terms &amp; Conditions</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}