import { formatLongDate, formatTime } from "./dateUtils";
import { Plus, Trash } from "./icons";

export default function DayAgenda({ date, events, onAdd, onDelete, className = "" }) {
  const count = events.length;

  return (
    <section
      aria-label="Events for selected day"
      className={`bg-slate-800/70 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-700/50 backdrop-blur-[6px] p-4 md:p-5 flex flex-col gap-3 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-indigo-100 text-base font-semibold font-['K2D'] truncate">
            {formatLongDate(date)}
          </h2>
          <p className="text-zinc-400 text-xs font-['K2D']">
            {count === 0 ? "No events" : `${count} ${count === 1 ? "event" : "events"}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="hidden md:inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-purple-300 text-violet-900 text-xs font-bold font-['K2D'] hover:bg-purple-200 transition-colors"
        >
          <Plus /> Add event
        </button>
      </div>

      {count === 0 ? (
        <p className="text-zinc-500 text-sm font-['K2D'] py-4 text-center">
          Nothing scheduled. Add an event for this day.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {events.map((e) => (
            <li
              key={e.id}
              className="flex items-center gap-3 rounded-lg bg-slate-900/50 pl-3 pr-1 py-1"
            >
              <span className="w-[4.5rem] shrink-0 text-purple-300 text-sm font-semibold font-['K2D'] tabular-nums">
                {formatTime(e.time)}
              </span>
              <span className="flex-1 min-w-0 truncate text-indigo-100 text-sm font-['K2D']">
                {e.title}
              </span>
              <button
                type="button"
                onClick={() => onDelete(e)}
                aria-label={`Delete ${e.title}`}
                className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-400 hover:bg-slate-700/50 transition-colors"
              >
                <Trash />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}