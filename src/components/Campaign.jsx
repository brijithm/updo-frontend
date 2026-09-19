import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import CampaignPreview from "./CampaignPreview";
import CampaignSuccess from "./CampaignSuccess";
import CampaignFailed from "./CampaignFailed";
import BetaLimitReached from "./BetaLimitReached";
import { generateCampaign } from "../services/campaignService";
import { hasBrandSettings } from "../services/brandService";
// MOBILE ONLY: same logo used in Dashboard's mobile header.
import updoLogo from "../assets/logo.png";

// ---------------------------------------------------------------------------
// Full Campaign Creator wizard. Lives on ONE route. Steps are just internal
// state ("form" | "preview" | "success" | "failed" | "limit_reached") — no
// react-router involved between them. `onBack` is only for exiting the whole
// wizard back to Dashboard, used by the form step's Back button and the
// hidden success/failed/limit_reached pages' Back buttons. `onLogout` is
// only used by the hidden limit_reached page's Log out button.
//
// Beta scope: only Instagram + Square (1:1) are supported. Platform is
// hardcoded (no picker) and Portrait/Landscape are locked "Coming Soon".
//
// Usage from the parent route:
//   <Campaign onBack={() => navigate("/dashboard")} onLogout={handleLogout} />
// ---------------------------------------------------------------------------

const BETA_PLATFORM = "instagram";

const ASPECT_RATIOS = [
  { id: "square", label: "1:1", name: "Square", sub: "Feed posts", available: true },
  { id: "portrait", label: "9:16", name: "Portrait", sub: "Stories & Reels", available: false },
  { id: "landscape", label: "16:9", name: "Landscape", sub: "Video & Ads", available: false },
];

// MOBILE ONLY: burger-menu drawer items (same set as Dashboard's).
// `to: null` = current page (Campaign) -> just closes the drawer.
const MOBILE_NAV = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Brand Setting", to: "/brand-settings" },
  { label: "Campaign", to: null },
  { label: "Scheduler", to: "/scheduler" },
  { label: "Home", to: "/" },
];

function RatioButton({ ratio, selected, onSelect }) {
  const isSelected = selected === ratio.id;
  const isDisabled = !ratio.available;

  return (
    <button
      type="button"
      onClick={() => ratio.available && onSelect(ratio.id)}
      disabled={isDisabled}
      className={`relative flex items-center gap-3 md:gap-6 px-3 md:px-4 py-3 md:py-4 bg-slate-900 rounded-xl outline outline-offset-[-2px] transition-all duration-200 ${
        isDisabled
          ? "outline-1 outline-neutral-700 opacity-40 cursor-not-allowed"
          : `hover:-translate-y-0.5 ${
              isSelected
                ? "outline-2 outline-purple-300"
                : "outline-1 outline-neutral-600 hover:outline-neutral-500"
            }`
      }`}
    >
      <div
        className={`flex items-center justify-center rounded-sm outline outline-1 outline-offset-[-1px] outline-neutral-600 ${
          isSelected && !isDisabled ? "bg-purple-300/20" : "bg-neutral-600/20"
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
            isSelected && !isDisabled ? "text-purple-300" : "text-white"
          }`}
        >
          {ratio.label}
        </span>
      </div>
      <div className="flex flex-col items-start text-left">
        <span className="text-indigo-100 text-sm md:text-base font-normal font-['Poppins'] leading-6">
          {ratio.name}
        </span>
        <span className="text-zinc-300 text-xs md:text-sm font-normal font-['Poppins'] leading-5">
          {ratio.sub}
        </span>
      </div>
      {isDisabled && (
        <span className="absolute top-2 right-3 text-[9px] md:text-[10px] font-semibold font-['Poppins'] tracking-wide text-zinc-400 uppercase">
          Coming Soon
        </span>
      )}
    </button>
  );
}

function FormField({ label, name, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-2 w-full md:flex-1 md:min-w-[280px]">
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
        className="w-full h-12 md:h-14 px-4 bg-slate-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-600 text-indigo-100 text-sm font-['Poppins'] placeholder:text-zinc-500 focus:outline-purple-300 transition-colors"
      />
    </div>
  );
}

