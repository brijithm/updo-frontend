import { useState } from "react";
import { submitCampaignRating } from "../services/campaignService";

// ---------------------------------------------------------------------------
// Hidden thank-you/rating page. NOT in Navbar, only reachable right after a
// Confirm+download. Only nav option is Back -> Dashboard (onBack prop).
// Ratings use custom SVG faces (not native emoji) to match the Figma design
// exactly and render identically across every OS/browser.
// ---------------------------------------------------------------------------

function FaceIcon({ mood }) {
  // mood: "sad" | "meh" | "okay" | "happy" | "great"
  const mouthPaths = {
    sad: "M8 16c1.5-2 6.5-2 8 0",
    meh: "M8 15h8",
    okay: "M8 14c1.5 1.5 6.5 1.5 8 0",
    happy: "M7.5 13.5c1.8 2.5 7.2 2.5 9 0",
    great: "M7 13c2 3 8 3 10 0",
  };
  const eyeShape = mood === "great" ? "star" : "dot";

  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      {eyeShape === "dot" ? (
        <>
          <circle cx="8.5" cy="9.5" r="1.1" fill="currentColor" />
          <circle cx="15.5" cy="9.5" r="1.1" fill="currentColor" />
        </>
      ) : (
        <>
          <path
            d="M8.5 8l.6 1.3 1.4.2-1 1 .2 1.4-1.2-.7-1.2.7.2-1.4-1-1 1.4-.2z"
            fill="currentColor"
          />
          <path
            d="M15.5 8l.6 1.3 1.4.2-1 1 .2 1.4-1.2-.7-1.2.7.2-1.4-1-1 1.4-.2z"
            fill="currentColor"
          />
        </>
      )}
      <path
        d={mouthPaths[mood]}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

const RATINGS = [
  { value: 1, mood: "sad" },
  { value: 2, mood: "meh" },
  { value: 3, mood: "okay" },
  { value: 4, mood: "happy" },
  { value: 5, mood: "great" },
];

export default function CampaignSuccess({ campaignId, onBack }) {
  const [selectedRating, setSelectedRating] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (value) => {
    if (isSubmitting || selectedRating) return;
    setSelectedRating(value);
    setIsSubmitting(true);
    try {
      await submitCampaignRating(campaignId, value);
    } catch (err) {
      console.error("[CampaignSuccess] failed to submit rating:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 relative overflow-hidden flex items-center justify-center">
      <div className="w-96 h-80 absolute -left-20 -top-20 bg-purple-800/10 rounded-full blur-2xl" />
      <div className="w-96 h-80 absolute -right-20 bottom-0 bg-purple-800/10 rounded-full blur-2xl" />

      <main className="relative max-w-2xl w-full px-6 flex flex-col items-center gap-8 text-center">
        <h1 className="text-white text-5xl font-bold font-['K2D'] leading-[56px]">
          UPDO AI
        </h1>
        <p className="text-white/60 text-lg font-normal font-['Poppins']">
          Create . Schedule . Elevate
        </p>

        <h2 className="text-white text-4xl md:text-5xl font-bold font-['K2D'] leading-[56px]">
          Your Poster Has Been Generated.
        </h2>
        <p className="text-white/60 text-lg font-normal font-['Poppins']">
          Every campaign you create brings your business closer to its audience.
        </p>

        <p className="text-stone-300 text-xs font-medium font-['Poppins'] uppercase tracking-[2.4px]">
          How was your experience?
        </p>

        <div className="flex items-center gap-6">
          {RATINGS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => handleRate(r.value)}
              disabled={Boolean(selectedRating)}
              className={`text-neutral-200 transition-all duration-200 ${
                selectedRating === r.value
                  ? "scale-125 text-purple-300"
                  : selectedRating
                  ? "opacity-30"
                  : "hover:scale-110 hover:text-purple-300"
              }`}
            >
              <FaceIcon mood={r.mood} />
            </button>
          ))}
        </div>

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