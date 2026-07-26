// ---------------------------------------------------------------------------
// SINGLE PLUGPOINT for connecting the landing page review carousel to the
// real backend. LandingPage.jsx calls getApprovedReviews() / submitReview()
// / isLoggedIn() and doesn't care what's inside them.
// ---------------------------------------------------------------------------

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
 * Whether a user is currently logged in, based on the stored access token.
 * Used to gate the "Tap to Review" form on the landing page — submitting a
 * review requires an account.
 */
export function isLoggedIn() {
  return !!localStorage.getItem("updo_access_token");
}

/**
 * Fetches approved reviews for the landing page carousel.
 * GET /reviews -> { reviews: [...], count: N }
 * Public endpoint — no auth header needed.
 */
export async function getApprovedReviews() {
  const response = await fetch(`${API_BASE_URL}/reviews`);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.detail || "Failed to load reviews");
  }

  const data = await response.json();
  return data.reviews || [];
}

/**
 * Submits a new review. Requires the user to be logged in.
 * "business" is NOT sent from here — the backend fills it in from the
 * user's brand. New reviews come back as is_approved = false and won't
 * show up in getApprovedReviews() until approved in Supabase.
 *
 * "email" is sent as an extra field alongside the review — it is NOT used
 * for auth/gating, that's still handled by the Authorization header above.
 *
 * POST /reviews/create -> { message, review }
 */
export async function submitReview({ name, email, rating, reviewText }) {
  const response = await fetch(`${API_BASE_URL}/reviews/create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      name: name || null,
      email: email || null,
      rating,
      review_text: reviewText,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || "Failed to submit review");
  }

  return data;
}