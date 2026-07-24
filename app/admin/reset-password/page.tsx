"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("This link is missing its reset token — use the link from your email directly.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setStatus("sending");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setStatus("idle");

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    setStatus("done");
  }

  if (status === "done") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-court-black px-6">
        <div className="w-full max-w-sm rounded-md border border-court-line bg-court-panel p-8 text-center">
          <p className="font-display text-xl text-white">Password updated</p>
          <p className="mt-2 text-sm text-white/60">You can now log in with your new password.</p>
          <a href="/admin" className="mt-6 inline-block rounded-sm bg-mainstream-orange px-6 py-3 text-sm font-semibold uppercase tracking-widest text-court-black transition hover:bg-mainstream-hot">
            Go to login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-court-black px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-md border border-court-line bg-court-panel p-8">
        <h1 className="font-display text-2xl text-white">Set a new password</h1>
        <p className="mt-1 text-sm text-white/50">This link is valid for 30 minutes.</p>

        <div className="relative mt-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-sm border border-court-line bg-court-black px-4 py-2.5 pr-10 text-sm text-white outline-none focus-visible:border-mainstream-orange"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        <div className="relative mt-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-sm border border-court-line bg-court-black px-4 py-2.5 pr-10 text-sm text-white outline-none focus-visible:border-mainstream-orange"
          />
        </div>

        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={status === "sending"}
          className="mt-5 w-full rounded-sm bg-mainstream-orange px-6 py-3 text-sm font-semibold uppercase tracking-widest text-court-black transition hover:bg-mainstream-hot disabled:opacity-50"
        >
          {status === "sending" ? "Saving…" : "Reset password"}
        </button>
      </form>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-court-black"><p className="text-white/50">Loading…</p></main>}>
      <ResetPasswordForm />
    </Suspense>
  );
}