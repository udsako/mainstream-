"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Opportunity } from "@/lib/opportunities";

const IS_SPONSOR_TYPE = (category: string) => category === "Sponsorship" || category === "Volunteer";

type RegistrationType = "player" | "viewer";

export default function OpportunityApplicationForm({
  opportunity,
  initialType = "player",
}: {
  opportunity: Opportunity;
  initialType?: RegistrationType;
}) {
  const sponsorStyle = IS_SPONSOR_TYPE(opportunity.category);
  const hasBundle = !!opportunity.subEvents && opportunity.subEvents.length > 0;
  const hasTicketLink = !!opportunity.ticketLink;
  const hasBankDetails = !!opportunity.bankDetails;

  const router = useRouter();
  const [registrationType, setRegistrationTypeState] = useState<RegistrationType>(initialType);

  // Swaps the URL to a real /player or /viewer path segment — e.g.
  // /opportunities/mainstream-championship-2026/player — instead of a
  // query string, so the link itself says what was selected.
  function setRegistrationType(type: RegistrationType) {
    setRegistrationTypeState(type);
    router.replace(`/opportunities/${opportunity.id}/${type}`, { scroll: false });
  }

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [stage, setStage] = useState<"form" | "awaiting-receipt" | "receipt-submitted" | "done-free">("form");
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptStatus, setReceiptStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [receiptError, setReceiptError] = useState("");

  const showTicketCta = !sponsorStyle && registrationType === "viewer" && hasTicketLink;
  const playerNeedsPayment = !sponsorStyle && registrationType === "player" && hasBankDetails;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: opportunity.id,
          opportunityTitle: opportunity.title,
          registrationType: sponsorStyle ? undefined : registrationType,
          requiresPayment: playerNeedsPayment,
          ...form,
        }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setApplicationId(data.id);
      setStatus("sent");
      setStage(playerNeedsPayment ? "awaiting-receipt" : "done-free");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  async function handleReceiptUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!receiptFile || !applicationId) return;

    setReceiptStatus("uploading");
    setReceiptError("");
    try {
      const body = new FormData();
      body.append("receipt", receiptFile);
      const res = await fetch(`/api/applications/${applicationId}/receipt`, {
        method: "POST",
        body,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }
      setStage("receipt-submitted");
    } catch (err) {
      setReceiptStatus("error");
      setReceiptError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  }

  if (stage === "receipt-submitted") {
    return (
      <div className="rounded-md border border-mainstream-orange/40 bg-mainstream-orange/5 p-6 text-center">
        <p className="font-display text-xl text-white">Receipt received.</p>
        <p className="mt-2 text-sm text-white/60">
          We&apos;ll verify your payment and confirm your spot shortly.
          You&apos;ll be contacted if we need anything else.
        </p>
      </div>
    );
  }

  if (stage === "done-free") {
    return (
      <div className="rounded-md border border-mainstream-orange/40 bg-mainstream-orange/5 p-6 text-center">
        <p className="font-display text-xl text-white">You&apos;re in.</p>
        <p className="mt-2 text-sm text-white/60">
          {sponsorStyle
            ? "Thanks for reaching out — we'll be in touch shortly."
            : registrationType === "viewer"
            ? "Your spot to attend is confirmed — we'll follow up with details."
            : "Your registration is in — we'll follow up with next steps."}
        </p>
      </div>
    );
  }

  if (stage === "awaiting-receipt") {
    return (
      <div className="rounded-md border border-court-line bg-court-panel p-6">
        <h3 className="font-display text-xl text-white">Complete your payment</h3>
        <p className="mt-1 text-sm text-white/50">
          Transfer to the account below, then upload your receipt to confirm your spot.
        </p>

        <div className="mt-4 whitespace-pre-line rounded-sm border border-mainstream-orange/30 bg-mainstream-orange/5 p-4 text-sm text-white/80">
          {opportunity.bankDetails}
        </div>

        <form onSubmit={handleReceiptUpload} className="mt-5">
          <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-white/50">
            Upload receipt (screenshot or PDF)
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
            className="w-full rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none file:mr-4 file:rounded-sm file:border-0 file:bg-mainstream-orange file:px-3 file:py-1.5 file:text-xs file:font-semibold file:uppercase file:text-court-black"
          />
          {receiptError && <p className="mt-2 text-xs text-red-400">{receiptError}</p>}

          <button
            type="submit"
            disabled={!receiptFile || receiptStatus === "uploading"}
            className="mc-btn-primary mt-4 w-full rounded-sm bg-mainstream-orange px-6 py-3 text-sm font-semibold uppercase tracking-widest text-court-black transition hover:bg-mainstream-hot disabled:cursor-not-allowed disabled:opacity-50"
          >
            {receiptStatus === "uploading" ? "Uploading…" : "Upload receipt to verify your spot"}
          </button>
          <p className="mt-3 text-center text-xs text-white/40">
            Your registration is saved — you can also send your receipt
            directly if uploading doesn&apos;t work for you.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-court-line bg-court-panel p-6">
      <h3 className="font-display text-xl text-white">
        {sponsorStyle
          ? "Reach out about this"
          : showTicketCta
          ? "Get your ticket"
          : "Register your interest"}
      </h3>
      <p className="mt-1 text-sm text-white/50">
        {sponsorStyle
          ? "Tell us a bit about you or your organization."
          : showTicketCta
          ? "Viewer tickets for this event are sold through Jetron."
          : playerNeedsPayment
          ? "There's a fee to participate — you'll get payment details after registering."
          : hasBundle
          ? "One registration covers all events in this package."
          : "Fill this in and we'll follow up with details."}
      </p>

      {!sponsorStyle && (
        <div className="mt-5">
          <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-white/50">
            I am registering as a
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRegistrationType("player")}
              className={`rounded-sm border px-4 py-3 text-left text-sm transition ${
                registrationType === "player"
                  ? "border-mainstream-orange bg-mainstream-orange/10 text-white"
                  : "border-court-line text-white/50 hover:border-white/30"
              }`}
            >
              <span className="block font-semibold">Player</span>
              <span className="mt-0.5 block text-xs text-white/40">
                Trying out / competing
              </span>
            </button>
            <button
              type="button"
              onClick={() => setRegistrationType("viewer")}
              className={`rounded-sm border px-4 py-3 text-left text-sm transition ${
                registrationType === "viewer"
                  ? "border-mainstream-orange bg-mainstream-orange/10 text-white"
                  : "border-court-line text-white/50 hover:border-white/30"
              }`}
            >
              <span className="block font-semibold">Viewer</span>
              <span className="mt-0.5 block text-xs text-white/40">
                Attending to watch
              </span>
            </button>
          </div>
        </div>
      )}

      {showTicketCta ? (
        <div className="mt-5">
          <a
            href={opportunity.ticketLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mc-btn-primary block w-full rounded-sm bg-mainstream-orange px-6 py-3 text-center text-sm font-semibold uppercase tracking-widest text-court-black transition hover:bg-mainstream-hot"
          >
            Buy your ticket on Jetron
          </a>
          <p className="mt-3 text-center text-xs text-white/40">
            You&apos;ll be taken to Jetron to complete payment and get your ticket.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-white/50">
                Name
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-white/50">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-white/50">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-white/50">
                {sponsorStyle ? "Message" : "Anything we should know?"}
              </label>
              <textarea
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full resize-none rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="mc-btn-primary mt-5 w-full rounded-sm bg-mainstream-orange px-6 py-3 text-sm font-semibold uppercase tracking-widest text-court-black transition hover:bg-mainstream-hot disabled:opacity-50"
          >
            {status === "sending"
              ? "Sending…"
              : sponsorStyle
              ? "Send message"
              : playerNeedsPayment
              ? "Continue to payment"
              : "Submit registration"}
          </button>
          {status === "error" && (
            <p className="mt-3 text-center text-xs text-red-400">
              Something went wrong. Try again, or email us directly.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
