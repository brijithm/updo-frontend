import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

// Map common email domains to their webmail inbox URL.
// Falls back to Gmail's login page if the domain isn't recognized or the
// email wasn't passed through navigation state.
const WEBMAIL_URLS = {
  "gmail.com": "https://mail.google.com/mail/u/0/#inbox",
  "googlemail.com": "https://mail.google.com/mail/u/0/#inbox",
  "outlook.com": "https://outlook.live.com/mail/0/inbox",
  "hotmail.com": "https://outlook.live.com/mail/0/inbox",
  "live.com": "https://outlook.live.com/mail/0/inbox",
  "msn.com": "https://outlook.live.com/mail/0/inbox",
  "yahoo.com": "https://mail.yahoo.com",
  "yahoo.co.in": "https://mail.yahoo.com",
  "icloud.com": "https://www.icloud.com/mail",
  "me.com": "https://www.icloud.com/mail",
  "protonmail.com": "https://mail.proton.me",
  "proton.me": "https://mail.proton.me",
  "zoho.com": "https://mail.zoho.com",
  "aol.com": "https://mail.aol.com",
};

const DEFAULT_WEBMAIL_URL = "https://mail.google.com";

function getWebmailUrl(email) {
  const domain = email?.split("@")[1]?.toLowerCase().trim();
  return (domain && WEBMAIL_URLS[domain]) || DEFAULT_WEBMAIL_URL;
}

export default function CheckYourEmail() {
  const location = useLocation();
  const email = location.state?.email;
  const webmailUrl = getWebmailUrl(email);

  return (
    <div className="w-full min-h-screen bg-[#060E20] flex items-center justify-center">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .verify-fade { animation: fadeIn 0.5s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
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
            <div className="verify-fade flex flex-col items-center gap-6">
              <div
                className="w-16 h-16 rounded-full bg-[#D0BCFF]/10 flex items-center justify-center"
                aria-hidden="true"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3 6.5C3 5.67157 3.67157 5 4.5 5H19.5C20.3284 5 21 5.67157 21 6.5V17.5C21 18.3284 20.3284 19 19.5 19H4.5C3.67157 19 3 18.3284 3 17.5V6.5Z"
                    stroke="#D0BCFF"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M4 7L12 13L20 7"
                    stroke="#D0BCFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h2 className="text-white text-2xl font-semibold font-poppins">
                Verification Link Sent!
              </h2>
              <p className="font-poppins text-[#F5F7FA]/60 text-sm max-w-xs">
                We've sent a verification link to your email. Please check your inbox (and spam folder) to activate your account.
              </p>

              <a
                href={webmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-[#D0BCFF] rounded-lg text-[#0B1326] text-base font-medium font-afacad tracking-tight shadow-lg hover:bg-[#CBC3D7] transition-colors text-center"
              >
                Open Mail
              </a>

              <Link
                to="/login"
                className="font-poppins text-[#F5F7FA]/50 text-sm hover:text-[#F5F7FA]/80 transition-colors"
              >
                Back to Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}