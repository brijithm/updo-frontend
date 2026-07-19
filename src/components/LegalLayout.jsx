import { Link, useLocation } from "react-router-dom";

// Shared shell for all legal pages (Privacy Policy, Terms & Conditions, Refund Policy).
// Drop this alongside your existing Navbar-style dark theme. Adjust font-family
// values below if your tailwind.config already maps these to utility classes
// (e.g. font-unbounded / font-poppins) — swap the inline styles for those classes.

const LEGAL_LINKS = [
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Refund & Cancellation", to: "/refund-policy" },
];

export default function LegalLayout({ title, updated, children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e6e6ec] relative overflow-hidden">
      {/* ambient glow, subtle not neon */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="relative max-w-3xl mx-auto px-6 py-16">
        {/* back to app */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors mb-10"
        >
          ← Back to UPDO AI
        </Link>

        {/* header */}
        <header className="mb-10 border-b border-white/10 pb-8">
          <h1
            style={{ fontFamily: "'Unbounded', sans-serif" }}
            className="text-3xl md:text-4xl font-semibold tracking-tight mb-3"
          >
            {title}
          </h1>
          {updated && (
            <p style={{ fontFamily: "'Poppins', sans-serif" }} className="text-sm text-white/40">
              Last updated: {updated}
            </p>
          )}
        </header>

        {/* cross-links between the three legal docs */}
        <nav className="flex flex-wrap gap-2 mb-12">
          {LEGAL_LINKS.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{ fontFamily: "'Poppins', sans-serif" }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? "bg-indigo-500/15 border-indigo-400/40 text-indigo-200"
                    : "border-white/10 text-white/50 hover:border-white/25 hover:text-white/80"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* body content, supplied by each page */}
        <div
          style={{ fontFamily: "'Poppins', sans-serif" }}
          className="prose-legal text-[15px] leading-relaxed text-white/70 space-y-8"
        >
          {children}
        </div>

        <footer className="mt-16 pt-8 border-t border-white/10 text-sm text-white/40">
          <p style={{ fontFamily: "'Poppins', sans-serif" }}>
            Questions? Email us at{" "}
            <a href="mailto:support@updoai.in" className="text-indigo-300 hover:text-indigo-200 underline underline-offset-2">
              support@updoai.in
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

// Reusable section building block so each page's content stays clean and consistent
export function Section({ heading, children }) {
  return (
    <section>
      <h2
        style={{ fontFamily: "'Unbounded', sans-serif" }}
        className="text-lg font-medium text-white/90 mb-3"
      >
        {heading}
      </h2>
      <div className="space-y-3 text-white/65">{children}</div>
    </section>
  );
}