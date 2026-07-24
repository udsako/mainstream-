"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface PaymentSettings {
  account_name: string;
  account_number: string;
  bank_name: string;
  amount_note: string;
}

interface PlayerEntry {
  name: string;
  email: string;
}

export default function PayPage() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [players, setPlayers] = useState<PlayerEntry[]>([{ name: "", email: "" }]);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/payment-settings")
      .then((res) => res.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  function copyAccountNumber() {
    if (!settings?.account_number) return;
    navigator.clipboard.writeText(settings.account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function updatePlayer(index: number, field: keyof PlayerEntry, value: string) {
    setPlayers((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  }

  function addPlayer() {
    setPlayers((prev) => [...prev, { name: "", email: "" }]);
  }

  function removePlayer(index: number) {
    setPlayers((prev) => prev.filter((_, i) => i !== index));
  }

  async function compressImage(inputFile: File): Promise<File> {
    // Skip compression for non-images (PDFs, HEIC — canvas can't read HEIC
    // reliably across browsers) and anything already small.
    const isCompressibleImage = ["image/jpeg", "image/png", "image/webp"].includes(inputFile.type);
    if (!isCompressibleImage || inputFile.size < 400 * 1024) {
      return inputFile;
    }

    try {
      const bitmap = await createImageBitmap(inputFile);
      const MAX_DIMENSION = 1600;
      let { width, height } = bitmap;

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const scale = MAX_DIMENSION / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return inputFile;
      ctx.drawImage(bitmap, 0, 0, width, height);

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.75)
      );
      if (!blob) return inputFile;

      // Only use the compressed version if it's actually smaller —
      // occasionally re-encoding a already-small/simple image bloats it.
      if (blob.size >= inputFile.size) return inputFile;

      return new File([blob], inputFile.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
    } catch {
      // If compression fails for any reason, just upload the original —
      // never block a payment submission over an optimization step.
      return inputFile;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please attach your payment receipt.");
      return;
    }
    if (players.some((p) => !p.name.trim() || !p.email.trim())) {
      setError("Fill in a name and email for every player listed.");
      return;
    }
    setError("");
    setStatus("sending");

    const compressedFile = await compressImage(file);

    const body = new FormData();
    body.append("players", JSON.stringify(players));
    body.append("receipt", compressedFile);

    try {
      const res = await fetch("/api/payments", { method: "POST", body });
      if (!res.ok) {
        const data = await res.json();

        throw new Error(data.error || "Something went wrong");
      }
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  }

  if (status === "sent") {
    return (
      <main>
        <Navbar />
        <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-4 sm:px-6 py-16">
          <div className="w-full rounded-md border border-mainstream-orange/40 bg-mainstream-orange/5 p-8 text-center">
            <p className="font-display text-2xl text-white">Payment received.</p>
            <p className="mt-3 text-sm text-white/60">
              We&apos;ll verify it and confirm each registration by email
              shortly. Thanks for your patience.
            </p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-16">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-mainstream-orange">
          Payment
        </p>
        <h1 className="font-display text-4xl text-white sm:text-5xl">Complete your payment</h1>
        <p className="mt-4 text-sm text-white/60">
          Transfer to the account below, then submit your receipt to confirm
          your spot. Paying for more than one player? Add them all below —
          one transfer and one receipt covers everyone.
        </p>

        {!settings ? (
          <p className="mt-8 text-white/50">Loading payment details…</p>
        ) : !settings.account_number ? (
          <p className="mt-8 text-white/50">
            Payment details haven&apos;t been set up yet. Please check back shortly.
          </p>
        ) : (
          <div className="mt-8 overflow-hidden rounded-md border border-court-line bg-court-panel">
            {settings.amount_note && (
              <div className="border-b border-court-line bg-mainstream-orange/5 px-6 py-4 text-center">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Amount to pay</p>
                <p className="mt-1 font-display text-3xl text-mainstream-orange">{settings.amount_note}</p>
              </div>
            )}

            <div className="px-6 py-5">
              {/* Account number gets top billing — largest, with a dedicated copy button */}
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Account Number</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="font-mono text-2xl font-bold tracking-wider text-white sm:text-3xl">
                  {settings.account_number}
                </span>
                <button
                  type="button"
                  onClick={copyAccountNumber}
                  className={`flex shrink-0 items-center gap-1.5 rounded-sm border px-3 py-2 text-xs font-semibold uppercase tracking-widest transition ${
                    copied
                      ? "border-green-400/40 bg-green-400/10 text-green-400"
                      : "border-mainstream-orange text-mainstream-orange hover:bg-mainstream-orange hover:text-court-black"
                  }`}
                >
                  {copied ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-court-line pt-4 text-sm">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Account Name</p>
                  <p className="mt-0.5 font-semibold text-white">{settings.account_name}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Bank</p>
                  <p className="mt-0.5 font-semibold text-white">{settings.bank_name}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-md border border-mainstream-orange/40 bg-mainstream-orange/5 p-4 text-center text-sm font-semibold uppercase tracking-wide text-mainstream-orange">
          If you are paying, the transaction remarks MUST include the
          player&apos;s name (or all names, if paying for more than one) —
          this is how we match your payment to the right people.
        </div>

        <form onSubmit={handleSubmit} className="mt-8 rounded-md border border-court-line bg-court-panel p-6">
          <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-white/50">
            Player{players.length > 1 ? "s" : ""} this payment covers
          </label>

          <div className="space-y-3">
            {players.map((player, i) => (
              <div key={i} className="grid gap-2 rounded-sm border border-court-line bg-court-black p-3 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  placeholder="Player name"
                  value={player.name}
                  onChange={(e) => updatePlayer(i, "name", e.target.value)}
                  className="rounded-sm border border-court-line bg-court-panel px-3 py-2 text-sm text-white outline-none focus-visible:border-mainstream-orange"
                />
                <input
                  type="email"
                  placeholder="Player email"
                  value={player.email}
                  onChange={(e) => updatePlayer(i, "email", e.target.value)}
                  className="rounded-sm border border-court-line bg-court-panel px-3 py-2 text-sm text-white outline-none focus-visible:border-mainstream-orange"
                />
                {players.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePlayer(i)}
                    className="rounded-sm border border-red-400/40 px-3 py-2 text-xs uppercase tracking-widest text-red-400 hover:bg-red-400/10 sm:w-auto"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addPlayer}
            className="mt-3 rounded-sm border border-court-line px-4 py-2 text-xs uppercase tracking-widest text-white/60 hover:border-mainstream-orange hover:text-mainstream-orange"
          >
            + Add another player
          </button>

          <label className="mb-1 mt-6 block font-mono text-xs uppercase tracking-widest text-white/50">
            Attach your payment receipt
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            required
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none file:mr-4 file:rounded-sm file:border-0 file:bg-mainstream-orange file:px-3 file:py-1.5 file:text-xs file:font-semibold file:uppercase file:text-court-black"
          />

          {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={status === "sending"}
            className="mc-btn-primary mt-5 w-full rounded-sm bg-mainstream-orange px-6 py-3 text-sm font-semibold uppercase tracking-widest text-court-black transition hover:bg-mainstream-hot disabled:opacity-50"
          >
            {status === "sending" ? "Submitting…" : "Submit payment"}
          </button>
        </form>
      </div>
      <Footer />
    </main>
  );
}
