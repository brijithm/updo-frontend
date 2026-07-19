import { useState } from "react";
import Navbar from "./Navbar";
import DonationThanks from "./DonationThanks";
import { downloadImageFromUrl } from "../services/formUtils";
import { openDonationCheckout } from "../services/donationService";

export default function CampaignPreview({ campaignResult, onRedo, onConfirmed, onBack }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [isDonating, setIsDonating] = useState(false);
  const [donationFailed, setDonationFailed] = useState(false);
  const [showDonationThanks, setShowDonationThanks] = useState(false);

  const imageUrl = campaignResult?.imageUrl || null;
  const isReady = Boolean(imageUrl);

  const handleConfirm = async () => {
    if (!isReady) return;
    setIsDownloading(true);
    setDownloadError(null);
    try {
      await downloadImageFromUrl(imageUrl, `updo-campaign-${campaignResult.campaignId}.png`);
      onConfirmed?.();
    } catch (err) {
      setDownloadError("Couldn't download the image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDonate = async () => {
    setIsDonating(true);
    setDonationFailed(false);
    try {
      await openDonationCheckout(100, {
        onSuccess: () => setShowDonationThanks(true),
        onFailure: () => setDonationFailed(true),
      });
    } catch (err) {
      console.error("[CampaignPreview] donation checkout failed:", err);
      setDonationFailed(true);
    } finally {
      setIsDonating(false);
    }
  };

  // Hidden full-screen page, replaces everything else while shown, then
  // auto-redirects to Dashboard via onBack (same callback used elsewhere).
  if (showDonationThanks) {
    return <DonationThanks onDone={onBack} />;
  }

  return (
    <div className="min-h-screen w-full bg-slate-900">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-14 pb-16 flex flex-col gap-8">
        {/* Donation banner */}
        <section className="bg-gray-800 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-600 p-8 flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <p className="text-white text-2xl font-normal font-['Poppins']">
              The project isn&apos;t finished. The journey is just beginning.
            </p>
            <p
              aria-hidden="true"
              className="absolute inset-0 text-white/10 text-2xl font-normal font-['Poppins'] blur-[2px] select-none"
            >
              The project isn&apos;t finished. The journey is just beginning.
            </p>
          </div>
          <p className="text-white text-xl font-normal font-['Poppins'] max-w-2xl">
            Help us continue building <span className="font-extrabold">UPDO AI</span> - smarter
            marketing tools for creators, businesses, and dreamers around the world.
          </p>
          <button
            type="button"
            onClick={handleDonate}
            disabled={isDonating}
            className="px-9 py-3.5 bg-violet-900/20 rounded-full text-white text-xl font-normal font-['Poppins'] hover:bg-violet-900/30 transition-colors disabled:opacity-60"
          >
            {isDonating ? "Opening..." : "Donate Now !"}
          </button>

          {donationFailed && (
            <p className="text-red-400 text-sm font-['Poppins']">
              Donation didn&apos;t go through. Feel free to try again.
            </p>
          )}
        </section>

        {/* Preview */}
        <section className="bg-gray-800 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-600 p-8 flex flex-col items-center gap-6">
          <h2 className="text-indigo-100 text-2xl font-semibold font-['K2D'] leading-8">
            Preview
          </h2>

          <div className="w-full aspect-[4/3] max-h-[600px] bg-slate-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-600 overflow-hidden flex items-center justify-center">
            {isReady ? (
              <img
                src={imageUrl}
                alt="Generated campaign poster"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-neutral-600 border-t-purple-300 rounded-full animate-spin" />
                <p className="text-zinc-300 text-sm font-normal font-['Poppins']">
                  Generating your poster...
                </p>
              </div>
            )}
          </div>

          {downloadError && (
            <p className="text-red-400 text-sm font-['Poppins']">{downloadError}</p>
          )}
        </section>

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={onRedo}
            className="flex items-center gap-3 px-6 h-14 rounded-full outline outline-1 outline-offset-[-1px] outline-neutral-600 text-indigo-100 text-base font-normal font-['Poppins'] hover:bg-slate-800/50 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.825 9L9.425 14.6L8 16L0 8L8 0L9.425 1.4L3.825 7H16V9H3.825Z" fill="#DAE2FD" />
            </svg>
            Redo
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isReady || isDownloading}
            className="group flex items-center gap-3 px-6 h-14 bg-purple-300 rounded-full shadow-[0px_10px_15px_-3px_rgba(208,188,255,0.20)] hover:bg-purple-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:hover:scale-100"
          >
            <span className="text-violet-900 text-base font-normal font-['Poppins']">
              {isDownloading ? "Downloading..." : "Confirm"}
            </span>
            {!isDownloading && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-200 group-hover:translate-x-1">
                <path d="M12.175 9H0V7H12.175L6.575 1.4L8 0L16 8L8 16L6.575 14.6L12.175 9Z" fill="#3C0091" />
              </svg>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}