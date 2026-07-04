// ---------------------------------------------------------------------------
// SINGLE PLUGPOINT for connecting the Campaign Creator to the real backend.
// Everything else (Campaign.jsx, App.jsx) calls generateCampaign() and
// doesn't care what's inside it. When the backend is ready, only this file
// needs to change — nothing upstream does.
// ---------------------------------------------------------------------------

import { emptyToNull } from "./formUtils";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://updo-ai-backend-production.up.railway.app";

/**
 * Sends a campaign creation request to the backend.
 *
 * Expected payload shape (from Campaign.jsx onGenerate):
 *   {
 *     aspectRatio: "square" | "portrait" | "landscape",
 *     goal: string,
 *     mood: string,
 *     offer: string,
 *     audience: string,
 *   }
 *
 * Any field the user left blank is sent as `null`, never as "".
 *
 * TODO when wiring up for real:
 *   - Attach auth token (Supabase session) to the Authorization header
 *   - Point this at the actual campaigns route, e.g. POST /campaigns
 *   - Map `aspectRatio` id ("square"/"portrait"/"landscape") to whatever
 *     format the Thinker/prompt_builder expects (e.g. "1:1", "9:16", "16:9")
 *   - Handle credit-deduction / insufficient-credit error responses
 *   - Replace the mock delay + fake response below with the real fetch call
 */
export async function generateCampaign(rawPayload) {
  const payload = emptyToNull(rawPayload);
  console.log("[campaignService] generateCampaign called with:", payload);

  // --- MOCK IMPLEMENTATION (remove once backend is wired) -------------------
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return {
    success: true,
    campaignId: "mock-" + Date.now(),
    imageUrl: "https://picsum.photos/seed/updo/800/600", // TEMP placeholder — remove once backend returns real imageUrl
    status: "processing",
  };
  // ---------------------------------------------------------------------------

  // --- REAL IMPLEMENTATION (uncomment + finish when backend is ready) -------
  // const token = /* get from your auth context / Supabase session */;
  //
  // const response = await fetch(`${API_BASE_URL}/campaigns`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${token}`,
  //   },
  //   body: JSON.stringify(payload),
  // });
  //
  // if (!response.ok) {
  //   const errorBody = await response.json().catch(() => null);
  //   throw new Error(errorBody?.detail || "Failed to generate campaign");
  // }
  //
  // return response.json();
}

/**
 * Saves the user's post-generation experience rating.
 *
 * TODO when wiring up for real:
 *   - POST `${API_BASE_URL}/campaigns/${campaignId}/rating` with { rating }
 *   - Attach auth token same as generateCampaign
 */
export async function submitCampaignRating(campaignId, rating) {
  console.log("[campaignService] submitCampaignRating called with:", { campaignId, rating });

  // --- MOCK IMPLEMENTATION (remove once backend is wired) -------------------
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { success: true };
  // ---------------------------------------------------------------------------

  // --- REAL IMPLEMENTATION ---------------------------------------------------
  // const token = /* get from your auth context / Supabase session */;
  // const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/rating`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  //   body: JSON.stringify({ rating }),
  // });
  // if (!response.ok) throw new Error("Failed to submit rating");
  // return response.json();
}
/**
 * Sends a campaign creation request to the backend.
 * ...
 * TODO when wiring up for real:
 *   - Attach auth token (Supabase session) to the Authorization header
 *   - Point this at the actual campaigns route, e.g. POST /campaigns
 *   - Map `aspectRatio` id ("square"/"portrait"/"landscape") to whatever
 *     format the Thinker/prompt_builder expects (e.g. "1:1", "9:16", "16:9")
 *   - Handle credit-deduction / insufficient-credit error responses
 *   - IMPORTANT: when the user has used all 7 beta generations, the
 *     backend should return { success: false, status: "limit_reached" }
 *     (or a distinguishable error code/response) so Campaign.jsx can route
 *     to the BetaLimitReached page instead of the generic failed page.
 *   - Replace the mock delay + fake response below with the real fetch call
 */