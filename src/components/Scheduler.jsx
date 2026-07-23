import { useState, useMemo, useEffect } from "react";
import Navbar from "./Navbar";
import { getMyEvents, createEvent, deleteEvent } from "../services/schedulerService";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6:00 - 22:00

function pad(n) {
  return String(n).padStart(2, "0");
}
function dateKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function formatHourLabel(h) {
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12} ${period}`;
}
function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), current: true });
  }
  while (cells.length % 7 !== 0) {
    const next = cells.length - (startOffset + daysInMonth) + 1;
    cells.push({ date: new Date(year, month + 1, next), current: false });
  }
  return cells;
}
function getWeekDates(anchor) {
  const start = new Date(anchor);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

// Groups flat backend events into { "YYYY-MM-DD": [{ id, title, time }] }
function bucketEvents(rawEvents) {
  const buckets = {};
  for (const e of rawEvents) {
    const d = new Date(e.scheduled_at);
    const key = dateKey(d);
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push({ id: e.id, title: e.title, time });
  }
  for (const key in buckets) {
    buckets[key].sort((a, b) => a.time.localeCompare(b.time));
  }
  return buckets;
}

export default function Scheduler() {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(today);
  const [view, setView] = useState("Month"); // Month | Week | Day

  const [events, setEvents] = useState({}); // bucketed by date key
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState(null); // { key, defaultTime } | null
  const [formTitle, setFormTitle] = useState("");
  const [formTime, setFormTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const rawEvents = await getMyEvents();
        setEvents(bucketEvents(rawEvents));
      } catch (err) {
        setError(err.message || "Failed to load scheduled events");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const monthLabel = viewDate.toLocaleString("default", { month: "long", year: "numeric" });
  const monthCells = useMemo(
    () => buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  );
  const weekDates = useMemo(() => getWeekDates(viewDate), [viewDate]);

  function goPrev() {
    setViewDate((d) => {
      const nd = new Date(d);
      if (view === "Month") nd.setMonth(nd.getMonth() - 1);
      else if (view === "Week") nd.setDate(nd.getDate() - 7);
      else nd.setDate(nd.getDate() - 1);
      return nd;
    });
  }
  function goNext() {
    setViewDate((d) => {
      const nd = new Date(d);
      if (view === "Month") nd.setMonth(nd.getMonth() + 1);
      else if (view === "Week") nd.setDate(nd.getDate() + 7);
      else nd.setDate(nd.getDate() + 1);
      return nd;
    });
  }

  function openAddEvent(key, defaultTime = "") {
    setFormTitle("");
    setFormTime(defaultTime);
    setFormError("");
    setModal({ key, defaultTime });
  }

  async function saveEvent() {
    if (!formTitle.trim() || !formTime || !modal) {
      setFormError("Title and time are both required.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      // modal.key is "YYYY-MM-DD", formTime is "HH:MM" — combine into local Date, send as ISO (UTC)
      const [y, m, d] = modal.key.split("-").map(Number);
      const [h, min] = formTime.split(":").map(Number);
      const localDate = new Date(y, m - 1, d, h, min);
      const isoUtc = localDate.toISOString();

      const saved = await createEvent(formTitle.trim(), isoUtc);

      setEvents((prev) => {
        const existing = prev[modal.key] || [];
        return {
          ...prev,
          [modal.key]: [...existing, { id: saved.id, title: saved.title, time: formTime }].sort(
            (a, b) => a.time.localeCompare(b.time)
          ),
        };
      });
      setModal(null);
    } catch (err) {
      setFormError(err.message || "Failed to save event");
    } finally {
      setSaving(false);
    }
  }

  async function removeEvent(key, id) {
    const prevState = events;
    setEvents((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((e) => e.id !== id),
    }));
    try {
      await deleteEvent(id);
    } catch (err) {
      setEvents(prevState); // revert on failure
      setError(err.message || "Failed to delete event");
    }
  }

  const rangeLabel =
    view === "Month"
      ? monthLabel
      : view === "Week"
      ? `${weekDates[0].toLocaleDateString("default", { month: "short", day: "numeric" })} – ${weekDates[6].toLocaleDateString(
          "default",
          { month: "short", day: "numeric", year: "numeric" }
        )}`
      : viewDate.toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen w-full bg-slate-900">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-16 pb-20 flex flex-col gap-6">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-indigo-100 text-2xl font-semibold font-['K2D'] leading-8">
              Scheduling
            </h1>
            <h1 className="text-indigo-100 text-2xl font-semibold font-['K2D'] leading-8">
              Calendar
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800/70 outline outline-1 outline-slate-700/50 rounded-full p-1 gap-1">
              {["Month", "Week", "Day"].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold font-['K2D'] transition-colors ${
                    view === v ? "bg-purple-500 text-white" : "text-zinc-300 hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-slate-800/70 outline outline-1 outline-slate-700/50 rounded-full p-1 gap-1">
              <button
                onClick={goPrev}
                className="w-7 h-7 flex items-center justify-center rounded-full text-zinc-300 hover:text-white hover:bg-slate-700/60 transition-colors"
              >
                ‹
              </button>
              <button
                onClick={goNext}
                className="w-7 h-7 flex items-center justify-center rounded-full text-zinc-300 hover:text-white hover:bg-slate-700/60 transition-colors"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        <p className="text-zinc-400 text-sm font-['K2D'] -mt-2">{rangeLabel}</p>

        {error && (
          <p className="text-red-400 text-xs font-['K2D']">{error}</p>
        )}
        {loading && (
          <p className="text-zinc-400 text-sm font-['K2D']">Loading your schedule...</p>
        )}

        {!loading && view === "Month" && (
          <div className="w-full bg-slate-800/70 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-700/50 backdrop-blur-[6px] overflow-hidden">
            <div className="grid grid-cols-7 border-b border-slate-700/50">
              {WEEKDAYS.map((wd) => (
                <div key={wd} className="py-3 text-center text-zinc-400 text-[11px] font-semibold font-['K2D'] tracking-wide">
                  {wd}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthCells.map((cell, i) => {
                const key = dateKey(cell.date);
                const dayEvents = events[key] || [];
                return (
                  <div
                    key={i}
                    onClick={() => cell.current && openAddEvent(key)}
                    className={`h-24 p-2 border-b border-r border-slate-700/50 [&:nth-child(7n)]:border-r-0 transition-colors overflow-hidden ${
                      cell.current ? "hover:bg-slate-700/20 cursor-pointer" : "opacity-30"
                    }`}
                  >
                    <span
                      className={`text-xs font-['K2D'] ${
                        cell.current && sameDay(cell.date, today)
                          ? "inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500 text-white font-semibold"
                          : cell.current
                          ? "text-indigo-100"
                          : "text-zinc-500"
                      }`}
                    >
                      {cell.date.getDate()}
                    </span>
                    <div className="mt-1 flex flex-col gap-0.5">
                      {dayEvents.slice(0, 2).map((e) => (
                        <span
                          key={e.id}
                          className="truncate text-[10px] font-['K2D'] text-white bg-purple-500/70 rounded px-1 py-0.5"
                        >
                          {e.time} {e.title}
                        </span>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[10px] font-['K2D'] text-zinc-400">
                          +{dayEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && view === "Week" && (
          <div className="w-full bg-slate-800/70 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-700/50 backdrop-blur-[6px] overflow-hidden">
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
                    const hourEvents = (events[key] || []).filter(
                      (e) => parseInt(e.time, 10) === h
                    );
                    return (
                      <div
                        key={key + h}
                        onClick={() => openAddEvent(key, `${pad(h)}:00`)}
                        className="min-h-[44px] border-l border-slate-700/50 p-1 hover:bg-slate-700/20 cursor-pointer transition-colors"
                      >
                        {hourEvents.map((e) => (
                          <div
                            key={e.id}
                            onClick={(ev) => {
                              ev.stopPropagation();
                              removeEvent(key, e.id);
                            }}
                            title="Click to remove"
                            className="text-[10px] font-['K2D'] text-white bg-purple-500/80 rounded px-1 py-0.5 mb-0.5 truncate"
                          >
                            {e.title}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && view === "Day" && (
          <div className="w-full bg-slate-800/70 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-700/50 backdrop-blur-[6px] overflow-hidden">
            <div className="max-h-[560px] overflow-y-auto">
              {HOURS.map((h) => {
                const key = dateKey(viewDate);
                const hourEvents = (events[key] || []).filter((e) => parseInt(e.time, 10) === h);
                return (
                  <div key={h} className="grid grid-cols-[70px_1fr] border-b border-slate-700/50">
                    <div className="px-2 py-3 text-right text-zinc-500 text-[10px] font-['K2D']">
                      {formatHourLabel(h)}
                    </div>
                    <div
                      onClick={() => openAddEvent(key, `${pad(h)}:00`)}
                      className="min-h-[48px] border-l border-slate-700/50 p-1.5 hover:bg-slate-700/20 cursor-pointer transition-colors"
                    >
                      {hourEvents.map((e) => (
                        <div
                          key={e.id}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            removeEvent(key, e.id);
                          }}
                          title="Click to remove"
                          className="text-xs font-['K2D'] text-white bg-purple-500/80 rounded px-2 py-1 mb-1 inline-block"
                        >
                          {e.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-6 sm:pb-0">
          <div className="w-full max-w-sm bg-slate-800 rounded-2xl outline outline-1 outline-slate-700/50 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-indigo-100 text-lg font-semibold font-['K2D']">
                New Event
              </span>
              <button
                onClick={() => setModal(null)}
                className="text-zinc-400 hover:text-zinc-200 text-sm"
              >
                ✕
              </button>
            </div>
            <p className="text-zinc-400 text-xs font-['K2D']">{modal.key}</p>

            <input
              autoFocus
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Event title"
              className="w-full h-10 px-3 rounded-lg bg-slate-900/60 outline outline-1 outline-slate-700/50 text-indigo-100 text-sm font-['K2D'] focus:outline-purple-400"
            />
            <input
              type="time"
              value={formTime}
              onChange={(e) => setFormTime(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-900/60 outline outline-1 outline-slate-700/50 text-indigo-100 text-sm font-['K2D'] focus:outline-purple-400"
            />

            {formError && (
              <p className="text-red-400 text-xs font-['K2D']">{formError}</p>
            )}

            <button
              onClick={saveEvent}
              disabled={saving || !formTitle.trim() || !formTime}
              className="w-full h-11 bg-purple-300 rounded-lg text-violet-900 text-base font-bold font-['K2D'] transition-all hover:bg-purple-200 disabled:opacity-40 disabled:pointer-events-none"
            >
              {saving ? "Saving..." : "Add Event"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}