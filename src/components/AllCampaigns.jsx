import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { hasBrandSettings } from "../services/brandService";
import { getMyCampaigns, getUsageSummary } from "../services/campaignService";

function StatusBadge({ status }) {
  const isPublished = status === "Published";
  const isFailed = status === "Failed";
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold font-['K2D'] ${
        isPublished
          ? "bg-purple-500 text-white"
          : isFailed
          ? "bg-red-500/80 text-white"
          : "bg-slate-700 text-zinc-300 animate-pulse"
      }`}
    >
      {status}
    </span>
  );
}

const cardClass =
  "p-6 bg-slate-800/70 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-700/50 backdrop-blur-[6px] transition-all duration-300";

export default function AllCampaigns() {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Usage summary drives the "X / Y campaigns used" line and the create-limit
  // gating. Falls back to counting fetched campaigns if the endpoint fails.
  const [postsUsed, setPostsUsed] = useState(0);
  const [postsMax, setPostsMax] = useState(null);

  const [brandReady, setBrandReady] = useState(true);
  useEffect(() => {
    hasBrandSettings().then(setBrandReady).catch(() => setBrandReady(true));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [campaignList, usage] = await Promise.allSettled([
          getMyCampaigns(),
          getUsageSummary(),
        ]);

        if (cancelled) return;

        if (campaignList.status === "fulfilled") {
          setCampaigns(campaignList.value);
        } else {
          setError(campaignList.reason?.message || "Failed to load campaigns");
        }

        if (usage.status === "fulfilled") {
          setPostsUsed(usage.value.posts_used ?? 0);
          setPostsMax(usage.value.posts_max ?? null);
        } else if (campaignList.status === "fulfilled") {
          // Usage summary failed but we still have campaigns — fall back to
          // treating the campaign count as "used" with no known max.
          setPostsUsed(campaignList.value.length);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const limitReached = postsMax != null && postsUsed >= postsMax;
  const createBlocked = !brandReady || limitReached;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const enter = (delay = "") =>
    `transition-all duration-700 ease-out ${delay} ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`;

  return (
    <div className="min-h-screen w-full bg-slate-900">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-16 pb-20 flex flex-col items-center gap-10">
        <div className={`flex flex-col items-center gap-1 text-center ${enter()}`}>
          <h1 className="text-indigo-100 text-3xl font-semibold font-['K2D'] leading-10">
            All Campaigns
          </h1>
          <p className="text-zinc-300 text-base font-normal font-['K2D'] leading-6">
            {postsMax != null ? `${postsUsed} / ${postsMax} campaigns used` : `${postsUsed} campaigns used`}
          </p>
        </div>

        <div className={`w-full flex flex-col gap-4 ${cardClass} ${enter("delay-100")}`}>
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
                    Loading campaigns…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-red-400 font-['K2D'] text-sm">
                    {error}
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-zinc-400 font-['K2D'] text-sm">
                    No campaigns yet — create your first one.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} className="border-t border-slate-700/50 hover:bg-slate-700/20 transition-colors">
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

        {/* Back → Dashboard, Create → Campaign creator (same gating as Dashboard) */}
        <div className={`w-full flex flex-col items-center gap-3 ${enter("delay-200")}`}>
          <div className="w-full flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-3 px-6 h-14 rounded-full outline outline-1 outline-offset-[-1px] outline-neutral-600 text-indigo-100 text-base font-normal font-['Poppins'] hover:bg-slate-800/50 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.825 9L9.425 14.6L8 16L0 8L8 0L9.425 1.4L3.825 7H16V9H3.825Z" fill="#DAE2FD" />
              </svg>
              Back
            </button>

            <button
              type="button"
              onClick={() => navigate("/campaign")}
              disabled={createBlocked}
              className="group flex items-center gap-3 px-6 h-14 bg-purple-300 rounded-full shadow-[0px_10px_15px_-3px_rgba(208,188,255,0.20)] hover:bg-purple-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none disabled:hover:scale-100"
            >
              <span className="text-violet-900 text-base font-normal font-['Poppins']">Create</span>
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
            </button>
          </div>

          {!brandReady && (
            <button
              onClick={() => navigate("/brand-settings")}
              className="text-zinc-400 text-xs font-['K2D'] hover:text-purple-300 transition-colors"
            >
              Set up Brand Settings first to unlock campaigns →
            </button>
          )}
          {brandReady && limitReached && (
            <p className="text-zinc-400 text-xs font-['K2D']">
              You've used all {postsMax} campaign slots on your plan.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}