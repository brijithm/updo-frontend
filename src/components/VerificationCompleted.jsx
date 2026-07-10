import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function VerificationCompleted() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error"

  useEffect(() => {
    // Supabase's "Confirm signup" email redirects here with the new
    // session in the URL hash: #access_token=...&refresh_token=...&type=signup
    // (same shape as the old implicit password-recovery flow). We parse it,
    // store the token the same way authService.js's loginUser() does, and
    // send the user straight into the dashboard as a logged-in user.
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");

    if (!accessToken) {
      setStatus("error");
      return;
    }

    localStorage.setItem("updo_access_token", accessToken);

    // Clean the sensitive token out of the visible URL now that it's stored.
    window.history.replaceState(null, "", window.location.pathname);

    const timer = setTimeout(() => {
      setStatus("success");
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status !== "success") return;
    const timer = setTimeout(() => navigate("/dashboard"), 900);
    return () => clearTimeout(timer);
  }, [status, navigate]);

  return (
    <div className="w-full min-h-screen bg-[#060E20] flex items-center justify-center">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .verify-spinner {
          animation: spin 0.9s linear infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .verify-fade { animation: fadeIn 0.5s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .verify-spinner { animation: none; }
          .verify-fade { animation: none; opacity: 1; }
        }
      `}</style>

      <div className="w-full max-w-[1530px] min-h-screen flex flex-col lg:flex-row">
        {/* Left panel */}
        <div className="flex-1 relative overflow-hidden bg-[#0B1326] flex flex-col justify-center px-16 py-20">
          <div className="mb-8 flex items-center gap-2">
            <img src={logo} alt="UPDO" className="h-9 w-auto" />
            <span className="font-afacad text-2xl font-bold text-[#D0BCFF] tracking-tight">AI</span>
          </div>

          <h1 className="font-afacad text-4xl lg:text-5xl text-white leading-tight mb-6 max-w-lg">
            Elevate your brand with the power of enterprise-grade AI.
          </h1>
          <p className="font-poppins text-[#F5F7FA]/70 text-base max-w-md">
            Join the next generation of content creators using intelligent automation to scale global reach.
          </p>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex items-center justify-center p-8 bg-[#03144C]">
          <div className="w-full max-w-96 flex flex-col items-center gap-6 text-center">
            {status === "verifying" && (
              <div className="verify-fade flex flex-col items-center gap-6">
                <div
                  className="verify-spinner w-12 h-12 rounded-full border-4 border-[#D0BCFF]/20 border-t-[#D0BCFF]"
                  role="status"
                  aria-label="Verifying"
                />
                <h2 className="text-white text-2xl font-semibold font-poppins">
                  Verifying your email…
                </h2>
                <p className="font-poppins text-[#F5F7FA]/60 text-sm">
                  This will only take a moment.
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="verify-fade flex flex-col items-center gap-6">
                <h2 className="text-white text-2xl font-semibold font-poppins">
                  Verification Completed!
                </h2>
                <p className="font-poppins text-[#F5F7FA]/60 text-sm">
                  Taking you to your dashboard…
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="verify-fade flex flex-col items-center gap-6">
                <h2 className="text-white text-2xl font-semibold font-poppins">
                  Verification link invalid or expired
                </h2>
                <p className="font-poppins text-[#F5F7FA]/60 text-sm">
                  Please try logging in, or request a new verification email.
                </p>
                <Link
                  to="/login"
                  className="w-full py-4 bg-[#D0BCFF] rounded-lg text-[#0B1326] text-base font-medium font-afacad tracking-tight shadow-lg hover:bg-[#CBC3D7] transition-colors text-center"
                >
                  Continue to Log In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}