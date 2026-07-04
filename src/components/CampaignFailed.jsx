// ---------------------------------------------------------------------------
// Hidden failure page. Shown when the backend can't produce an image (either
// generateCampaign() throws, or resolves with a failed status). Not in
// Navbar. Only nav option is Back -> Dashboard (onBack prop), same pattern
// as CampaignSuccess.jsx.
// ---------------------------------------------------------------------------

export default function CampaignFailed({ onBack }) {
  return (
    <div className="min-h-screen w-full bg-slate-900 relative overflow-hidden flex items-center justify-center">
      <div className="w-96 h-80 absolute -left-20 -top-20 bg-red-800/10 rounded-full blur-2xl" />
      <div className="w-96 h-80 absolute -right-20 bottom-0 bg-red-800/10 rounded-full blur-2xl" />

      <main className="relative max-w-2xl w-full px-6 flex flex-col items-center gap-8 text-center">
        <h1 className="text-white text-5xl font-bold font-['K2D'] leading-[56px]">
          UPDO AI
        </h1>
        <p className="text-white/60 text-lg font-normal font-['Poppins']">
          Create . Schedule . Elevate
        </p>

        <h2 className="text-white text-4xl md:text-5xl font-bold font-['K2D'] leading-[56px]">
          We Couldn&apos;t Generate Your Poster.
        </h2>
        <p className="text-white/60 text-lg font-normal font-['Poppins']">
          Something went wrong on our end. No credits were deducted — please try again in a moment.
        </p>

        <button
          type="button"
          onClick={onBack}
          className="mt-4 flex items-center gap-3 px-6 h-14 rounded-full outline outline-1 outline-offset-[-1px] outline-neutral-600 text-indigo-100 text-base font-normal font-['Poppins'] hover:bg-slate-800/50 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.825 9L9.425 14.6L8 16L0 8L8 0L9.425 1.4L3.825 7H16V9H3.825Z" fill="#DAE2FD" />
          </svg>
          Back
        </button>
      </main>
    </div>
  );
}