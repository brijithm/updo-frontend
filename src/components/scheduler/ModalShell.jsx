import { useEffect, useRef } from "react";

// Bottom sheet on mobile, centered dialog from sm: up.
export default function ModalShell({ label, onClose, children }) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="w-full sm:max-w-sm max-h-[90dvh] overflow-y-auto bg-slate-800 outline outline-1 outline-slate-700/50 rounded-t-2xl sm:rounded-2xl px-5 pt-3 sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-6 flex flex-col gap-4"
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-slate-600 sm:hidden" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}