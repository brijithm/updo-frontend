// Shared by campaignService.js and brandService.js.
// Any field the user left blank should reach the backend as `null`, not "".
// Works one level deep, including nested objects like socialLinks / colors.
export function emptyToNull(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      result[key] = emptyToNull(value);
    } else if (value === "" || value === undefined) {
      result[key] = null;
    } else {
      result[key] = value;
    }
  }
  return result;
}
// Downloads an image from a backend-hosted URL straight to the user's device.
// Fetches as a blob first so it saves as a file instead of just opening in
// a new tab (which is what a plain <a href> would do for cross-origin URLs).
export async function downloadImageFromUrl(url, filename = "updo-campaign-poster.png") {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch image for download");
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}