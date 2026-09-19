import { useState, useMemo, useEffect } from "react";
import Navbar from "../Navbar";
import { getMyEvents, createEvent, deleteEvent } from "../../services/schedulerService";
import SchedulerToolbar from "./SchedulerToolbar";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./DayView";
import DayAgenda from "./DayAgenda";
import EventSheet from "./EventSheet";
import DeleteConfirm from "./DeleteConfirm";
import { Plus } from "./icons";
import {
  pad,
  dateKey,
  buildMonthGrid,
  getWeekDates,
  shiftMonth,
} from "./dateUtils";

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

  const [pendingDelete, setPendingDelete] = useState(null); // { key, id, title, time } | null

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

  // The selected day is always the day the view is anchored on.
  const selectedKey = dateKey(viewDate);
  const selectedEvents = events[selectedKey] || [];

  const monthLabel = viewDate.toLocaleString("default", { month: "long", year: "numeric" });
  const monthCells = useMemo(
    () => buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  );
  const weekDates = useMemo(() => getWeekDates(viewDate), [viewDate]);

  function goPrev() {
    setViewDate((d) => {
      if (view === "Month") return shiftMonth(d, -1);
      const nd = new Date(d);
      nd.setDate(nd.getDate() - (view === "Week" ? 7 : 1));
      return nd;
    });
  }
  function goNext() {
    setViewDate((d) => {
      if (view === "Month") return shiftMonth(d, 1);
      const nd = new Date(d);
      nd.setDate(nd.getDate() + (view === "Week" ? 7 : 1));
      return nd;
    });
  }
  function goToday() {
    setViewDate(new Date());
  }
  function selectDate(d) {
    setViewDate(new Date(d));
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

  function requestDelete(key, event) {
    setPendingDelete({ key, id: event.id, title: event.title, time: event.time });
  }
  function confirmDelete() {
    if (!pendingDelete) return;
    const { key, id } = pendingDelete;
    setPendingDelete(null);
    removeEvent(key, id);
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-28 md:pb-20 flex flex-col gap-5 md:gap-6">
        <SchedulerToolbar
          view={view}
          onViewChange={setView}
          rangeLabel={rangeLabel}
          onPrev={goPrev}
          onNext={goNext}
          onToday={goToday}
        />

        {error && (
          <p role="alert" className="text-red-400 text-xs font-['K2D']">
            {error}
          </p>
        )}

        {loading && (
          <div
            aria-busy="true"
            aria-label="Loading your schedule"
            className="h-80 rounded-xl bg-slate-800/50 animate-pulse"
          />
        )}

        {!loading && view === "Month" && (
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <MonthView
              cells={monthCells}
              events={events}
              today={today}
              selectedKey={selectedKey}
              onSelectDate={selectDate}
            />
            <DayAgenda
              date={viewDate}
              events={selectedEvents}
              onAdd={() => openAddEvent(selectedKey)}
              onDelete={(e) => requestDelete(selectedKey, e)}
            />
          </div>
        )}

        {!loading && view === "Week" && (
          <WeekView
            weekDates={weekDates}
            events={events}
            today={today}
            selectedKey={selectedKey}
            onSelectDate={selectDate}
            onAdd={openAddEvent}
            onRequestDelete={requestDelete}
          />
        )}

        {!loading && view === "Day" && (
          <DayView
            viewDate={viewDate}
            events={events}
            onAdd={openAddEvent}
            onRequestDelete={requestDelete}
          />
        )}
      </main>

      {/* Mobile quick-add */}
      {!loading && (
        <button
          type="button"
          onClick={() => openAddEvent(selectedKey)}
          className="md:hidden fixed right-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-40 h-12 pl-4 pr-5 inline-flex items-center gap-2 rounded-full bg-purple-300 text-violet-900 text-sm font-bold font-['K2D'] shadow-lg shadow-black/40 active:bg-purple-200"
        >
          <Plus /> Schedule
        </button>
      )}

      {modal && (
        <EventSheet
          dateKey={modal.key}
          title={formTitle}
          time={formTime}
          onTitleChange={setFormTitle}
          onTimeChange={setFormTime}
          error={formError}
          saving={saving}
          onSave={saveEvent}
          onClose={() => setModal(null)}
        />
      )}

      {pendingDelete && (
        <DeleteConfirm
          pending={pendingDelete}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}