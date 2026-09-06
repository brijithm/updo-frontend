// ---------------------------------------------------------------------------
// Shared fetch wrapper for every authenticated API call (campaigns, brands,
// scheduler, usage, etc). Any service file that currently does its own
// `fetch(url, { headers: authHeaders() })` should switch to authFetch()
// from here instead — same call shape, but it also handles expired access
// tokens transparently.
//
// WHY THIS EXISTS: Supabase access tokens expire (~1hr). Before this file,
// nothing caught a 401 from an expired token — every request just failed,
// forever, until the user manually logged out and back in (this is what
// caused the "Couldn't load usage data" / "Invalid or expired token" wall
// of errors on Dashboard after a session sat open for a while).
//
// authFetch() catches a 401, tries ONE silent refresh via
// authService.js's refreshAccessToken(), and retries the original request
// once with the new token. If the refresh itself fails (refresh token
// missing/expired too), it clears the session and hard-redirects to
// /login — a clean re-login prompt instead of a broken dashboard.
// ---------------------------------------------------------------------------

import { refreshAccessToken } from "./authService";

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

function forceLogout() {
  localStorage.removeItem("updo_access_token");
  localStorage.removeItem("updo_refresh_token");
  localStorage.removeItem("updo_user_email");
  // Hard redirect (not react-router navigate) so this works no matter
  // which component/hook triggered it, including ones outside the
  // router tree, and guarantees a full clean state on the next load.
  window.location.href = "/login";
}

// Multiple requests can 401 around the same time (e.g. Dashboard.jsx's
// Promise.all([getMyCampaigns(), getUsageSummary()])). Without sharing the
// in-flight refresh, each would independently call /auth/refresh, and
// since Supabase rotates the refresh token on every use, the second call
// would get a stale/already-used token and fail. This ensures only one
// refresh happens no matter how many requests 401 at once.
let refreshInFlight = null;

function getSharedRefresh() {
  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

/**
 * Drop-in replacement for fetch() against the API — pass a path starting
 * with "/" (e.g. "/campaigns/my-campaigns") or a full URL. Automatically
 * attaches the auth header and JSON content-type (override via `options`
 * as needed, e.g. omit Content-Type for a GET with no body).
 *
 * On success: returns the Response exactly like fetch() would — callers
 * keep doing their own `.ok` / `.json()` handling as before.
 *
 * On 401: attempts one silent token refresh + retry. If that also fails,
 * clears the session and redirects to /login — the returned Response in
 * that case is the original 401 (the redirect is already navigating away,
 * but the promise still needs to resolve to something for any caller
 * mid-await).
 */
export async function authFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const doFetch = () =>
    fetch(url, {
      ...options,
      headers: {
        ...authHeaders(),
        ...(options.headers || {}),
      },
    });

  let response = await doFetch();

  if (response.status === 401) {
    const refreshed = await getSharedRefresh();

    if (!refreshed) {
      forceLogout();
      return response;
    }

    response = await doFetch();

    if (response.status === 401) {
      // New token was issued but this request STILL 401s — the token
      // isn't the problem (e.g. account disabled, revoked access).
      // Don't loop forever; force a clean re-login.
      forceLogout();
    }
  }

  return response;
}