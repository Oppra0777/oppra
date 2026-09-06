import { getCountries, type WaitlistDetails } from "./waitlist";

type SaveResult = { success: true } | { success: false; status: 502 | 503 };

export async function saveWaitlistEntry(details: WaitlistDetails): Promise<SaveResult> {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const secret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;
  if (!url || !secret) return { success: false, status: 503 };

  // Only send contact details and the shared secret to the configured Apps Script.
  let endpoint: URL;
  try {
    endpoint = new URL(url);
    if (endpoint.protocol !== "https:" || endpoint.hostname !== "script.google.com" || !/^\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(endpoint.pathname) || endpoint.search || endpoint.username || endpoint.password || endpoint.port) {
      return { success: false, status: 503 };
    }
  } catch {
    return { success: false, status: 503 };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...details,
        country: getCountries().find((country) => country.code === details.country)?.name ?? details.country,
        secret,
      }),
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return { success: false, status: 502 };

    const body: unknown = await response.json();
    if (typeof body !== "object" || body === null || !("success" in body) || body.success !== true) {
      return { success: false, status: 502 };
    }
    return { success: true };
  } catch {
    // Avoid logging the webhook URL, secret, or personal details.
    return { success: false, status: 502 };
  }
}
