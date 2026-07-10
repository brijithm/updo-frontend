import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { resetPassword } from "../services/authService";

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 7 11 7a13.16 13.16 0 0 1-3.06 3.94M6.61 6.61A13.16 13.16 0 0 0 1 12s4 7 11 7a10.44 10.44 0 0 0 5.39-1.61" />
    <path d="M1 1l22 22" />
  </svg>
);

const inputBase =
  "w-full pl-11 pr-4 py-4 bg-[#0B1326] rounded-lg outline outline-1 outline-offset-[-1px] outline-[#494454] text-[#F5F7FA] placeholder:text-[#958EA0] text-base font-poppins focus:outline-[#D0BCFF]";

// ---------------------------------------------------------------------------
// Supabase's password-recovery email links land here with the access token
// in the URL *hash* (e.g. #access_token=...&type=recovery&...), not a query
// param -- so we parse window.location.hash directly rather than using
// useSearchParams (which only reads the ?query part).
// ---------------------------------------------------------------------------
function useRecoveryToken() {
  const [accessToken, setAccessToken] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);
    setAccessToken(params.get("access_token"));
    setChecked(true);
  }, []);

  return { accessToken, checked };
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const { accessToken, checked } = useRecoveryToken();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match. Please try again.");
      return;
    }

    setPasswordError("");
    setIsSubmitting(true);

    try {
      await resetPassword(newPassword, accessToken);
      setDone(true);
    } catch (err) {
      setPasswordError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#060E20] flex items-center justify-center">
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
          <div className="w-full max-w-96 flex flex-col gap-6">
            <div className="flex flex-col gap-1 pb-2">
              <h2 className="text-white text-3xl font-semibold">Set New Password</h2>
              <p className="text-[#F5F7FA] text-base font-bold font-poppins">
                Choose a new password for your account.
              </p>
            </div>

            {!checked ? (
              // Still parsing the URL hash -- avoid a flash of the invalid-link
              // state while that happens.
              <p className="text-[#CBC3D7] text-sm font-poppins">Loading...</p>
            ) : !accessToken ? (
              <div className="flex flex-col gap-4">
                <p className="text-red-400 text-sm font-poppins">
                  This reset link is invalid or has expired. Please request a new one.
                </p>
                <Link
                  to="/forgot-password"
                  className="w-full py-4 bg-[#D0BCFF] rounded-lg text-[#0B1326] text-base font-medium font-afacad tracking-tight shadow-lg hover:bg-[#CBC3D7] transition-colors text-center"
                >
                  Request New Link
                </Link>
              </div>
            ) : done ? (
              <div className="flex flex-col gap-4">
                <p className="text-[#CBC3D7] text-sm font-poppins">
                  Your password has been reset successfully.
                </p>
                <Link
                  to="/login"
                  className="w-full py-4 bg-[#D0BCFF] rounded-lg text-[#0B1326] text-base font-medium font-afacad tracking-tight shadow-lg hover:bg-[#CBC3D7] transition-colors text-center"
                >
                  Back to Log In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[#CBC3D7] text-sm font-medium font-poppins tracking-tight">New Password</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#958EA0]">
                      <LockIcon />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={inputBase}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#958EA0] hover:text-[#F5F7FA]"
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#CBC3D7] text-sm font-medium font-poppins tracking-tight">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#958EA0]">
                      <LockIcon />
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputBase}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#958EA0] hover:text-[#F5F7FA]"
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <p className="text-red-400 text-sm font-poppins -mt-2">{passwordError}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#D0BCFF] rounded-lg text-[#0B1326] text-base font-medium font-afacad tracking-tight shadow-lg hover:bg-[#CBC3D7] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Please wait..." : "Reset Password"}
                </button>

                <Link
                  to="/login"
                  className="text-[#D0BCFF] text-sm font-semibold font-poppins tracking-wide text-center"
                >
                  Back to Log In
                </Link>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}