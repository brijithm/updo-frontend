import { Navigate } from "react-router-dom";

// Checks for the access token that authService.js stores on successful
// login (see loginUser() in authService.js — it sets "updo_access_token").
// This only checks presence, not validity/expiry; see note in authService.js
// for a future upgrade path (e.g. verifying against /auth/me or checking
// JWT expiry client-side).
function isAuthenticated() {
  return !!localStorage.getItem("updo_access_token");
}

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}