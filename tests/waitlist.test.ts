import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { afterEach, test } from "node:test";
import { POST } from "../app/api/waitlist/route";
import { validateWaitlist } from "../app/_lib/waitlist";
import { saveWaitlistEntry } from "../app/_lib/waitlist-service";

const valid = { fullName: "Ada Okafor", email: "ada@example.com", phone: "", industry: "Construction", useCase: "" };
const originalFetch = globalThis.fetch;
const originalUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
const originalSecret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalUrl === undefined) delete process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  else process.env.GOOGLE_SHEETS_WEBHOOK_URL = originalUrl;
  if (originalSecret === undefined) delete process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;
  else process.env.GOOGLE_SHEETS_WEBHOOK_SECRET = originalSecret;
});

function configure() {
  process.env.GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/test-deployment/exec";
  process.env.GOOGLE_SHEETS_WEBHOOK_SECRET = "test-only-secret";
}
function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://oppra.example/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

test("normalizes name and email while accepting omitted optional fields", () => {
  const result = validateWaitlist({ fullName: "  Ada Okafor ", email: " ADA@EXAMPLE.COM ", industry: " Construction " });
  assert.equal(result.success, true);
  if (result.success) assert.deepEqual(result.data, valid);
});

test("rejects missing fields, malformed email, and invalid industry", () => {
  for (const input of [null, [], {}, { ...valid, email: "ada@invalid", industry: "Unknown industry", fullName: " " }]) {
    const result = validateWaitlist(input);
    assert.equal(result.success, false);
    if (!result.success) assert.deepEqual(Object.keys(result.errors), ["fullName", "email", "industry"]);
  }
});

test("validates optional phone, non-text input, and field lengths", () => {
  assert.equal(validateWaitlist({ ...valid, phone: "+234 (800) 123-4567" }).success, true);
  for (const change of [{ phone: "123" }, { phone: "1234567890123456" }, { phone: "not a phone" }, { phone: {} }, { useCase: {} }, { useCase: "a".repeat(1001) }, { fullName: "a".repeat(101) }]) {
    assert.equal(validateWaitlist({ ...valid, ...change }).success, false);
  }
});

test("rejects cross-origin requests before contacting Google", async () => {
  assert.equal((await POST(request(valid, { origin: "https://another.example" }))).status, 403);
});

test("rejects unsupported content types and malformed JSON", async () => {
  assert.equal((await POST(request(valid, { "Content-Type": "text/plain" }))).status, 415);
  const malformed = new Request("https://oppra.example/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" });
  assert.equal((await POST(malformed)).status, 400);
});

test("rejects oversized bodies with and without a content-length header", async () => {
  assert.equal((await POST(request(valid, { "Content-Length": "9000" }))).status, 413);
  assert.equal((await POST(request({ ...valid, useCase: "a".repeat(9000) }))).status, 413);
});

test("rejects invalid inputs and honeypot submissions", async () => {
  assert.equal((await POST(request({ ...valid, industry: "" }))).status, 400);
  assert.equal((await POST(request({ ...valid, website: "spam" }))).status, 400);
});

test("reports unavailable configuration without a false success", async () => {
  delete process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  delete process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;
  const response = await POST(request(valid));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).success, false);
});

test("rejects webhook destinations outside Google Apps Script", async () => {
  configure();
  for (const url of ["http://script.google.com/macros/s/test/exec", "https://example.com/exec", "https://script.google.com/macros/s/test/dev", "https://script.google.com/macros/s/test/exec?redirect=other"]) {
    process.env.GOOGLE_SHEETS_WEBHOOK_URL = url;
    assert.deepEqual(await saveWaitlistEntry(valid), { success: false, status: 503 });
  }
});

test("forwards normalized data and private secret; returns only a confirmation", async () => {
  configure();
  let called = false;
  globalThis.fetch = async (url, options) => {
    called = true;
    assert.equal(String(url), process.env.GOOGLE_SHEETS_WEBHOOK_URL);
    assert.equal(options?.redirect, "follow");
    assert.equal(options?.cache, "no-store");
    const body = JSON.parse(String(options?.body));
    assert.deepEqual(body, { ...valid, secret: "test-only-secret" });
    return Response.json({ success: true });
  };
  const response = await POST(request({ ...valid, email: " ADA@EXAMPLE.COM ", website: "" }, { origin: "https://oppra.example" }));
  assert.equal(called, true);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
});

