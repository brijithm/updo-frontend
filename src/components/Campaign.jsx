import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import CampaignPreview from "./CampaignPreview";
import CampaignSuccess from "./CampaignSuccess";
import CampaignFailed from "./CampaignFailed";
import BetaLimitReached from "./BetaLimitReached";
import { generateCampaign } from "../services/campaignService";

// ---------------------------------------------------------------------------
// Full Campaign Creator wizard. Lives on ONE route. Steps are just internal
// state ("form" | "preview" | "success" | "failed" | "limit_reached") — no
// react-router involved between them. `onBack` is only for exiting the whole
// wizard back to Dashboard, used by the form step's Back button and the
// hidden success/failed/limit_reached pages' Back buttons. `onLogout` is
// only used by the hidden limit_reached page's Log out button.
//
// Usage from the parent route:
//   <Campaign onBack={() => navigate("/dashboard")} onLogout={handleLogout} />
// ---------------------------------------------------------------------------

const ASPECT_RATIOS = [
  { id: "square", label: "1:1", name: "Square", sub: "Feed posts" },
  { id: "portrait", label: "9:16", name: "Portrait", sub: "Stories & Reels" },
  { id: "landscape", label: "16:9", name: "Landscape", sub: "Video & Ads" },
];

function RatioButton({ ratio, selected, onSelect }) {
  const isSelected = selected === ratio.id;
  return (
    <button
      type="button"
      onClick={() => onSelect(ratio.id)}
      className={`flex items-center gap-6 px-4 py-4 bg-slate-900 rounded-xl outline outline-offset-[-2px] transition-all duration-200 hover:-translate-y-0.5 ${
        isSelected
          ? "outline-2 outline-purple-300"
          : "outline-1 outline-neutral-600 hover:outline-neutral-500"
      }`}
    >
      <div
        className={`flex items-center justify-center rounded-sm outline outline-1 outline-offset-[-1px] outline-neutral-600 ${
          isSelected ? "bg-purple-300/20" : "bg-neutral-600/20"
        } ${
          ratio.id === "square"
            ? "w-11 h-12"
            : ratio.id === "portrait"
            ? "w-8 h-14"
            : "size-8"
        }`}
      >
        <span
          className={`text-xs font-semibold font-['Inter'] tracking-wide leading-4 ${
            isSelected ? "text-purple-300" : "text-white"
          }`}
        >
          {ratio.label}
        </span>
      </div>
      <div className="flex flex-col items-start text-left">
        <span className="text-indigo-100 text-base font-normal font-['Poppins'] leading-6">
          {ratio.name}
        </span>
        <span className="text-zinc-300 text-sm font-normal font-['Poppins'] leading-5">
          {ratio.sub}
        </span>
      </div>
    </button>
  );
}

function FormField({ label, name, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-2 flex-1 min-w-[280px]">
      <label
        htmlFor={name}
        className="text-zinc-300 text-xs font-semibold font-['Poppins'] uppercase tracking-wide"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-14 px-4 bg-slate-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-600 text-indigo-100 text-sm font-['Poppins'] placeholder:text-zinc-500 focus:outline-purple-300 transition-colors"
      />
    </div>
  );
}

const cardClass =
  "bg-gray-800 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-600 p-8";

