// ---------------------------------------------------------------------------
// SINGLE PLUGPOINT for connecting the Campaign Creator to the real backend.
// Everything else (Campaign.jsx, App.jsx) calls generateCampaign() and
// doesn't care what's inside it.
// ---------------------------------------------------------------------------

import { emptyToNull } from "./formUtils";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://updo-ai-backend-production.up.railway.app";

function authHeaders() {
  const token = localStorage.getItem("updo_access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Fetches the user's default/only brand id. Campaign generation requires
 * a brand_id; in beta users only have one brand, so we just grab the
 * first one from getMyBrands() rather than adding a brand-picker UI.
 */
async function getDefaultBrandId() {
  const response = await fetch(`${API_BASE_URL}/brands/my-brands`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to load brand for campaign generation");
  }

  const data = await response.json();
  const brand = data.brands?.[0];
  if (!brand?.id) {
    throw new Error("No brand found — set up Brand Settings first");
  }
  return brand.id;
}

/**
 * Sends a campaign creation request to the backend.
 * POST /campaigns/generate — SYNCHRONOUS: waits for image + caption
 * generation to complete before responding (can take 10-30+ seconds).
 *
 * Payload from Campaign.jsx (rawPayload):
 *   { aspectRatio, platform, goal, mood, offer, audience }
 *
 * Maps to backend's GenerateCampaignRequest:
 *   { brand_id, campaign_goal, platform, mood, cta, offer, target_audience }
 *
 * NOTE on limit_reached: the backend does NOT return a JSON
 * { status: "limit_reached" } — it throws HTTP 403 with a detail message
 * when beta generations are exhausted. We detect that here and normalize
 * it into { status: "limit_reached" } so Campaign.jsx's existing check
 * (`result?.status === "limit_reached"`) keeps working unchanged.
 *
 * NOTE on aspectRatio: the backend does not currently use this — it
 * hardcodes size="1024x1024" when generating the image. Selecting
 * Portrait/Landscape won't change the output shape yet.
 */
export async function generateCampaign(rawPayload) {
  const payload = emptyToNull(rawPayload);
  console.log("[campaignService] generateCampaign called with:", payload);

  const brandId = await getDefaultBrandId();

  const backendPayload = {
    brand_id: brandId,
    campaign_goal: payload.goal,
    platform: payload.platform, // "facebook" | "instagram"
    mood: payload.mood || "professional",
    cta: payload.cta || "Learn More",
    offer: payload.offer,
    target_audience: payload.audience,
  };

  const response = await fetch(`${API_BASE_URL}/campaigns/generate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(backendPayload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 403) {
      // Beta limit reached (or brand plan cap) — normalize for Campaign.jsx
      return { success: false, status: "limit_reached" };
    }
    throw new Error(data?.detail || "Failed to generate campaign");
  }

  return {
    success: true,
    campaignId: data.campaign_id,
    imageUrl: data.image_url,
    caption: data.caption,
    hashtags: data.hashtags,
    postsRemaining: data.posts_remaining,
    status: "completed",
  };
}

/**
 * Saves the user's post-generation experience rating.
 *
 * TODO when wiring up for real:
 *   - POST `${API_BASE_URL}/campaigns/${campaignId}/rating` with { rating }
 */
export async function submitCampaignRating(campaignId, rating) {
  console.log("[campaignService] submitCampaignRating called with:", { campaignId, rating });

  // --- MOCK IMPLEMENTATION (remove once backend is wired) -------------------
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { success: true };
  // ---------------------------------------------------------------------------

  // --- REAL IMPLEMENTATION ---------------------------------------------------
  // const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/rating`, {
  //   method: "POST",
  //   headers: authHeaders(),
  //   body: JSON.stringify({ rating }),
  // });
  // if (!response.ok) throw new Error("Failed to submit rating");
  // return response.json();
}

/**
 * Fetches the logged-in user's campaigns from the real backend.
 * GET /campaigns/my-campaigns  ->  { campaigns: [...], count: N }
 *
 * Maps backend fields (campaign_goal, campaign_status, created_at) into the
 * shape Dashboard.jsx already expects (name, status, date) so no JSX has
 * to change — only this function.
 */
export async function getMyCampaigns() {
  const response = await fetch(`${API_BASE_URL}/campaigns/my-campaigns`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.detail || "Failed to load campaigns");
  }

  const data = await response.json();

  const STATUS_LABELS = {
    completed: "Published",
    processing: "Processing",
    failed: "Failed",
  };

  return (data.campaigns || []).map((c) => ({
    id: c.id,
    name: c.campaign_goal || "Untitled Campaign",
    platform: c.platform
      ? c.platform.charAt(0).toUpperCase() + c.platform.slice(1)
      : "—",
    date: c.created_at
      ? new Date(c.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—",
    status: STATUS_LABELS[c.campaign_status] || c.campaign_status || "Unknown",
  }));
}

/**
 * Fetches the logged-in user's plan usage summary from the real backend.
 * GET /usage/summary  ->  { posts_used, posts_max, posts_remaining, ... }
 */
export async function getUsageSummary() {
  const response = await fetch(`${API_BASE_URL}/usage/summary`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.detail || "Failed to load usage summary");
  }

  return response.json();
}