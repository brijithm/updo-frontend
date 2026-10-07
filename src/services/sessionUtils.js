export function logout() {
  localStorage.clear();
  sessionStorage.clear();
  window.location.replace("/"); // full reload -> landing page
}