const cardClass =
  "bg-gray-800 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-600 p-4 md:p-8";

export default function Campaign({ onBack, onLogout }) {
  const navigate = useNavigate();

  // "form" -> "preview" -> "success" | "failed" | "limit_reached"
  const [step, setStep] = useState("form");

  const [aspectRatio, setAspectRatio] = useState("square");
  const [details, setDetails] = useState({
    goal: "",
    mood: "",
    offer: "",
    audience: "",
    cta: "",
    operating_hours: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [campaignResult, setCampaignResult] = useState(null); // { campaignId, imageUrl, status }

  // Brand settings gate: default to NOT ready (blocked) until the backend
  // confirms the user has brand settings saved. Never optimistically allow
  // Generate before this resolves, and never fall back to "allowed" if the
  // check itself errors out — that would let ungated requests hit the
  // backend, which will 400/403 anyway but with a worse UX.
  const [brandReady, setBrandReady] = useState(false);
  const [brandCheckLoading, setBrandCheckLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    hasBrandSettings()
      .then((ready) => {
        if (!cancelled) setBrandReady(ready);
      })
      .catch(() => {
        if (!cancelled) setBrandReady(false);
      })
      .finally(() => {
        if (!cancelled) setBrandCheckLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    // Belt-and-suspenders: even though the button is disabled while brand
    // settings aren't ready, guard here too in case of a stale click.
    if (!brandReady) return;

    setIsGenerating(true);
    setGenerateError(null);
    try {
      const result = await generateCampaign({
        aspectRatio,
        platform: BETA_PLATFORM,
        ...details,
      });

      if (result?.status === "limit_reached") {
        setStep("limit_reached");
        return;
      }

      // Backend-held generation lock rejected this request because one is
      // already running for this user (double-click, second tab, or a
      // retry after a lost/timed-out response). Stay on the form and let
      // them know, rather than routing to the hard failure screen.
      if (result?.status === "in_progress") {
        setGenerateError(
          result?.message ||
            "A campaign is already generating for your account. Please wait a moment and try again."
        );
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

  // MOBILE ONLY: burger drawer state + smooth open/close (transition-based,
  // matches the fixed-up Dashboard drawer — exit animation plays before unmount).
  const [menuOpen, setMenuOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  function closeMenu() {
    setClosing(true);
    setTimeout(() => {
      setMenuOpen(false);
      setClosing(false);
    }, 300); // must match the transition duration below
  }

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function handleMobileNav(to) {
    closeMenu();
    if (to) navigate(to);
  }

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

  const generateDisabled = isGenerating || brandCheckLoading || !brandReady;

  return (
    <div className="min-h-screen w-full bg-[#000b2e] md:bg-slate-900">
      {/* Desktop/tablet (md+): existing Navbar, untouched. `md:contents` keeps
          the wrapper from generating a box, so Navbar lays out exactly as before. */}
      <div className="hidden md:contents">
        <Navbar />
      </div>

      {/* MOBILE ONLY (<md): header with logo + burger */}
      <header className="md:hidden sticky top-0 z-30 h-[66px] w-full flex items-center justify-between px-[15px] bg-[#000b2e]/90 backdrop-blur-md border-b border-slate-700/40">
        <img src={updoLogo} alt="UPDO" className="h-7 w-14 object-cover" />
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          className="w-11 h-11 -mr-2 flex items-center justify-center text-indigo-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-300 rounded-lg"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* MOBILE ONLY (<md): right-side drawer, smooth open + close */}
      {(menuOpen || closing) && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
              closing ? "opacity-0" : "opacity-100"
            }`}
            onClick={closeMenu}
            aria-hidden="true"
          />
          <nav
            id="mobile-navigation"
            aria-label="Campaign navigation"
            className={`absolute right-0 top-0 h-full w-[218px] max-w-[80vw] bg-[#00061f] border-l border-slate-700/40 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              closing ? "translate-x-full" : "translate-x-0"
            }`}
          >
            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close navigation menu"
              className="absolute right-[10px] top-[10px] w-11 h-11 flex items-center justify-center text-indigo-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-300 rounded-lg"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <ul className="pt-[111px] pl-6 pr-4 flex flex-col items-start gap-5">
              {MOBILE_NAV.map((item) => {
                const active = item.to === null;
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => handleMobileNav(item.to)}
                      aria-current={active ? "page" : undefined}
                      className={`text-indigo-100 text-2xl font-normal font-['K2D'] leading-tight whitespace-nowrap border-b-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300 ${
                        active ? "border-purple-500" : "border-transparent"
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 pt-6 pb-24 gap-3 md:px-6 md:pt-14 md:pb-16 md:gap-8 flex flex-col">
        {/* Choose Aspect Ratio */}
        <section className={`flex flex-col items-center gap-3 md:gap-8 ${cardClass} ${enter()}`}>
          <h2 className="text-indigo-100 text-lg md:text-2xl font-semibold font-['K2D'] leading-8">
            Choose Aspect Ratio
          </h2>
          <div className="w-full flex flex-col md:flex-row flex-wrap justify-center items-stretch gap-3 md:gap-6">
            {ASPECT_RATIOS.map((ratio) => (
              <div
                key={ratio.id}
                className={ratio.available ? "" : "hidden md:block"}
              >
                <RatioButton
                  ratio={ratio}
                  selected={aspectRatio}
                  onSelect={setAspectRatio}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Details */}
        <section className={`flex flex-col gap-5 md:gap-8 ${cardClass} ${enter("delay-100")}`}>
          <h2 className="text-indigo-100 text-lg md:text-2xl font-semibold font-['K2D'] leading-8 text-center">
            Details
          </h2>
          <div className="flex flex-col md:flex-row md:flex-wrap gap-4 md:gap-x-10 md:gap-y-6">
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
              placeholder="e.g. Festive, energetic (default: Professional)"
            />
            <FormField
              label="Call to Action (CTA)"
              name="cta"
              value={details.cta}
              onChange={handleDetailChange}
              placeholder="e.g. Learn More, Book Now, Shop Now"
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
            <FormField
              label="Operating Hours"
              name="operating_hours"
              value={details.operating_hours}
              onChange={handleDetailChange}
              placeholder="e.g. Mon-Sat 9:00 AM - 8:00 PM"
            />
          </div>
        </section>

        {generateError && (
          <p className="text-center text-red-400 text-sm font-['Poppins']">
            {generateError}
          </p>
        )}

        {!brandCheckLoading && !brandReady && (
          <p className="text-center text-zinc-400 text-sm font-['Poppins']">
            Set up Brand Settings first to unlock campaign generation.
          </p>
        )}

        {/* Navigation footer */}
        <div className={`flex justify-between items-center ${enter("delay-200")}`}>
          <button
            type="button"
            onClick={onBack}
            disabled={isGenerating}
            className="flex items-center gap-2 md:gap-3 px-4 md:px-6 h-12 md:h-14 rounded-full outline outline-1 outline-offset-[-1px] outline-neutral-600 text-indigo-100 text-sm md:text-base font-normal font-['Poppins'] hover:bg-slate-800/50 transition-colors disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.825 9L9.425 14.6L8 16L0 8L8 0L9.425 1.4L3.825 7H16V9H3.825Z" fill="#DAE2FD" />
            </svg>
            Back
          </button>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generateDisabled}
            className="group flex items-center gap-2 md:gap-3 px-4 md:px-6 h-12 md:h-14 bg-purple-300 rounded-full shadow-[0px_10px_15px_-3px_rgba(208,188,255,0.20)] hover:bg-purple-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:hover:scale-100 disabled:pointer-events-none"
          >
            <span className="text-violet-900 text-sm md:text-base font-normal font-['Poppins']">
              {isGenerating ? "Generating..." : brandCheckLoading ? "Checking..." : "Generate"}
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