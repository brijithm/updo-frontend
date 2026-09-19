import ModalShell from "./ModalShell";
import { Close } from "./icons";
import { formatLongDate, parseKey } from "./dateUtils";

const input =
  "w-full h-11 sm:h-10 px-3 rounded-lg bg-slate-900/60 outline outline-1 outline-slate-700/50 text-indigo-100 text-base sm:text-sm font-['K2D'] focus:outline-purple-400 [color-scheme:dark]";

export default function EventSheet({
  dateKey,
  title,
  time,
  onTitleChange,
  onTimeChange,
  error,
  saving,
  onSave,
  onClose,
}) {
  const canSave = !saving && title.trim() && time;

  return (
    <ModalShell label="New event" onClose={onClose}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-indigo-100 text-lg font-semibold font-['K2D']">New event</h2>
          <p className="text-zinc-400 text-xs font-['K2D']">
            {formatLongDate(parseKey(dateKey), true)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="w-9 h-9 -mr-2 -mt-1 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-slate-700/50 transition-colors"
        >
          <Close />
        </button>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-zinc-300 text-xs font-['K2D']">Title</span>
        <input
          autoFocus
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canSave) onSave();
          }}
          placeholder="Event title"
          className={input}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-zinc-300 text-xs font-['K2D']">Time</span>
        <input
          type="time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          className={input}
        />
      </label>

      {error && (
        <p role="alert" className="text-red-400 text-xs font-['K2D']">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onSave}
        disabled={!canSave}
        className="w-full h-12 sm:h-11 bg-purple-300 rounded-lg text-violet-900 text-base font-bold font-['K2D'] transition-all hover:bg-purple-200 disabled:opacity-40 disabled:pointer-events-none"
      >
        {saving ? "Saving..." : "Add event"}
      </button>
    </ModalShell>
  );
}