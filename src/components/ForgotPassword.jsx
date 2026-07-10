import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { forgotPassword } from "../services/authService";

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 6-10 7L2 6" />
  </svg>
);

const inputBase =
  "w-full pl-11 pr-4 py-4 bg-[#0B1326] rounded-lg outline outline-1 outline-offset-[-1px] outline-[#494454] text-[#F5F7FA] placeholder:text-[#958EA0] text-base font-poppins focus:outline-[#D0BCFF]";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
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
              <h2 className="text-white text-3xl font-semibold">Forgot Password</h2>
              <p className="text-[#F5F7FA] text-base font-bold font-poppins">
                Please enter your mail address.
              </p>
            </div>

            {submitted ? (
              <div className="flex flex-col gap-4">
                <p className="text-[#CBC3D7] text-sm font-poppins">
                  If an account exists for <span className="text-[#F5F7FA] font-semibold">{email}</span>, a reset link is on its way.
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
                  <label className="text-[#CBC3D7] text-sm font-medium font-poppins tracking-tight">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#958EA0]">
                      <MailIcon />
                    </span>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputBase}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-red-400 text-sm font-poppins -mt-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#D0BCFF] rounded-lg text-[#0B1326] text-base font-medium font-afacad tracking-tight shadow-lg hover:bg-[#CBC3D7] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Please wait..." : "Confirm"}
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