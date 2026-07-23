const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://updo-ai-backend-production.up.railway.app";

function authHeaders() {
  const token = localStorage.getItem("updo_access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getMyEvents() {
  const res = await fetch(`${API_BASE_URL}/scheduler/events`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load scheduled events");
  const data = await res.json();
  return data.events;
}

export async function createEvent(title, scheduledAtISO) {
  const res = await fetch(`${API_BASE_URL}/scheduler/events`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ title, scheduled_at: scheduledAtISO }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.detail || "Failed to create event");
  return data.event;
}

export async function deleteEvent(eventId) {
  const res = await fetch(`${API_BASE_URL}/scheduler/events/${eventId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete event");
  return res.json();
}