export default function Campaign({ onBack, onLogout }) {
  // "form" -> "preview" -> "success" | "failed" | "limit_reached"
  const [step, setStep] = useState("form");

  const [aspectRatio, setAspectRatio] = useState("square");
  const [details, setDetails] = useState({
    goal: "",
    mood: "",
    offer: "",
    audience: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [campaignResult, setCampaignResult] = useState(null); // { campaignId, imageUrl, status }

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const result = await generateCampaign({ aspectRatio, ...details });

      if (result?.status === "limit_reached") {
        setStep("limit_reached");
        return;
      }

      if (!result?.success || result?.status === "failed" || !result?.imageUrl) {
        setStep("failed");
        return;
      }

      setCampaignResult(result);
      setStep("preview");
    } catch (err) {
      setStep("failed");
    } finally {
      setIsGenerating(false);
    }
  };

  // Preview step "Redo" -> back to the form, keep whatever the user typed
  const handleRedo = () => {
    setCampaignResult(null);
    setStep("form");
  };

  // Preview step "Confirm" -> image already downloaded by CampaignPreview,
  // this just advances to the hidden success/rating page.
  const handleConfirmed = () => {
    setStep("success");
  };

  // Entrance animation (same pattern as Dashboard.jsx)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const enter = (delay = "") =>
    `transition-all duration-700 ease-out ${delay} ${
      mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`;

  if (step === "limit_reached") {
    return <BetaLimitReached onBack={onBack} onLogout={onLogout} />;
  }

  if (step === "failed") {
    return <CampaignFailed onBack={onBack} />;
  }

  if (step === "preview") {
    return (
      <CampaignPreview
        campaignResult={campaignResult}
        onRedo={handleRedo}
        onConfirmed={handleConfirmed}
        onBack={onBack}
      />
    );
  }

  if (step === "success") {
    // Hidden page — not in Navbar, reachable only via this flow.
    // Its only nav action is Back -> Dashboard (onBack from parent route).
    return <CampaignSuccess campaignId={campaignResult?.campaignId} onBack={onBack} />;
  }

  return (
    <div className="min-h-screen w-full bg-slate-900">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-14 pb-16 flex flex-col gap-8">
        {/* Choose Aspect Ratio */}
        <section className={`flex flex-col items-center gap-8 ${cardClass} ${enter()}`}>
          <h2 className="text-indigo-100 text-2xl font-semibold font-['K2D'] leading-8">
            Choose Aspect Ratio
          </h2>
          <div className="w-full flex flex-wrap justify-center items-stretch gap-6">
            {ASPECT_RATIOS.map((ratio) => (
              <RatioButton
                key={ratio.id}
                ratio={ratio}
                selected={aspectRatio}
                onSelect={setAspectRatio}
              />
            ))}
          </div>
        </section>

        {/* Details */}
        <section className={`flex flex-col gap-8 ${cardClass} ${enter("delay-100")}`}>
          <h2 className="text-indigo-100 text-2xl font-semibold font-['K2D'] leading-8 text-center">
            Details
          </h2>
          <div className="flex flex-wrap gap-x-10 gap-y-6">
            <FormField
              label="Campaign Goal"
              name="goal"
              value={details.goal}
              onChange={handleDetailChange}
              placeholder="e.g. Drive Diwali sale sign-ups"
            />
            <FormField
              label="Mood"
              name="mood"
              value={details.mood}
              onChange={handleDetailChange}
              placeholder="e.g. Festive, energetic"
            />
            <FormField
              label="Offer"
              name="offer"
              value={details.offer}
              onChange={handleDetailChange}
              placeholder="e.g. Flat 30% off / reserve your table"
            />
            <FormField
              label="Target Audience"
              name="audience"
              value={details.audience}
              onChange={handleDetailChange}
              placeholder="e.g. Young professionals, 22-35"
            />
          </div>
        </section>

        {generateError && (
          <p className="text-center text-red-400 text-sm font-['Poppins']">
            {generateError}
          </p>
        )}

        {/* Navigation footer */}
        <div className={`flex justify-between items-center ${enter("delay-200")}`}>
          <button
            type="button"
            onClick={onBack}
            disabled={isGenerating}
            className="flex items-center gap-3 px-6 h-14 rounded-full outline outline-1 outline-offset-[-1px] outline-neutral-600 text-indigo-100 text-base font-normal font-['Poppins'] hover:bg-slate-800/50 transition-colors disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.825 9L9.425 14.6L8 16L0 8L8 0L9.425 1.4L3.825 7H16V9H3.825Z" fill="#DAE2FD" />
            </svg>
            Back
          </button>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="group flex items-center gap-3 px-6 h-14 bg-purple-300 rounded-full shadow-[0px_10px_15px_-3px_rgba(208,188,255,0.20)] hover:bg-purple-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:hover:scale-100"
          >
            <span className="text-violet-900 text-base font-normal font-['Poppins']">
              {isGenerating ? "Generating..." : "Generate"}
            </span>
            {!isGenerating && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform duration-200 group-hover:translate-x-1"
              >
                <path d="M12.175 9H0V7H12.175L6.575 1.4L8 0L16 8L8 16L6.575 14.6L12.175 9Z" fill="#3C0091" />
              </svg>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}