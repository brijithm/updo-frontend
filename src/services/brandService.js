// ---------------------------------------------------------------------------
// SINGLE PLUGPOINT for connecting Brand Settings to the real backend.
// BrandSettings.jsx calls saveBrandSettings() and doesn't care what's
// inside it. When the backend is ready, only this file needs to change.
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
 *     logoFileName: string | null, // actual file upload handled separately, via uploadBrandLogo()
 *   }
 */
export async function saveBrandSettings(rawPayload) {
  const payload = emptyToNull(rawPayload);
  console.log("[brandService] saveBrandSettings called with:", payload);

  const backendPayload = {
    name: payload.brandName,
    niche: payload.category,
    tone: null, // no matching form field yet
    tagline: payload.tagline,
    phone: payload.phone,
    colors: {
      primary: payload.colors?.primary || null,
      secondary: payload.colors?.secondary || null,
      accent: payload.colors?.accent || null,
    },
    website: payload.website,
    social_handles: {
      facebook: payload.socialLinks?.facebook || null,
      linkedin: payload.socialLinks?.linkedin || null,
      instagram: payload.socialLinks?.instagram || null,
      twitter: payload.socialLinks?.twitter || null,
    },
    is_default: true,
  };

  const response = await fetch(`${API_BASE_URL}/brands/create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(backendPayload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || "Failed to save brand settings");
  }

  return { success: true, brandId: data.brand?.id, brand: data.brand };
}

/**
 * Uploads a brand logo file. Must be called AFTER the brand is created,
 * using the brandId returned from saveBrandSettings().
 *
 * Backend: POST /brands/{brand_id}/upload-logo (multipart/form-data)
 *   - Only PNG/JPG/JPEG accepted, max 2MB (enforced server-side)
 *   - Returns { message, logo_url }
 */
export async function uploadBrandLogo(brandId, file) {
  const token = localStorage.getItem("updo_access_token");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/brands/${brandId}/upload-logo`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // NOTE: do NOT set Content-Type manually here — the browser sets
      // the correct multipart boundary automatically. Setting it by hand
      // breaks the upload.
    },
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || "Failed to upload logo");
  }

  return { success: true, logoUrl: data.logo_url };
}

/**
 * Checks whether the user has ever saved brand settings. Campaign creation
 * should be blocked until this returns true at least once — UPDO AI needs a
 * brand identity before it can generate anything.
 *
 * Uses GET /brands/my-brands (not /brands/default) so it correctly detects
 * brands created before `is_default` was being set, e.g. ones made directly
 * via Swagger during testing.
 */
export async function hasBrandSettings() {
  const response = await fetch(`${API_BASE_URL}/brands/my-brands`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to check brand settings");
  }

  const data = await response.json();
  return (data.count || 0) > 0;
}

/**
 * Fetches the user's brands. Useful for pre-filling BrandSettings.jsx if
 * you want to show existing values instead of a blank form.
 */
export async function getMyBrands() {
  const response = await fetch(`${API_BASE_URL}/brands/my-brands`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to load brands");
  }

  const data = await response.json();
  return data.brands || [];
}