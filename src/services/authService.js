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

  // Persist token so other API calls (brands, campaigns, etc.) can use it,
  // and so ProtectedRoute.jsx can tell the user is logged in.
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

/**
 * Sends a password reset link to the given email.
 * Backend calls Supabase's reset_password_email(), which emails a link
 * pointing to /reset-password with a recovery token (as a token_hash
 * query param) in the URL.
 * Returns { message, note } on success.
 * Throws an Error with a user-facing message on failure.
 */
export async function forgotPassword(email) {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || "Failed to send reset link");
  }

  return data;
}

/**
 * Sets a new password after the user clicks the reset link from their email.
 * Requires a Supabase session access_token, obtained by ResetPassword.jsx
 * via supabase.auth.verifyOtp() using the token_hash from the URL — since
 * the backend's /auth/reset-password route is protected by get_current_user
 * and expects a real Bearer JWT, not the raw one-time recovery code.
 * Returns { message, next_step } on success.
 * Throws an Error with a user-facing message on failure.
 */
export async function resetPassword(newPassword, accessToken) {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ new_password: newPassword }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || "Failed to reset password");
  }

  return data;
}

/**
 * Clears the stored session. Call this from a "Log Out" button, then
 * navigate("/login") in the component that calls it.
 */
export function logoutUser() {
  localStorage.removeItem("updo_access_token");
  localStorage.removeItem("updo_user_email");
}