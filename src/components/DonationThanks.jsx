import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Hidden "Thanks For Your Support" page. Shown full-screen right after a
// successful donation on the Preview page. Not in Navbar, no manual nav —
// auto-redirects to Dashboard after AUTO_REDIRECT_MS via onDone().
// ---------------------------------------------------------------------------

const AUTO_REDIRECT_MS = 3000;

export default function DonationThanks({ onDone }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    const timer = setTimeout(() => {
      onDone?.();
    }, AUTO_REDIRECT_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [onDone]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-900 relative overflow-hidden flex items-center justify-center">
      <div className="size-96 absolute -left-20 -top-20 bg-purple-800/10 rounded-full blur-2xl" />
      <div className="size-96 absolute right-0 bottom-0 bg-purple-800/10 rounded-full blur-2xl" />

      <main
        className={`relative max-w-2xl w-full px-6 flex flex-col items-center gap-4 text-center transition-all duration-700 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <h1 className="text-white text-5xl font-bold font-['K2D'] leading-[56px]">
          UPDO AI
        </h1>
        <p className="text-white/60 text-lg font-normal font-['Poppins']">
          Create . Schedule . Elevate
        </p>

        <h2 className="text-white text-5xl font-bold font-['K2D'] leading-[56px] mt-6">
          Thanks For Your Support !
        </h2>
        <p className="text-white text-base font-medium font-['Poppins']">
          Full plans are coming soon !
        </p>

        <div className="mt-8 w-8 h-8 border-2 border-neutral-600 border-t-purple-300 rounded-full animate-spin" />
      </main>
    </div>
  );
}