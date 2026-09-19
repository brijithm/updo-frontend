import ModalShell from "./ModalShell";
import { formatLongDate, formatTime, parseKey } from "./dateUtils";

export default function DeleteConfirm({ pending, onCancel, onConfirm }) {
  return (
    <ModalShell label="Delete event" onClose={onCancel}>
      <div>
        <h2 className="text-indigo-100 text-lg font-semibold font-['K2D']">Delete this event?</h2>
        <p className="text-zinc-400 text-sm font-['K2D'] mt-2 break-words">
          <span className="text-indigo-100">{pending.title}</span> on{" "}
          {formatLongDate(parseKey(pending.key))} at {formatTime(pending.time)} will be removed.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-12 sm:h-11 rounded-lg bg-slate-700/60 text-zinc-200 text-base font-semibold font-['K2D'] hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 h-12 sm:h-11 rounded-lg bg-red-500 text-white text-base font-bold font-['K2D'] hover:bg-red-400 transition-colors"
        >
          Delete
        </button>
      </div>
    </ModalShell>
  );
}