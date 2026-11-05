/**
 * fetch() for the owner portal. Sends the Django session cookie and the
 * CSRF token, and bounces to the login page if the session has expired.
 */
function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : "";
}

export async function ownerFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method || "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (method !== "GET" && method !== "HEAD") {
    headers.set("X-CSRFToken", readCookie("csrftoken"));
    if (!headers.has("Content-Type") && typeof init.body === "string") {
      headers.set("Content-Type", "application/json");
    }
  }
  const res = await fetch(input, { ...init, headers, credentials: "same-origin" });
  if (res.status === 401 && typeof window !== "undefined") {
    const next = encodeURIComponent(window.location.pathname);
    window.location.href = `/owner/login?next=${next}`;
  }
  return res;
}
