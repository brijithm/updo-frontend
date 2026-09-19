import { ChevronLeft, ChevronRight } from "./icons";

const VIEWS = ["Month", "Week", "Day"];

const pill =
  "bg-slate-800/70 outline outline-1 outline-slate-700/50 rounded-full";

export default function SchedulerToolbar({
  view,
  onViewChange,
  rangeLabel,
  onPrev,
  onNext,
  onToday,
}) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-indigo-100 text-2xl font-semibold font-['K2D'] leading-8">
          Scheduling Calendar
        </h1>
        <p className="text-zinc-400 text-sm font-['K2D'] mt-1" aria-live="polite">
          {rangeLabel}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className={`flex items-center p-1 gap-1 ${pill}`}>
          {VIEWS.map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => onViewChange(v)}
              className={`flex-1 sm:flex-none px-4 py-2 sm:px-3 sm:py-1.5 rounded-full text-sm sm:text-xs font-semibold font-['K2D'] transition-colors ${
                view === v ? "bg-purple-500 text-white" : "text-zinc-300 hover:text-white"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-2">
          <button
            type="button"
            onClick={onToday}
            className={`h-10 sm:h-8 px-4 sm:px-3 text-sm sm:text-xs font-semibold font-['K2D'] text-zinc-200 hover:text-white hover:bg-slate-700/60 transition-colors ${pill}`}
          >
            Today
          </button>
          <div className={`flex items-center p-1 gap-1 ${pill}`}>
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous"
              className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-zinc-300 hover:text-white hover:bg-slate-700/60 transition-colors"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Next"
              className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-zinc-300 hover:text-white hover:bg-slate-700/60 transition-colors"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}