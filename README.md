# Oppra waitlist

A responsive Oppra landing page built with the project's Next.js App Router, React, TypeScript, and existing Geist font. It uses the supplied assets in `public/` without altering them. No additional runtime dependencies are required.

## Run locally

```bash
pnpm dev
```

Open http://localhost:3000. Navigation and FAQs work without client JavaScript; the waitlist form uses client-side validation and a server-side endpoint.

## Connect your Google Sheet

The flow is **landing page → /api/waitlist → Google Apps Script → Google Sheet**. The Next.js endpoint keeps the shared secret and webhook URL out of the browser.

1. Create a blank Google Sheet and name it **Oppra Waitlist**. Keep its sharing private.
2. In the Sheet, open **Extensions → Apps Script**.
3. Replace the starter code with the contents of [scripts/google-sheets-waitlist.gs](scripts/google-sheets-waitlist.gs), then save.
4. Open **Project Settings → Script properties** and add:
   - `SPREADSHEET_ID`: the part of the Sheet URL between `/d/` and `/edit`.
   - `WEBHOOK_SECRET`: a long random secret. Generate one locally with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Keep it private.
5. Select **Deploy → New deployment → Web app**. Set **Execute as: Me** and **Who has access: Anyone**. Authorize your script, then copy the Web app URL ending in `/exec`. If your Workspace account does not allow public web apps, your administrator must enable this deployment option.
6. Copy `.env.example` to `.env.local` and set:
   ```dotenv
   GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   GOOGLE_SHEETS_WEBHOOK_SECRET=the-same-secret-from-step-4
   ```
7. Restart `pnpm dev`. Submit a test entry through the form. The script creates a **Waitlist** tab with timestamp, name, email, phone, country, and use-case columns. Confirm that the row is present.
8. Add these same two environment variables to your hosting provider and redeploy when publishing.

Deploying the Apps Script endpoint for **Anyone** does not make the spreadsheet public. Requests must also contain the private shared secret. Do not put the secret in a `NEXT_PUBLIC_` variable, source control, or a chat message.

After changing Apps Script code, use **Deploy → Manage deployments → Edit → New version → Deploy** so the existing URL serves the updated code. The editor's Run button does not supply the HTTP event required by `doPost`; test through the website.

Google documents [web app deployments](https://developers.google.com/apps-script/guides/web) and [Content Service redirects](https://developers.google.com/apps-script/guides/content). The server follows Google's redirect and waits for an explicit successful JSON response before displaying confirmation.

## Submission behavior

- Required: full name, email address, and country. Phone number and intended use are optional.
- Input is validated on the client and server; no visitor details are logged.
- A hidden honeypot rejects simple automated submissions. Cross-origin browser submissions are rejected.
- Duplicate email addresses are accepted without creating another row. Retries preserve the original entry; submitting again does not overwrite it.
- Google Apps Script serializes writes with a lock and escapes spreadsheet formulas.
- Missing configuration returns HTTP 503. Google failures or timeouts return HTTP 502; the form preserves input and offers a retry. An unavailable integration never produces a success message.
- This needs a Next.js server deployment, not a static-only export. Google Apps Script quotas apply. Before a high-traffic public campaign, configure rate limiting on `/api/waitlist` at your hosting provider; the honeypot is only basic spam protection.
- Actual Google authorization, deployment, quotas, and row creation must be verified with your own Sheet.

## Checks

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm build
```

Tests use Node's built-in test runner and the existing TypeScript compiler. Google responses are mocked; no live signups are created by tests.
