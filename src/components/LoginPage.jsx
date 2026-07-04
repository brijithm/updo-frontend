import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 6-10 7L2 6" />
  </svg>
);

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

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") === "signup" ? "signup" : "login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (activeTab === "signup" && passwordValue !== confirmPassword) {
      setPasswordError("Passwords do not match. Please try again.");
      return;
    }

    setPasswordError("");

    if (activeTab === "login") {
      // TODO: replace with a real API call once the backend is connected
      localStorage.setItem("updo_auth", "true");
      navigate("/dashboard");
    } else {
      // TODO: your signup logic here (likely redirects to an email-verification step)
      console.log("Signup submitted");
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
              <h2 className="text-white text-3xl font-semibold">Welcome back</h2>
              <p className="text-[#F5F7FA] text-base font-bold font-poppins">
                Please enter your details to access your console.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-[#060E20] rounded-lg outline outline-1 outline-offset-[-1px] outline-[#494454]">
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-bold font-poppins tracking-tight ${
                  activeTab === "login" ? "bg-[#663399] text-[#F5F7FA]" : "text-[#F5F7FA]"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("signup")}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-bold font-poppins tracking-tight ${
                  activeTab === "signup" ? "bg-[#663399] text-[#F5F7FA]" : "text-[#F5F7FA]"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-2">
              <div className="border-t border-[#494454] py-2" />

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-[#CBC3D7] text-sm font-medium font-poppins tracking-tight">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#958EA0]">
                    <MailIcon />
                  </span>
                  <input type="email" placeholder="name@company.com" required className={inputBase} />
                </div>
              </div>

              {activeTab === "login" ? (
                /* Login: single password field */
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[#CBC3D7] text-sm font-medium font-poppins tracking-tight">Password</label>
                    <Link to="/forgot-password" className="text-[#D0BCFF] text-xs font-semibold font-poppins tracking-wide">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#958EA0]">
                      <LockIcon />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
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
              ) : (
                /* Signup: new password + confirm password */
                <>
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
                        value={passwordValue}
                        onChange={(e) => setPasswordValue(e.target.value)}
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
                </>
              )}

              {passwordError && (
                <p className="text-red-400 text-sm font-poppins -mt-2">{passwordError}</p>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-[#D0BCFF] rounded-lg text-[#0B1326] text-base font-medium font-afacad tracking-tight shadow-lg hover:bg-[#CBC3D7] transition-colors"
              >
                {activeTab === "login" ? "Confirm" : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}