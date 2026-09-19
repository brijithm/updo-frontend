import DayAgenda from "./DayAgenda";
import {
  WEEKDAYS,
  HOURS,
  pad,
  dateKey,
  parseKey,
  sameDay,
  formatHourLabel,
} from "./dateUtils";

const card =
  "w-full bg-slate-800/70 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-700/50 backdrop-blur-[6px] overflow-hidden";

export default function WeekView({
  weekDates,
  events,
  today,
  selectedKey,
  onSelectDate,
  onAdd,
  onRequestDelete,
}) {
  const selectedEvents = events[selectedKey] || [];

  return (
    <>
      {/* Mobile: day strip + agenda */}
      <div className="md:hidden flex flex-col gap-4">
        <div className={`${card} grid grid-cols-7 gap-1 p-2`}>
          {weekDates.map((d) => {
            const key = dateKey(d);
            const isToday = sameDay(d, today);
            const isSelected = key === selectedKey;
            const count = (events[key] || []).length;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectDate(d)}
                className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400 ${
                  isSelected ? "bg-purple-500/20" : "hover:bg-slate-700/30"
                }`}
              >
                <span className="text-zinc-400 text-[10px] font-semibold font-['K2D']">
                  {WEEKDAYS[d.getDay()]}
                </span>
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-['K2D'] ${
                    isToday
                      ? "bg-purple-500 text-white font-semibold"
                      : isSelected
                      ? "text-white font-semibold"
                      : "text-indigo-100"
                  }`}
                >
                  {d.getDate()}
                </span>
                <span
                  aria-hidden="true"
                  className={`w-1 h-1 rounded-full ${count > 0 ? "bg-purple-400" : "bg-transparent"}`}
                />
              </button>
            );
          })}
        </div>
        <DayAgenda
          date={parseKey(selectedKey)}
          events={selectedEvents}
          onAdd={() => onAdd(selectedKey)}
          onDelete={(e) => onRequestDelete(selectedKey, e)}
        />
      </div>

      {/* Tablet / desktop: hour grid */}
      <div className={`hidden md:block ${card}`}>
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-700/50">
          <div />
          {weekDates.map((d) => (
            <div key={d.toISOString()} className="py-2 text-center border-l border-slate-700/50">
              <div className="text-zinc-400 text-[10px] font-semibold font-['K2D'] tracking-wide">
                {WEEKDAYS[d.getDay()]}
              </div>
              <div
                className={`mx-auto mt-0.5 text-xs font-['K2D'] ${
                  sameDay(d, today)
                    ? "inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500 text-white font-semibold"
                    : "text-indigo-100"
                }`}
              >
                {d.getDate()}
              </div>
            </div>
          ))}
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {HOURS.map((h) => (
            <div key={h} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-700/50">
              <div className="px-2 py-2 text-right text-zinc-500 text-[10px] font-['K2D']">
                {formatHourLabel(h)}
              </div>
              {weekDates.map((d) => {
                const key = dateKey(d);
                const hourEvents = (events[key] || []).filter((e) => parseInt(e.time, 10) === h);
                return (
                  <div
                    key={key + h}
                    onClick={() => onAdd(key, `${pad(h)}:00`)}
                    className={`min-h-[44px] border-l border-slate-700/50 p-1 hover:bg-slate-700/20 cursor-pointer transition-colors ${
                      sameDay(d, today) ? "bg-purple-500/5" : ""
                    }`}
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
                        className="block w-full text-left text-[10px] font-['K2D'] text-white bg-purple-500/80 hover:bg-purple-500 rounded px-1 py-0.5 mb-0.5 truncate transition-colors"
                      >
                        {e.title}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}