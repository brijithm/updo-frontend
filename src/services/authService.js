// ---------------------------------------------------------------------------
// SINGLE PLUGPOINT for connecting Login/Signup to the real backend.
// LoginPage.jsx calls loginUser() / registerUser() and doesn't care what's
// inside them. When auth changes, only this file needs to change.
// ---------------------------------------------------------------------------

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://updo-ai-backend-production.up.railway.app";

/**
 * Logs in with email + password.
 * Returns { access_token, user_id, email } on success.
 * Throws an Error with a user-facing message on failure.
 */
export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || "Invalid email or password");
  }

  // Persist token so other API calls (brands, campaigns, etc.) can use it
  localStorage.setItem("updo_access_token", data.access_token);
  localStorage.setItem("updo_user_email", data.email);

  return data;
}

/**
 * Registers a new account with email + password + full name.
 * Supabase sends a verification email automatically.
 * Returns { user_id, next_step } on success.
 * Throws an Error with a user-facing message on failure.
 */
export async function registerUser(email, password, fullName) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name: fullName }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || "Registration failed");
  }

  return data;
}