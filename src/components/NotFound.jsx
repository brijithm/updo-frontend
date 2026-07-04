import { useNavigate } from "react-router-dom";

// ---------------------------------------------------------------------------
// Global 404 / not-found page. Wired as the catch-all route ("*") in
// App.jsx, so it shows for any URL that doesn't match a real route.
// ---------------------------------------------------------------------------

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-white text-[clamp(6rem,25vw,20rem)] font-bold font-['Inter'] leading-none">
        404
      </h1>
      <p className="text-purple-300/90 text-2xl md:text-3xl font-bold font-['Arial']">
        NOT FOUND
      </p>

      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="mt-4 px-9 h-14 bg-purple-300 rounded-full shadow-[0px_10px_15px_-3px_rgba(208,188,255,0.20)] text-violet-900 text-base font-normal font-['Poppins'] hover:bg-purple-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        Go to Dashboard
      </button>
    </div>
  );
}