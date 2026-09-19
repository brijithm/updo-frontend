import { useNavigate } from "react-router-dom";

// ---------------------------------------------------------------------------
// Hidden full-screen page shown when the user has used all their beta
// generations. Not in Navbar. Two exits: Go to Dashboard, or Log out.
// Triggered from Campaign.jsx when generateCampaign() reports the limit
// has been reached (see campaignService.js TODO for the exact signal).
//
// Responsive: base classes = mobile (Figma "End Message"). From `sm:` up every
// class is the original desktop value, so the desktop look is unchanged.
// ---------------------------------------------------------------------------

export default function BetaLimitReached({ onBack, onLogout }) {
  return (
    <div className="min-h-screen w-full bg-[linear-gradient(148deg,#000b2e_0%,#091333_100%)] sm:bg-gradient-to-b sm:from-slate-900 sm:to-slate-900 relative overflow-hidden flex items-center justify-center">
      <div className="size-96 absolute -left-20 -top-20 bg-purple-800/10 rounded-full blur-2xl" />
      <div className="size-96 absolute right-0 bottom-0 bg-purple-800/10 rounded-full blur-2xl" />

      <main className="relative max-w-3xl w-full px-6 py-10 sm:py-0 flex flex-col items-center gap-5 sm:gap-6 text-center">
        <h1 className="text-white text-xl leading-tight sm:text-5xl sm:leading-[56px] font-bold font-['K2D']">
          UPDO AI
        </h1>
        <p className="text-white/60 text-xs sm:text-lg font-normal font-['Poppins']">
          Create . Schedule . Elevate
        </p>

        <h2 className="text-white text-xl leading-snug text-balance sm:text-3xl sm:leading-[56px] md:text-5xl font-bold font-['K2D'] mt-4 sm:mt-6">
          You have used all 7 beta generations!
        </h2>
        <p className="text-white text-lg leading-snug sm:text-2xl sm:leading-[56px] md:text-4xl font-medium font-['Poppins']">
          Thank you for trying <span className="font-bold">UPDO AI</span>
        </p>
        <p className="text-white text-[15px] sm:text-xl md:text-2xl font-medium font-['Poppins']">
          Full plans are coming soon !
        </p>

        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-4 sm:gap-6 mt-12 sm:mt-6 w-full">
          <button
            type="button"
            onClick={onBack}
            className="w-[227px] max-w-full sm:w-auto px-9 h-14 bg-purple-300 rounded-full shadow-[0px_10px_15px_-3px_rgba(208,188,255,0.20)] text-violet-900 text-base font-normal font-['Poppins'] hover:bg-purple-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-300"
          >
            Go to Dashboard
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="h-[50px] px-10 sm:h-auto sm:px-16 sm:py-6 bg-purple-800/80 rounded-full shadow-[0px_0px_20px_0px_rgba(102,51,153,0.40)] text-white text-lg sm:text-xl font-medium font-['Afacad_Flux'] tracking-wide hover:bg-purple-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-300"
          >
            Log out
          </button>
        </div>
      </main>
    </div>
  );
}