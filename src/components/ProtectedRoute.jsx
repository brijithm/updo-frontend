import { Navigate } from "react-router-dom";

// TEMP: mocked auth check. Once the backend is connected, replace this with
// a real check (e.g. a token in an AuthContext, or a /me API call) — the
// routing logic below doesn't need to change either way.
function isAuthenticated() {
  return localStorage.getItem("updo_auth") === "true";
}

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}