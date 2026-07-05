import { useNavigate } from "react-router-dom";

// ---------------------------------------------------------------------------
// Global 404 / not-found page. Wired as the catch-all route ("*") in
// App.jsx, so it shows for any URL that doesn't match a real route.
//
// Uses UPDO AI's dark purple/slate system + K2D (display) / Poppins (body).
// Signature element: a "broken poster frame" — a torn/glitched campaign
// poster card, since UPDO AI generates posters. The torn corner + drifting
// scanlines nod to a poster that failed to render.
// ---------------------------------------------------------------------------

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center gap-8 px-6 text-center">
      {/* Ambient glow field */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse-slow-delay" />
      </div>

      {/* Torn poster card — signature element */}
      <div className="relative z-10 animate-float">
        <div
          className="relative w-64 h-80 md:w-72 md:h-96 rounded-2xl border border-purple-400/20 bg-gradient-to-b from-slate-900 to-slate-950 shadow-[0_20px_60px_-15px_rgba(168,85,247,0.35)] overflow-hidden"
          style={{
            clipPath:
              "polygon(0 0, 78% 0, 100% 14%, 100% 100%, 22% 100%, 0 86%)",
          }}
        >
          {/* Scanline drift */}
          <div className="absolute inset-0 opacity-[0.15] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(216,180,254,0.6)_2px,rgba(216,180,254,0.6)_3px)] animate-scan" />

          {/* Glitch bars */}
          <div className="absolute top-[30%] left-0 w-full h-2 bg-purple-300/40 animate-glitch-1" />
          <div className="absolute top-[55%] left-0 w-full h-1 bg-violet-400/30 animate-glitch-2" />

          {/* Center 404 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-8xl md:text-9xl font-bold font-['K2D'] leading-none tracking-tight select-none animate-glitch-text">
              404
            </span>
          </div>

          {/* Torn edge highlight */}
          <div
            className="absolute inset-0 border-t border-r border-purple-300/10"
            style={{
              clipPath:
                "polygon(0 0, 78% 0, 100% 14%, 100% 15%, 79% 1%, 1% 1%)",
            }}
          />
        </div>

        {/* Drop shadow "second poster" peeking behind, slightly offset */}
        <div
          className="absolute -z-10 top-3 left-3 w-64 h-80 md:w-72 md:h-96 rounded-2xl bg-purple-500/5 border border-purple-400/10"
          style={{
            clipPath:
              "polygon(0 0, 78% 0, 100% 14%, 100% 100%, 22% 100%, 0 86%)",
          }}
        />
      </div>

      {/* Copy */}
      <div className="relative z-10 flex flex-col items-center gap-3 animate-fade-in-up">
        <p className="text-purple-300/90 text-xl md:text-2xl font-semibold font-['K2D'] tracking-wide">
          This poster didn't render
        </p>
        <p className="text-slate-400 text-sm md:text-base font-['Poppins'] max-w-sm">
          The page you're looking for doesn't exist, or it moved. Let's get
          you back to your campaigns.
        </p>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="relative z-10 mt-2 px-9 h-14 bg-purple-300 rounded-full shadow-[0px_10px_25px_-3px_rgba(208,188,255,0.35)] text-violet-900 text-base font-medium font-['Poppins'] hover:bg-purple-200 hover:shadow-[0px_12px_30px_-3px_rgba(208,188,255,0.5)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 animate-fade-in-up-delay"
      >
        Go to Dashboard
      </button>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-14px) rotate(1deg); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }

        @keyframes scan {
          0% { background-position: 0 0; }
          100% { background-position: 0 40px; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }

        @keyframes glitch1 {
          0%, 92%, 100% { opacity: 0; transform: translateX(0); }
          93% { opacity: 1; transform: translateX(-6px); }
          95% { opacity: 0.6; transform: translateX(4px); }
          97% { opacity: 0; }
        }
        .animate-glitch-1 {
          animation: glitch1 4.5s ease-in-out infinite;
        }

        @keyframes glitch2 {
          0%, 88%, 100% { opacity: 0; transform: translateX(0); }
          89% { opacity: 0.8; transform: translateX(8px); }
          91% { opacity: 0; }
        }
        .animate-glitch-2 {
          animation: glitch2 6s ease-in-out infinite;
        }

        @keyframes glitchText {
          0%, 94%, 100% { transform: translate(0, 0); text-shadow: none; }
          95% {
            transform: translate(-2px, 1px);
            text-shadow: 2px 0 rgba(216,180,254,0.8), -2px 0 rgba(139,92,246,0.6);
          }
          96% { transform: translate(2px, -1px); text-shadow: none; }
        }
        .animate-glitch-text {
          animation: glitchText 5s ease-in-out infinite;
        }

        @keyframes pulseSlow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulseSlow 6s ease-in-out infinite;
        }
        .animate-pulse-slow-delay {
          animation: pulseSlow 6s ease-in-out infinite;
          animation-delay: 2s;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.7s ease-out 0.2s both;
        }
        .animate-fade-in-up-delay {
          animation: fadeInUp 0.7s ease-out 0.4s both;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-float, .animate-scan, .animate-glitch-1,
          .animate-glitch-2, .animate-glitch-text, .animate-pulse-slow,
          .animate-pulse-slow-delay, .animate-fade-in-up,
          .animate-fade-in-up-delay {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}