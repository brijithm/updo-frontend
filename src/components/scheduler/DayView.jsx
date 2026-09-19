import { HOURS, pad, dateKey, formatHourLabel, formatTime } from "./dateUtils";

export default function DayView({ viewDate, events, onAdd, onRequestDelete }) {
  const key = dateKey(viewDate);

  return (
    <div className="w-full bg-slate-800/70 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-700/50 backdrop-blur-[6px] overflow-hidden">
      <div className="max-h-[70dvh] md:max-h-[560px] overflow-y-auto">
        {HOURS.map((h) => {
          const hourEvents = (events[key] || []).filter((e) => parseInt(e.time, 10) === h);
          return (
            <div
              key={h}
              className="grid grid-cols-[56px_1fr] md:grid-cols-[70px_1fr] border-b border-slate-700/50"
            >
              <div className="px-2 py-3 text-right text-zinc-500 text-[10px] font-['K2D']">
                {formatHourLabel(h)}
              </div>
              <div
                onClick={() => onAdd(key, `${pad(h)}:00`)}
                className="min-h-[52px] md:min-h-[48px] border-l border-slate-700/50 p-1.5 hover:bg-slate-700/20 cursor-pointer transition-colors"
              >
                {hourEvents.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onRequestDelete(key, e);
                    }}
                    title="Click to delete"
                    className="block max-w-full truncate text-left text-xs font-['K2D'] text-white bg-purple-500/80 hover:bg-purple-500 rounded px-2 py-1.5 mb-1 transition-colors"
                  >
                    <span className="font-semibold tabular-nums">{formatTime(e.time)}</span>{" "}
                    {e.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}