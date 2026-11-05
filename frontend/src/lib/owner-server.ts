import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getApiBaseUrl, type OwnerOverviewData } from "./api";

/**
 * Loads owner dashboard data on the server with the visitor's session cookie.
 * Not signed in (401/403) -> redirect to /owner/login. Backend down -> null.
 */
export async function getOwnerOverviewForRequest(nextPath = "/owner"): Promise<OwnerOverviewData | null> {
  const jar = await cookies();
  const session = jar.get("sessionid")?.value;
  if (!session) redirect(`/owner/login?next=${encodeURIComponent(nextPath)}`);

  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}/owner/overview/`, {
      cache: "no-store",
      headers: { Cookie: `sessionid=${session}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    return null;
  }
  if (res.status === 401 || res.status === 403) {
    redirect(`/owner/login?next=${encodeURIComponent(nextPath)}`);
  }
  if (!res.ok) return null;
  const json = await res.json();
  return (json.data ?? json) as OwnerOverviewData;
}