test("does not claim success for Google errors, HTML, or unsuccessful JSON", async () => {
  configure();
  for (const response of [new Response("Unavailable", { status: 500 }), new Response("<html>Sign in</html>"), Response.json({ success: false }), Response.json({ success: "true" })]) {
    globalThis.fetch = async () => response;
    assert.deepEqual(await saveWaitlistEntry(valid), { success: false, status: 502 });
  }
});

test("handles a Google network failure or timeout without exposing details", async () => {
  configure();
  globalThis.fetch = async () => { throw new Error("private upstream details"); };
  const response = await POST(request(valid));
  assert.equal(response.status, 502);
  const body = await response.text();
  assert.equal(body.includes("private"), false);
  assert.equal(body.includes("test-only-secret"), false);
});

function scriptHarness() {
  const rows: string[][] = [];
  let locked = false;
  let released = 0;
  const range = {
    setFontWeight: () => range,
    setBackground: () => range,
    createTextFinder: (email: string) => {
      const finder = {
        matchEntireCell: () => finder,
        matchCase: () => finder,
        useRegularExpression: () => finder,
        findNext: () => rows.slice(1).find((row) => row[2] === email) ?? null,
      };
      return finder;
    },
  };
  const sheet = {
    getLastRow: () => rows.length,
    appendRow: (row: string[]) => rows.push(Array.from(row)),
    setFrozenRows: () => undefined,
    getRange: () => range,
  };
  const context = {
    PropertiesService: { getScriptProperties: () => ({ getProperty: (key: string) => key === "WEBHOOK_SECRET" ? "test-only-secret" : "test-sheet" }) },
    ContentService: { MimeType: { JSON: "application/json" }, createTextOutput: (text: string) => ({ setMimeType: () => JSON.parse(text) }) },
    LockService: { getScriptLock: () => ({
      tryLock: () => { locked = true; return true; },
      hasLock: () => locked,
      releaseLock: () => { locked = false; released++; },
    }) },
    SpreadsheetApp: { openById: () => ({ getSheetByName: () => rows.length ? sheet : null, insertSheet: () => sheet }), flush: () => undefined },
  };
  const doPost = runInNewContext(
    readFileSync("scripts/google-sheets-waitlist.gs", "utf8") + "\ndoPost;",
    context,
  ) as (event: { postData: { contents: string } }) => { success: boolean };
  return {
    rows,
    released: () => released,
    submit: (details: Record<string, unknown>) => doPost({ postData: { contents: JSON.stringify(details) } }),
  };
}

test("Apps Script rejects unauthorized requests without creating rows", () => {
  const script = scriptHarness();
  assert.equal(script.submit({ ...valid, secret: "wrong" }).success, false);
  assert.equal(script.rows.length, 0);
});

test("Apps Script creates headers, saves a signup, and avoids duplicate rows", () => {
  const script = scriptHarness();
  const details = { ...valid, secret: "test-only-secret" };
  assert.equal(script.submit(details).success, true);
  assert.equal(script.rows.length, 2);
  assert.equal(script.rows[1][2], "ada@example.com");
  assert.equal(script.rows[1][4], "Construction");
  assert.equal(script.submit({ ...details, email: "ADA@EXAMPLE.COM" }).success, true);
  assert.equal(script.rows.length, 2);
  assert.equal(script.released(), 2);
});

test("Apps Script stores formula-like content as text and preserves international phone numbers", () => {
  const script = scriptHarness();
  assert.equal(script.submit({ ...valid, secret: "test-only-secret", fullName: "=1+1", phone: "+2348001234567", useCase: "@SUM(1,2)" }).success, true);
  assert.equal(script.rows[1][1], "'=1+1");
  assert.equal(script.rows[1][3], "'+2348001234567");
  assert.equal(script.rows[1][5], "'@SUM(1,2)");
});

test("Apps Script rejects bad field types without writing", () => {
  const script = scriptHarness();
  assert.equal(script.submit({ ...valid, secret: "test-only-secret", phone: {} }).success, false);
  assert.equal(script.rows.length, 0);
});
