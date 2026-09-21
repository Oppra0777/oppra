"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { INDUSTRIES, validateWaitlist, type WaitlistErrors } from "../_lib/waitlist";
import { Icon } from "./icon";

type SubmissionState =
  | { status: "idle" | "submitting" }
  | { status: "error"; message: string }
  | { status: "success"; email: string };

export function WaitlistForm() {
  const [state, setState] = useState<SubmissionState>({ status: "idle" });
  const [errors, setErrors] = useState<WaitlistErrors>({});
  const successRef = useRef<HTMLDivElement>(null);
  const submissionLock = useRef(false);

  useEffect(() => {
    if (state.status === "success") successRef.current?.focus();
  }, [state.status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionLock.current) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const result = validateWaitlist(Object.fromEntries(formData));
    setState({ status: "idle" });

    if (!result.success) {
      setErrors(result.errors);
      const firstInvalid = Object.keys(result.errors)[0];
      const field = form.elements.namedItem(firstInvalid);
      if (field instanceof HTMLElement) field.focus();
      return;
    }

    setErrors({});
    submissionLock.current = true;
    setState({ status: "submitting" });

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result.data, website: formData.get("website") ?? "" }),
        signal: AbortSignal.timeout(25000),
      });
      const body: unknown = await response.json();

      if (response.ok && typeof body === "object" && body !== null && "success" in body && body.success === true) {
        setState({ status: "success", email: result.data.email });
      } else {
        setState({
          status: "error",
          message: response.status === 503
            ? "Signups are temporarily unavailable. Please try again a little later."
            : "We couldn't save your details just yet. Please try again.",
        });
      }
    } catch {
      setState({ status: "error", message: "We couldn't confirm your signup. Check your connection and try again — using the same email won't add you twice." });
    } finally {
      submissionLock.current = false;
    }
  }

  if (state.status === "success") {
    return (
      <div className="form-success" ref={successRef} tabIndex={-1} role="status">
        <div className="success-mark">
          <div className="success-celebration" aria-hidden="true">
            {Array.from({ length: 14 }, (_, index) => <span key={index} />)}
          </div>
          <span className="success-icon"><Icon name="check" /></span>
        </div>
        <h3>You&apos;re in the loop!</h3>
        <p>You&apos;re on the Oppra waitlist. We&apos;ll send launch and early-access updates to <strong>{state.email}</strong>.</p>
        <button className="text-link" onClick={() => setState({ status: "idle" })}>Add another person <Icon name="arrow" /></button>
      </div>
    );
  }

  const submitting = state.status === "submitting";
  return (
    <form className="waitlist-form" onSubmit={handleSubmit} noValidate aria-busy={submitting}>
      <div className="form-field">
        <label htmlFor="fullName">Full Name</label>
        <input id="fullName" name="fullName" autoComplete="name" placeholder="Your full name" required minLength={2} maxLength={100} disabled={submitting} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? "fullName-error" : undefined} />
        {errors.fullName && <p id="fullName-error" className="field-error">{errors.fullName}</p>}
      </div>
      <div className="form-field">
        <label htmlFor="email">Email Address</label>
        <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} disabled={submitting} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} />
        {errors.email && <p id="email-error" className="field-error">{errors.email}</p>}
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="phone">Phone Number <span>(optional)</span></label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+234 800 000 0000" maxLength={30} disabled={submitting} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : undefined} />
          {errors.phone && <p id="phone-error" className="field-error">{errors.phone}</p>}
        </div>
        <div className="form-field">
          <label htmlFor="industry">Industry</label>
          <select id="industry" name="industry" defaultValue="" required disabled={submitting} aria-invalid={Boolean(errors.industry)} aria-describedby={errors.industry ? "industry-error" : undefined}>
            <option value="" disabled>Select your industry</option>
            {INDUSTRIES.map((industry) => <option key={industry} value={industry}>{industry}</option>)}
          </select>
          {errors.industry && <p id="industry-error" className="field-error">{errors.industry}</p>}
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="useCase">What do you want to use Oppra for? <span>(optional)</span></label>
        <textarea id="useCase" name="useCase" placeholder="Tell us a little about your team or your work..." rows={3} maxLength={1000} disabled={submitting} aria-invalid={Boolean(errors.useCase)} aria-describedby={errors.useCase ? "useCase-error" : undefined} />
        {errors.useCase && <p id="useCase-error" className="field-error">{errors.useCase}</p>}
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {state.status === "error" && <p className="form-error" role="alert">{state.message}</p>}
      <button type="submit" className="button form-submit" disabled={submitting}>
        {submitting ? <>Joining the waitlist… <span className="spinner" aria-hidden="true" /></> : <>Join Waitlist <Icon name="arrow" /></>}
      </button>
      <p className="form-privacy"><Icon name="lock" /> By joining, you agree to receive Oppra launch and early-access updates.<br />Your details are used to manage your place on the waitlist.</p>
    </form>
  );
}
