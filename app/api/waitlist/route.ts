import { validateWaitlist } from "../../_lib/waitlist";
import { saveWaitlistEntry } from "../../_lib/waitlist-service";

const MAX_BODY_BYTES = 8192;

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ success: false, message: "Request not allowed." }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return Response.json({ success: false, message: "Expected JSON." }, { status: 415 });
  }
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
    return Response.json({ success: false, message: "Request too large." }, { status: 413 });
  }

  let input: unknown;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
      return Response.json({ success: false, message: "Request too large." }, { status: 413 });
    }
    input = JSON.parse(body);
  } catch {
    return Response.json({ success: false, message: "Invalid request." }, { status: 400 });
  }

  if (typeof input === "object" && input !== null && "website" in input && input.website) {
    return Response.json({ success: false, message: "Request not allowed." }, { status: 400 });
  }
  const result = validateWaitlist(input);
  if (!result.success) {
    return Response.json({ success: false, errors: result.errors }, { status: 400 });
  }

  const saved = await saveWaitlistEntry(result.data);
  if (!saved.success) {
    return Response.json({ success: false, message: "Unable to save your signup. Please try again later." }, { status: saved.status });
  }
  return Response.json({ success: true });
}
