import { useNavigate } from "react-router-dom";

// ---------------------------------------------------------------------------
// Hidden full-screen page shown when the user has used all their beta
// generations. Not in Navbar. Two exits: Go to Dashboard, or Log out.
// Triggered from Campaign.jsx when generateCampaign() reports the limit
// has been reached (see campaignService.js TODO for the exact signal).
// ---------------------------------------------------------------------------

export default function BetaLimitReached({ onBack, onLogout }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-900 relative overflow-hidden flex items-center justify-center">
      <div className="size-96 absolute -left-20 -top-20 bg-purple-800/10 rounded-full blur-2xl" />
      <div className="size-96 absolute right-0 bottom-0 bg-purple-800/10 rounded-full blur-2xl" />

      <main className="relative max-w-3xl w-full px-6 flex flex-col items-center gap-6 text-center">
        <h1 className="text-white text-5xl font-bold font-['K2D'] leading-[56px]">
          UPDO AI
        </h1>
        <p className="text-white/60 text-lg font-normal font-['Poppins']">
          Create . Schedule . Elevate
        </p>

        <h2 className="text-white text-3xl md:text-5xl font-bold font-['K2D'] leading-[56px] mt-6">
          You have used all 7 beta generations!
        </h2>
        <p className="text-white text-2xl md:text-4xl font-medium font-['Poppins'] leading-[56px]">
          Thank you for trying <span className="font-bold">UPDO AI</span>
        </p>
        <p className="text-white text-xl md:text-2xl font-medium font-['Poppins']">
          Full plans are coming soon !
        </p>

        <div className="flex flex-wrap justify-center items-center gap-6 mt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-9 h-14 bg-purple-300 rounded-full shadow-[0px_10px_15px_-3px_rgba(208,188,255,0.20)] text-violet-900 text-base font-normal font-['Poppins'] hover:bg-purple-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Go to Dashboard
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="px-16 py-6 bg-purple-800/80 rounded-full shadow-[0px_0px_20px_0px_rgba(102,51,153,0.40)] text-white text-xl font-medium font-['Afacad_Flux'] tracking-wide hover:bg-purple-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Log out
          </button>
        </div>
      </main>
    </div>
  );
}