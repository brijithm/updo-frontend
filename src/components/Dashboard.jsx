import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { hasBrandSettings } from "../services/brandService";
import { getMyCampaigns, getUsageSummary } from "../services/campaignService";
import { openDonationCheckout } from "../services/donationService";

function StatusBadge({ status }) {
  const isPublished = status === "Published";
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold font-['K2D'] ${
        isPublished
          ? "bg-purple-500 text-white"
          : "bg-slate-700 text-zinc-300 animate-pulse"
      }`}
    >
      {status}
    </span>
  );
}

// Shared card treatment: subtle lift + shadow on hover so the dashboard feels
// alive without being distracting.
const cardClass =
  "p-6 bg-slate-800/70 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-700/50 backdrop-blur-[6px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-950/20";

export default function Dashboard() {
  const navigate = useNavigate();

  // Real data from the backend — replaces the old MOCK_RECENT_CAMPAIGNS block.
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [campaignLimit, setCampaignLimit] = useState(7);
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [campaigns, usage] = await Promise.all([
          getMyCampaigns(),
          getUsageSummary(),
        ]);
        setRecentCampaigns(campaigns.slice(0, 5)); // show most recent 5
        setTotalCampaigns(usage.posts_remaining);
        setCampaignLimit(usage.posts_max);
      } catch (err) {
        console.error("[Dashboard] Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // New Campaign is blocked in two cases:
  //  1. The user has never saved Brand Settings — UPDO AI needs a brand
  //     identity before it can generate anything.
  //  2. The user has already used all campaign slots on their plan.
  const [brandReady, setBrandReady] = useState(true); // optimistic default while checking
  useEffect(() => {
    hasBrandSettings().then(setBrandReady);
  }, []);
  // totalCampaigns now holds posts_remaining (counts DOWN, e.g. 7/7 -> 0/7)
  const limitReached = totalCampaigns <= 0;
  const createBlocked = !brandReady || limitReached;

  // Simple entrance animation: fade + rise, staggered per section.
  // No extra libraries — just a mount flag driving Tailwind transitions.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Signed-in user's email, set by authService.js on login.
  const userEmail = localStorage.getItem("updo_user_email");

  // Donation modal (Razorpay flow, wired via donationService.js).
  const [donationOpen, setDonationOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState(100);
  const [donationLoading, setDonationLoading] = useState(false);

  useEffect(() => {
    if (document.getElementById("razorpay-checkout-js")) return;
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  async function handleDonate() {
    setDonationLoading(true);
    try {
      await openDonationCheckout(donationAmount, {
        onSuccess: () => navigate("/donation-thanks"),
        onFailure: () => setDonationLoading(false),
      });
    } finally {
      setDonationLoading(false);
      setDonationOpen(false);
    }
  }

  const enter = (delay = "") =>
    `transition-all duration-700 ease-out ${delay} ${
      mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`;

  return (
    <div className="min-h-screen w-full bg-slate-900">
      <style>{`
        /* Quick Actions card: slow, subtle pulsing glow to draw the eye
           without being distracting. Kept scoped to this card only. */
        @keyframes quickActionsGlow {
          0%, 100% { box-shadow: 0 0 0 rgba(168, 85, 247, 0); }
          50% { box-shadow: 0 0 24px rgba(168, 85, 247, 0.12); }
        }
        .quick-actions-card {
          animation: quickActionsGlow 4s ease-in-out infinite;
        }

        /* Wand/sparkle icon: gentle wiggle + scale on button hover */
        @keyframes wandWiggle {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-12deg) scale(1.08); }
          75% { transform: rotate(12deg) scale(1.08); }
        }
        .group:hover .wand-icon {
          animation: wandWiggle 0.5s ease-in-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .quick-actions-card { animation: none; }
          .group:hover .wand-icon { animation: none; }
        }
      `}</style>

      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-16 pb-20 flex flex-col items-center gap-12">
        {/* Headline */}
        <div className={`flex flex-col items-center gap-1 text-center ${enter()}`}>
          <h1 className="text-indigo-100 text-3xl font-semibold font-['K2D'] leading-10 [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)]">
            System Overview
          </h1>
          <p className="text-zinc-300 text-base font-normal font-['K2D'] leading-6">
            Welcome back. Your AI-automated campaigns are running at peak efficiency.
          </p>
          {userEmail && (
            <div className="mt-1 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 outline outline-1 outline-slate-700/50 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-zinc-300 text-xs font-medium font-['K2D']">
                Signed in as {userEmail}
              </span>
            </div>
          )}
        </div>

        {/* Stats + content */}
        <div className="w-full flex flex-col gap-6">
          {/* Total Campaigns stat card */}
          <div className={`w-full h-32 flex flex-col justify-between ${cardClass} ${enter("delay-100")}`}>
            <div className="w-full flex justify-between items-start">
              <span className="text-zinc-300 text-xs font-semibold font-['K2D'] tracking-wide uppercase">
                Total Campaigns
              </span>
              <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 9V7H20V9H16ZM17.2 16L14 13.6L15.2 12L18.4 14.4L17.2 16ZM15.2 4L14 2.4L17.2 0L18.4 1.6L15.2 4ZM3 15V11H2C1.45 11 0.979167 10.8042 0.5875 10.4125C0.195833 10.0208 0 9.55 0 9V7C0 6.45 0.195833 5.97917 0.5875 5.5875C0.979167 5.19583 1.45 5 2 5H6L11 2V14L6 11H5V15H3ZM9 10.45V5.55L6.55 7H2V9H6.55L9 10.45ZM12 11.35V4.65C12.45 5.05 12.8125 5.5375 13.0875 6.1125C13.3625 6.6875 13.5 7.31667 13.5 8C13.5 8.68333 13.3625 9.3125 13.0875 9.8875C12.8125 10.4625 12.45 10.95 12 11.35Z" fill="#D0BCFF" />
              </svg>
            </div>
            <div className="text-indigo-100 text-3xl font-semibold font-['K2D'] leading-10">
              {loading ? "..." : `${totalCampaigns} / ${campaignLimit}`}
            </div>
          </div>

          {/* Recent Campaigns + Quick Actions */}
          <div className={`w-full grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 ${enter("delay-200")}`}>
            {/* Recent Campaigns table */}
            <div className={`flex flex-col gap-4 ${cardClass}`}>
              <div className="flex justify-between items-center">
                <span className="text-indigo-100 text-lg font-semibold font-['K2D']">
                  Recent Campaigns
                </span>
                <button
                  onClick={() => navigate("/campaigns")}
                  className="text-purple-300 text-sm font-medium font-['K2D'] hover:text-purple-200 transition-colors"
                >
                  View All
                </button>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="text-zinc-300 text-xs font-semibold font-['K2D'] uppercase tracking-wide">
                    <th className="pb-2">Campaign Name</th>
                    <th className="pb-2">Platform</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-zinc-400 font-['K2D'] text-sm">
                        Loading campaigns...
                      </td>
                    </tr>
                  ) : recentCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-zinc-400 font-['K2D'] text-sm">
                        No campaigns yet — create your first one to see it here.
                      </td>
                    </tr>
                  ) : (
                    recentCampaigns.map((c) => (
                      <tr
                        key={c.id}
                        className="border-t border-slate-700/50 hover:bg-slate-700/20 transition-colors"
                      >
                        <td className="py-3 text-indigo-100 font-['K2D'] text-sm">{c.name}</td>
                        <td className="py-3 text-zinc-300 font-['K2D'] text-sm">{c.platform}</td>
                        <td className="py-3 text-zinc-300 font-['K2D'] text-sm">{c.date}</td>
                        <td className="py-3 text-right">
                          <StatusBadge status={c.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Quick Actions */}
            <div className={`quick-actions-card flex flex-col gap-4 ${cardClass}`}>
              <span className="text-indigo-100 text-sm font-medium font-['K2D'] uppercase tracking-wide">
                Quick Actions
              </span>

              <button
                onClick={() => navigate("/campaign")}
                disabled={createBlocked}
                className="group w-full h-14 bg-purple-300 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:bg-purple-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-4px_rgba(196,165,255,0.5)] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                <span className="wand-icon inline-flex transform origin-center">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 21 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M18 6L17.05 3.95L15 3L17.05 2.05L18 0L18.95 2.05L21 3L18.95 3.95L18 6ZM6.5 6L5.55 3.95L3.5 3L5.55 2.05L6.5 0L7.45 2.05L9.5 3L7.45 3.95L6.5 6ZM18 17.5L17.05 15.45L15 14.5L17.05 13.55L18 11.5L18.95 13.55L21 14.5L18.95 15.45L18 17.5ZM3.1 20.7L0.3 17.9C0.1 17.7 0 17.4583 0 17.175C0 16.8917 0.1 16.65 0.3 16.45L11.45 5.3C11.65 5.1 11.8917 5 12.175 5C12.4583 5 12.7 5.1 12.9 5.3L15.7 8.1C15.9 8.3 16 8.54167 16 8.825C16 9.10833 15.9 9.35 15.7 9.55L4.55 20.7C4.35 20.9 4.10833 21 3.825 21C3.54167 21 3.3 20.9 3.1 20.7ZM3.85 18.6L11 11.4L9.6 10L2.4 17.15L3.85 18.6Z" fill="#3C0091" />
                  </svg>
                </span>
                <span className="text-violet-900 text-base font-bold font-['K2D']">
                  New Campaign
                </span>
                <span className="inline-flex transform transition-transform duration-200 group-hover:translate-x-1">
                  <svg
                    width="7"
                    height="11"
                    viewBox="0 0 8 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M4.6 6L0 1.4L1.4 0L7.4 6L1.4 12L0 10.6L4.6 6Z" fill="#3C0091" />
                  </svg>
                </span>
              </button>

              {!brandReady && (
                <button
                  onClick={() => navigate("/brand-settings")}
                  className="text-zinc-400 text-xs font-['K2D'] hover:text-purple-300 transition-colors text-center -mt-2"
                >
                  Set up Brand Settings first to unlock campaigns →
                </button>
              )}
              {brandReady && limitReached && (
                <p className="text-zinc-400 text-xs font-['K2D'] text-center -mt-2">
                  You've used all {campaignLimit} campaign slots on your plan.
                </p>
              )}

              <button
                onClick={() => navigate("/scheduler")}
                className="group w-full h-14 bg-slate-800/70 rounded-lg outline outline-1 outline-offset-[-1px] outline-slate-700/50 flex items-center justify-center gap-2 transition-all duration-200 hover:bg-slate-700/60 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 2V5M17 2V5M3.5 9H20.5M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="#D0BCFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-indigo-100 text-base font-semibold font-['K2D']">
                  Scheduler
                </span>
                <span className="inline-flex transform transition-transform duration-200 group-hover:translate-x-1">
                  <svg width="7" height="11" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.6 6L0 1.4L1.4 0L7.4 6L1.4 12L0 10.6L4.6 6Z" fill="#D0BCFF" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Donate — fixed bottom-right, Dashboard only */}
      <button
        onClick={() => setDonationOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-sm font-semibold font-['K2D'] shadow-[0_8px_24px_-4px_rgba(168,85,247,0.5)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-4px_rgba(168,85,247,0.6)] transition-all duration-200 active:scale-[0.97]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21C12 21 4 15.5 4 9.5C4 6.5 6.3 4.5 9 4.5C10.5 4.5 11.5 5.2 12 6C12.5 5.2 13.5 4.5 15 4.5C17.7 4.5 20 6.5 20 9.5C20 15.5 12 21 12 21Z" fill="white" />
        </svg>
        Support Us
      </button>

      {donationOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-6 sm:pb-0">
          <div className="w-full max-w-sm bg-slate-800 rounded-2xl outline outline-1 outline-slate-700/50 p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-indigo-100 text-lg font-semibold font-['K2D']">
                Support UPDO AI
              </span>
              <button
                onClick={() => setDonationOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 text-sm"
              >
                ✕
              </button>
            </div>
            <p className="text-zinc-400 text-sm font-['K2D']">
              Enjoying UPDO AI? A small donation helps us keep building.
            </p>

            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 250, 500].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setDonationAmount(amt)}
                  className={`h-10 rounded-lg text-sm font-semibold font-['K2D'] transition-colors ${
                    donationAmount === amt
                      ? "bg-purple-500 text-white"
                      : "bg-slate-700/60 text-zinc-300 hover:bg-slate-700"
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <input
              type="number"
              min="1"
              value={donationAmount}
              onChange={(e) => setDonationAmount(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg bg-slate-900/60 outline outline-1 outline-slate-700/50 text-indigo-100 text-sm font-['K2D'] focus:outline-purple-400"
              placeholder="Custom amount (₹)"
            />

            <button
              onClick={handleDonate}
              disabled={donationLoading || donationAmount < 1}
              className="w-full h-12 bg-purple-300 rounded-lg text-violet-900 text-base font-bold font-['K2D'] transition-all hover:bg-purple-200 disabled:opacity-40 disabled:pointer-events-none"
            >
              {donationLoading ? "Opening checkout..." : `Donate ₹${donationAmount}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}