import { useEffect, useState } from "react";

const AUTO_REDIRECT_MS = 3000;

// Responsive: base classes = mobile (Figma "Donation End Message"); from `sm:`
// up every class is the original desktop value, unchanged.
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
    <div className="min-h-screen w-full bg-[linear-gradient(148deg,#000b2e_0%,#091333_100%)] sm:bg-gradient-to-b sm:from-slate-900 sm:to-slate-900 relative overflow-hidden flex items-center justify-center">
      <div className="size-96 absolute -left-20 -top-20 bg-purple-800/10 rounded-full blur-2xl" />
      <div className="size-96 absolute right-0 bottom-0 bg-purple-800/10 rounded-full blur-2xl" />

      <main
        className={`relative max-w-2xl w-full px-6 py-10 sm:py-0 flex flex-col items-center gap-5 sm:gap-4 text-center transition-all duration-700 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <h1 className="text-white text-xl leading-tight sm:text-5xl sm:leading-[56px] font-bold font-['K2D']">
          UPDO AI
        </h1>
        <p className="text-white/60 text-xs sm:text-lg font-normal font-['Poppins']">
          Create . Schedule . Elevate
        </p>

        <h2 className="text-white text-xl leading-snug text-balance sm:text-5xl sm:leading-[56px] font-bold font-['K2D'] mt-4 sm:mt-6">
          Thanks For Your Support !
        </h2>
        <p className="text-white text-xs sm:text-base font-medium font-['Poppins']">
          Full plans are coming soon !
        </p>

        <div className="mt-8 w-8 h-8 border-2 border-neutral-600 border-t-purple-300 rounded-full animate-spin" />
      </main>
    </div>
  );
}