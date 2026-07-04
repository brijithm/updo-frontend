// ---------------------------------------------------------------------------
// SINGLE PLUGPOINT for connecting Brand Settings to the real backend.
// BrandSettings.jsx calls saveBrandSettings() and doesn't care what's
// inside it. When the backend is ready, only this file needs to change.
// ---------------------------------------------------------------------------

import { emptyToNull } from "./formUtils";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://updo-ai-backend-production.up.railway.app";

/**
 * Persists brand settings. This is meant to be called once — brand creation
 * is a one-time confirm, not a live-editable form — so the backend should
 * treat this as create-or-replace, not a partial patch.
 *
 * Expected payload shape (from BrandSettings.jsx):
 *   {
 *     brandName: string,       // required, never null
 *     category: string | null,
 *     tagline: string | null,
 *     website: string | null,
 *     phone: string | null,
 *     socialLinks: {
 *       facebook: string | null,
 *       linkedin: string | null,
 *       instagram: string | null,
 *       twitter: string | null,
 *     },
 *     colors: {
 *       primary: string | null,
 *       secondary: string | null,
 *       accent: string | null,
 *     },
 *     logoFileName: string | null, // actual file upload handled separately
 *   }
 *
 * Any field the user left blank is sent as `null`, never as "".
 *
 * TODO when wiring up for real:
 *   - Attach auth token (Supabase session) to the Authorization header
 *   - Point this at your brands route, e.g. POST /brands (create) — you
 *     already have brand CRUD with plan-based limits on the backend
 *   - If a logo file was selected, upload it separately (multipart or to
 *     Supabase Storage directly) and send back the resulting URL instead
 *     of just the file name
 *   - Replace the mock delay + fake response below with the real fetch call
 */
export async function saveBrandSettings(rawPayload) {
  const payload = emptyToNull(rawPayload);
  console.log("[brandService] saveBrandSettings called with:", payload);

  // --- MOCK IMPLEMENTATION (remove once backend is wired) -------------------
  await new Promise((resolve) => setTimeout(resolve, 900));
  return { success: true, brandId: "mock-brand-" + Date.now() };
  // ---------------------------------------------------------------------------

  // --- REAL IMPLEMENTATION (uncomment + finish when backend is ready) -------
  // const token = /* get from your auth context / Supabase session */;
  //
  // const response = await fetch(`${API_BASE_URL}/brands`, {
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
  //   throw new Error(errorBody?.detail || "Failed to save brand settings");
  // }
  //
  // return response.json();
}

/**
 * Checks whether the user has ever saved brand settings. Campaign creation
 * should be blocked until this returns true at least once — UPDO AI needs a
 * brand identity before it can generate anything.
 *
 * TODO when wiring up for real:
 *   - GET /brands (or /brands/me) and check if a record exists
 *   - Attach auth token same as saveBrandSettings above
 */
export async function hasBrandSettings() {
  // --- MOCK IMPLEMENTATION (remove once backend is wired) -------------------
  await new Promise((resolve) => setTimeout(resolve, 300));
  return false; // flip to true locally to test the "unlocked" state
  // ---------------------------------------------------------------------------

  // --- REAL IMPLEMENTATION (uncomment + finish when backend is ready) -------
  // const token = /* get from your auth context / Supabase session */;
  //
  // const response = await fetch(`${API_BASE_URL}/brands/me`, {
  //   headers: { Authorization: `Bearer ${token}` },
  // });
  //
  // if (response.status === 404) return false;
  // if (!response.ok) throw new Error("Failed to check brand settings");
  // return true;
}