import { WEEKDAYS, dateKey, sameDay, formatLongDate, formatTime } from "./dateUtils";

export default function MonthView({ cells, events, today, selectedKey, onSelectDate }) {
  return (
    <div className="w-full bg-slate-800/70 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-700/50 backdrop-blur-[6px] overflow-hidden">
      <div className="grid grid-cols-7 border-b border-slate-700/50">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            aria-label={wd}
            className="py-2.5 md:py-3 text-center text-zinc-400 text-[10px] md:text-[11px] font-semibold font-['K2D'] tracking-wide"
          >
            <span className="md:hidden">{wd[0]}</span>
            <span className="hidden md:inline">{wd}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          const key = dateKey(cell.date);
          const dayEvents = events[key] || [];
          const isToday = sameDay(cell.date, today);
          const isSelected = key === selectedKey;

          return (
            <button
              key={i}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${formatLongDate(cell.date, true)}, ${dayEvents.length} ${
                dayEvents.length === 1 ? "event" : "events"
              }`}
              onClick={() => onSelectDate(cell.date)}
              className={`h-[52px] md:h-28 p-1 md:p-2 flex flex-col items-center md:items-stretch gap-1 text-left overflow-hidden border-b border-r border-slate-700/50 [&:nth-child(7n)]:border-r-0 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-purple-400 ${
                isSelected ? "bg-purple-500/10" : "hover:bg-slate-700/20"
              } ${cell.current ? "" : "opacity-40"}`}
            >
              <span
                className={`md:self-start inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-['K2D'] ${
                  isToday
                    ? "bg-purple-500 text-white font-semibold"
                    : isSelected
                    ? "outline outline-1 outline-purple-400 text-white font-semibold"
                    : "text-indigo-100"
                }`}
              >
                {cell.date.getDate()}
              </span>

              {/* Mobile: dots only */}
              {dayEvents.length > 0 && (
                <span className="md:hidden flex gap-0.5" aria-hidden="true">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span key={e.id} className="w-1 h-1 rounded-full bg-purple-400" />
                  ))}
                </span>
              )}

              {/* Desktop: event chips */}
              <span className="hidden md:flex flex-col gap-0.5 w-full min-w-0">
                {dayEvents.slice(0, 2).map((e) => (
                  <span
                    key={e.id}
                    className="truncate text-[10px] font-['K2D'] text-white bg-purple-500/70 rounded px-1.5 py-0.5"
                  >
                    {formatTime(e.time)} {e.title}
                  </span>
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-[10px] font-['K2D'] text-zinc-400 px-1">
                    +{dayEvents.length - 2} more
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}