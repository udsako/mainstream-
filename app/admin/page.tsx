"use client";

import { useEffect, useState } from "react";
import { Opportunity, OpportunityCategory, isOpen } from "@/lib/opportunities";

const CATEGORIES: OpportunityCategory[] = ["Tryout", "Tournament", "Sponsorship", "Volunteer"];

const EMPTY_FORM = {
  title: "",
  category: "Tryout" as OpportunityCategory,
  venue: "",
  description: "",
  deadline: "",
  keepVisibleAfterDeadline: true,
  subEventsText: "",
  ticketLink: "",
  bankDetails: "",
};

interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

interface Application {
  id: string;
  opportunity_title: string;
  registration_type: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  created_at: string;
  payment_status: string | null;
  receipt_url: string | null;
}

export default function AdminPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [user, setUser] = useState<CurrentUser | null>(null);

  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", inviteCode: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [forgotError, setForgotError] = useState("");

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitError, setSubmitError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editError, setEditError] = useState("");

  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState("");
  const [removingAppId, setRemovingAppId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .finally(() => setCheckingSession(false));
  }, []);

  useEffect(() => {
    if (user) {
      loadOpportunities();
      loadApplications();
      loadPaySettings();
      loadPayments();
    }
  }, [user]);

  async function loadOpportunities() {
    setLoading(true);
    const res = await fetch("/api/opportunities");
    setOpportunities(await res.json());
    setLoading(false);
  }

  async function loadApplications() {
    setApplicationsLoading(true);
    setApplicationsError("");
    const res = await fetch("/api/applications");
    if (!res.ok) {
      setApplicationsError("Couldn't load registrations.");
      setApplicationsLoading(false);
      return;
    }
    setApplications(await res.json());
    setApplicationsLoading(false);
  }

  async function loadPaySettings() {
    const res = await fetch("/api/payment-settings");
    if (res.ok) {
      const data = await res.json();
      setPaySettings({
        accountName: data.account_name || "",
        accountNumber: data.account_number || "",
        bankName: data.bank_name || "",
        amountNote: data.amount_note || "",
      });
    }
    setPaySettingsLoaded(true);
  }

  async function savePaySettings(e: React.FormEvent) {
    e.preventDefault();
    setPaySettingsSaving(true);
    setPaySettingsSaved(false);
    const res = await fetch("/api/payment-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paySettings),
    });
    setPaySettingsSaving(false);
    if (res.ok) {
      setPaySettingsSaved(true);
      setTimeout(() => setPaySettingsSaved(false), 2500);
    }
  }

  async function loadPayments() {
    setPaymentsLoading(true);
    setPaymentsError("");
    const res = await fetch("/api/payments");
    if (!res.ok) {
      setPaymentsError("Couldn't load payments.");
      setPaymentsLoading(false);
      return;
    }
    setPayments(await res.json());
    setPaymentsLoading(false);
  }

  async function updatePayStatus(id: string, status: "confirmed" | "rejected" | "pending") {
    setUpdatingPayId(id);
    const res = await fetch(`/api/payments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdatingPayId(null);
    if (!res.ok) {
      setPaymentsError("Failed to update. Try logging in again.");
      return;
    }
    setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }

  async function deletePayment(id: string) {
    if (!confirm("Remove this payment record? This can't be undone.")) return;
    await fetch(`/api/payments/${id}`, { method: "DELETE" });
    setPayments((prev) => prev.filter((p) => p.id !== id));
  }

  function exportConfirmedPaymentsToCsv() {
    const confirmed = payments.filter((p) => p.status === "confirmed");

    function escapeCell(value: string): string {
      if (/[",\n]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }

    const headers = ["Player Name", "Player Email", "Payment Submitted By", "Confirmed"];
    const rows: string[][] = [];

    for (const p of confirmed) {
      const players = p.players && p.players.length > 0 ? p.players : [{ name: "", email: p.email }];
      const submittedBy = players[0]?.email || p.email;
      for (const player of players) {
        rows.push([
          player.name,
          player.email,
          submittedBy,
          new Date(p.created_at).toLocaleString("en-GB"),
        ]);
      }
    }

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => escapeCell(cell)).join(","))
      .join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mainstream-confirmed-payments-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
    const payload =
      mode === "login"
        ? { email: authForm.email, password: authForm.password, rememberMe }
        : authForm;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setAuthLoading(false);

    if (!res.ok) {
      setAuthError(data.error || "Something went wrong");
      return;
    }
    setUser(data);
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError("Enter your email first.");
      return;
    }
    setForgotError("");
    setForgotStatus("sending");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail.trim() }),
    });
    if (!res.ok) {
      // A genuine request failure (network/server error) — different from
      // "no account found," which still returns 200 on purpose so this
      // endpoint can't be used to check which emails have admin accounts.
      setForgotStatus("idle");
      setForgotError("Something went wrong sending that. Try again.");
      return;
    }
    setForgotStatus("sent");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setOpportunities([]);
    setApplications([]);
    setPayments([]);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");

    if (!form.title || !form.venue || !form.description || !form.deadline) {
      setSubmitError("Fill in all fields.");
      return;
    }

    const res = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        subEvents: form.subEventsText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      }),
    });

    if (!res.ok) {
      setSubmitError("Failed to add. Your session may have expired — try logging in again.");
      return;
    }

    setForm(EMPTY_FORM);
    loadOpportunities();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this posting? This can't be undone.")) return;
    await fetch(`/api/opportunities/${id}`, { method: "DELETE" });
    loadOpportunities();
  }

  function startEdit(o: Opportunity) {
    setEditingId(o.id);
    setEditError("");
    setEditForm({
      title: o.title,
      category: o.category,
      venue: o.venue,
      description: o.description,
      deadline: o.deadline,
      keepVisibleAfterDeadline: !!o.keepVisibleAfterDeadline,
      subEventsText: (o.subEvents || []).join("\n"),
      ticketLink: o.ticketLink || "",
      bankDetails: o.bankDetails || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError("");
  }

  async function saveEdit(id: string) {
    setEditError("");
    if (!editForm.title || !editForm.venue || !editForm.description || !editForm.deadline) {
      setEditError("Fill in all fields.");
      return;
    }

    const res = await fetch(`/api/opportunities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm,
        subEvents: editForm.subEventsText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      }),
    });

    if (!res.ok) {
      setEditError("Failed to save. Your session may have expired — try logging in again.");
      return;
    }

    setEditingId(null);
    loadOpportunities();
  }

  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);

  // Standalone payment-link system state
  interface PaymentRecord {
    id: string;
    email: string;
    players: { name: string; email: string }[] | null;
    receipt_url: string | null;
    status: string;
    created_at: string;
  }
  const [paySettings, setPaySettings] = useState({ accountName: "", accountNumber: "", bankName: "", amountNote: "" });
  const [paySettingsLoaded, setPaySettingsLoaded] = useState(false);
  const [paySettingsSaving, setPaySettingsSaving] = useState(false);
  const [paySettingsSaved, setPaySettingsSaved] = useState(false);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState("");
  const [updatingPayId, setUpdatingPayId] = useState<string | null>(null);

  async function updatePaymentStatus(id: string, paymentStatus: "verified" | "rejected" | "pending") {
    setUpdatingPaymentId(id);
    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus }),
    });
    setUpdatingPaymentId(null);
    if (!res.ok) {
      setApplicationsError("Failed to update payment status. Try logging in again.");
      return;
    }
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, payment_status: paymentStatus } : a)));
  }

  async function handleDeleteApplication(id: string) {
    if (!confirm("Remove this registration? This can't be undone.")) return;
    setRemovingAppId(id);
    const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
    setRemovingAppId(null);
    if (!res.ok) {
      setApplicationsError("Failed to remove that registration. Your session may have expired — try logging in again.");
      return;
    }
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }

  function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function exportApplicationsToCsv() {
    const headers = ["Name", "Email", "Phone", "Opportunity", "Registration Type", "Payment Status", "Message", "Submitted"];

    // Escape a cell per CSV rules: wrap in quotes if it contains a comma,
    // quote, or newline, and double up any internal quotes.
    function escapeCell(value: string): string {
      if (/[",\n]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }

    const rows = applications.map((a) => [
      a.name,
      a.email,
      a.phone || "",
      a.opportunity_title,
      a.registration_type === "viewer" ? "Spectator" : a.registration_type === "player" ? "Participant" : "",
      a.payment_status && a.payment_status !== "none" ? a.payment_status : "",
      a.message || "",
      new Date(a.created_at).toLocaleString("en-GB"),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => escapeCell(String(cell))).join(","))
      .join("\r\n");

    // Prefix with a UTF-8 BOM so Excel opens accented/special characters correctly.
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mainstream-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-court-black">
        <p className="text-white/50">Loading…</p>
      </main>
    );
  }

  if (!user) {
    if (mode === "forgot") {
      return (
        <main className="flex min-h-screen items-center justify-center bg-court-black px-4 sm:px-6">
          <form
            onSubmit={handleForgotPassword}
            className="w-full max-w-sm rounded-md border border-court-line bg-court-panel p-8"
          >
            <h1 className="font-display text-2xl text-white">Reset password</h1>

            {forgotStatus === "sent" ? (
              <p className="mt-4 text-sm text-white/60">
                If an account exists for that email, a reset link has been
                sent. It&apos;s valid for 30 minutes.
              </p>
            ) : (
              <>
                <p className="mt-1 text-sm text-white/50">
                  Enter your admin email and we&apos;ll send a reset link.
                </p>
                <input
                  type="email"
                  placeholder="Email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="mt-4 w-full rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange"
                />
                {forgotError && <p className="mt-2 text-xs text-red-400">{forgotError}</p>}
                <button
                  type="submit"
                  disabled={forgotStatus === "sending"}
                  className="mt-5 w-full rounded-sm bg-mainstream-orange px-4 sm:px-6 py-3 text-sm font-semibold uppercase tracking-widest text-court-black transition hover:bg-mainstream-hot disabled:opacity-50"
                >
                  {forgotStatus === "sending" ? "Sending…" : "Send reset link"}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => {
                setMode("login");
                setForgotStatus("idle");
                setForgotError("");
              }}
              className="mt-4 w-full text-center text-xs uppercase tracking-widest text-white/50 hover:text-mainstream-orange"
            >
              ← Back to login
            </button>
          </form>
        </main>
      );
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-court-black px-4 sm:px-6">
        <form
          onSubmit={handleAuthSubmit}
          className="w-full max-w-sm rounded-md border border-court-line bg-court-panel p-8"
        >
          <div className="mb-6 flex gap-2">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-sm px-4 py-2 text-xs font-semibold uppercase tracking-widest ${
                mode === "login" ? "bg-mainstream-orange text-court-black" : "text-white/50"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-sm px-4 py-2 text-xs font-semibold uppercase tracking-widest ${
                mode === "signup" ? "bg-mainstream-orange text-court-black" : "text-white/50"
              }`}
            >
              Sign up
            </button>
          </div>

          <h1 className="font-display text-2xl text-white">
            {mode === "login" ? "Admin login" : "Create admin account"}
          </h1>

          {mode === "signup" && (
            <input
              type="text"
              placeholder="Name"
              value={authForm.name}
              onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
              className="mt-4 w-full rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange"
            />
          )}
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Invite code"
              value={authForm.inviteCode}
              onChange={(e) => setAuthForm({ ...authForm, inviteCode: e.target.value })}
              className="mt-4 w-full rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={authForm.email}
            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
            className="mt-4 w-full rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange"
          />
          <div className="relative mt-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              className="w-full rounded-sm border border-court-line bg-court-black px-4 py-2.5 pr-10 text-sm text-white outline-none focus-visible:border-mainstream-orange"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-mainstream-orange"
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
          {mode === "signup" && (
            <p className="mt-2 text-xs text-white/30">
              Password: at least 8 characters. Invite code is required and given
              to you separately — this isn&apos;t public signup.
            </p>
          )}

          {mode === "login" && (
            <div className="mt-3 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-white/60">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-xs text-white/50 hover:text-mainstream-orange"
              >
                Forgot password?
              </button>
            </div>
          )}

          {authError && <p className="mt-3 text-xs text-red-400">{authError}</p>}

          <button
            type="submit"
            disabled={authLoading}
            className="mt-5 w-full rounded-sm bg-mainstream-orange px-4 sm:px-6 py-3 text-sm font-semibold uppercase tracking-widest text-court-black transition hover:bg-mainstream-hot disabled:opacity-50"
          >
            {authLoading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-court-black px-4 sm:px-6 py-10 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl text-white sm:text-3xl">Manage opportunities</h1>
            <p className="mt-1 text-xs text-white/40 break-all sm:break-normal">Signed in as {user.name} ({user.email})</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-white/50 hover:text-mainstream-orange">
              ← Back to site
            </a>
            <button
              onClick={handleLogout}
              className="rounded-sm border border-court-line px-4 py-2 text-xs uppercase tracking-widest text-white/60 hover:border-mainstream-orange hover:text-mainstream-orange"
            >
              Log out
            </button>
          </div>
        </div>
        <p className="mt-2 text-sm text-white/50">
          Postings past their deadline without &quot;keep visible&quot; checked
          disappear from the live site automatically — no action needed.
        </p>

        <form
          onSubmit={handleAdd}
          className="mt-8 grid gap-4 rounded-md border border-court-line bg-court-panel p-6 sm:grid-cols-2"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-mainstream-orange sm:col-span-2">
            Add new
          </p>
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange sm:col-span-2"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as OpportunityCategory })}
            className="rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            placeholder="Venue"
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
            className="rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange sm:col-span-2"
          />
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-widest text-white/50">
              Sub-events (optional — one per line)
            </label>
            <textarea
              placeholder={"Draft Combine\nDraft Night\nChampionship Games\nAward Ceremony"}
              value={form.subEventsText}
              onChange={(e) => setForm({ ...form, subEventsText: e.target.value })}
              rows={4}
              className="w-full rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange"
            />
            <p className="mt-1 text-xs text-white/30">
              If this posting bundles multiple events into one registration
              (like a combine + draft night + championship + awards), list
              each one on its own line. Leave blank for a standalone event.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-widest text-white/50">
              Viewer ticket link (optional — e.g. Jetron)
            </label>
            <input
              placeholder="https://jtr.rsvp/your-event"
              value={form.ticketLink}
              onChange={(e) => setForm({ ...form, ticketLink: e.target.value })}
              className="w-full rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange"
            />
            <p className="mt-1 text-xs text-white/30">
              If set, anyone registering as a Viewer gets sent here to buy a
              ticket instead of the free form. Leave blank for free/no-ticket
              events.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-widest text-white/50">
              Player payment — bank details (optional)
            </label>
            <textarea
              placeholder={"Account Name: Mainstream Basketball Club\nAccount Number: 0123456789\nBank: Example Bank\nAmount: ₦5,000"}
              value={form.bankDetails}
              onChange={(e) => setForm({ ...form, bankDetails: e.target.value })}
              rows={4}
              className="w-full rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange"
            />
            <p className="mt-1 text-xs text-white/30">
              If set, anyone registering as a Player sees these details and
              is asked to upload a payment receipt to confirm their spot.
              Leave blank for free tryouts/tournaments.
            </p>
          </div>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-white/50">
            Closes on
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={form.keepVisibleAfterDeadline}
              onChange={(e) => setForm({ ...form, keepVisibleAfterDeadline: e.target.checked })}
            />
            Keep visible (marked Closed) after deadline
          </label>

          {submitError && <p className="text-xs text-red-400 sm:col-span-2">{submitError}</p>}

          <button
            type="submit"
            className="rounded-sm bg-mainstream-orange px-4 sm:px-6 py-3 text-sm font-semibold uppercase tracking-widest text-court-black transition hover:bg-mainstream-hot sm:col-span-2"
          >
            Add opportunity
          </button>
        </form>

        <div className="mt-10 space-y-3">
          {loading && <p className="text-white/50">Loading…</p>}
          {!loading && opportunities.length === 0 && <p className="text-white/50">No postings yet.</p>}
          {opportunities.map((o) => {
            const editingThis = editingId === o.id;
            return (
              <div key={o.id} className="rounded-md border border-court-line bg-court-panel p-4">
                {!editingThis ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-display text-lg text-white break-words">{o.title}</p>
                      <p className="font-mono text-xs text-white/40 break-words">
                        {o.category} · {o.venue} · closes {o.deadline} ·{" "}
                        {isOpen(o) ? (
                          <span className="text-mainstream-orange">Open</span>
                        ) : (
                          <span>Closed</span>
                        )}
                        {o.subEvents && o.subEvents.length > 0 && (
                          <> · {o.subEvents.length} bundled events</>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => startEdit(o)}
                        className="rounded-sm border border-court-line px-4 py-2 text-xs uppercase tracking-widest text-white/60 hover:border-mainstream-orange hover:text-mainstream-orange"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(o.id)}
                        className="rounded-sm border border-red-400/40 px-4 py-2 text-xs uppercase tracking-widest text-red-400 hover:bg-red-400/10"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="rounded-sm border border-court-line bg-court-black px-3 py-2 text-sm text-white outline-none focus-visible:border-mainstream-orange sm:col-span-2"
                      placeholder="Title"
                    />
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value as OpportunityCategory })}
                      className="rounded-sm border border-court-line bg-court-black px-3 py-2 text-sm text-white outline-none focus-visible:border-mainstream-orange"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <input
                      value={editForm.venue}
                      onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                      className="rounded-sm border border-court-line bg-court-black px-3 py-2 text-sm text-white outline-none focus-visible:border-mainstream-orange"
                      placeholder="Venue"
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={2}
                      className="rounded-sm border border-court-line bg-court-black px-3 py-2 text-sm text-white outline-none focus-visible:border-mainstream-orange sm:col-span-2"
                      placeholder="Description"
                    />
                    <textarea
                      value={editForm.subEventsText}
                      onChange={(e) => setEditForm({ ...editForm, subEventsText: e.target.value })}
                      rows={3}
                      className="rounded-sm border border-court-line bg-court-black px-3 py-2 text-sm text-white outline-none focus-visible:border-mainstream-orange sm:col-span-2"
                      placeholder="Sub-events, one per line (optional)"
                    />
                    <input
                      value={editForm.ticketLink}
                      onChange={(e) => setEditForm({ ...editForm, ticketLink: e.target.value })}
                      className="rounded-sm border border-court-line bg-court-black px-3 py-2 text-sm text-white outline-none focus-visible:border-mainstream-orange sm:col-span-2"
                      placeholder="Viewer ticket link (optional — e.g. Jetron)"
                    />
                    <textarea
                      value={editForm.bankDetails}
                      onChange={(e) => setEditForm({ ...editForm, bankDetails: e.target.value })}
                      rows={3}
                      className="rounded-sm border border-court-line bg-court-black px-3 py-2 text-sm text-white outline-none focus-visible:border-mainstream-orange sm:col-span-2"
                      placeholder="Player payment — bank details (optional)"
                    />
                    <input
                      type="date"
                      value={editForm.deadline}
                      onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                      className="rounded-sm border border-court-line bg-court-black px-3 py-2 text-sm text-white outline-none focus-visible:border-mainstream-orange"
                    />
                    <label className="flex items-center gap-2 text-sm text-white/70">
                      <input
                        type="checkbox"
                        checked={editForm.keepVisibleAfterDeadline}
                        onChange={(e) => setEditForm({ ...editForm, keepVisibleAfterDeadline: e.target.checked })}
                      />
                      Keep visible after deadline
                    </label>

                    {editError && <p className="text-xs text-red-400 sm:col-span-2">{editError}</p>}

                    <div className="flex gap-2 sm:col-span-2">
                      <button
                        onClick={() => saveEdit(o.id)}
                        className="rounded-sm bg-mainstream-orange px-4 py-2 text-xs font-semibold uppercase tracking-widest text-court-black hover:bg-mainstream-hot"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-sm border border-court-line px-4 py-2 text-xs uppercase tracking-widest text-white/60 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Registrations / applications */}
        <div className="mt-16">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-white">Registrations</h2>
            <div className="flex gap-2">
              <button
                onClick={exportApplicationsToCsv}
                disabled={applications.length === 0}
                className="rounded-sm border border-mainstream-orange px-4 py-2 text-xs uppercase tracking-widest text-mainstream-orange hover:bg-mainstream-orange hover:text-court-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-mainstream-orange"
              >
                Export CSV
              </button>
              <button
                onClick={loadApplications}
                className="rounded-sm border border-court-line px-4 py-2 text-xs uppercase tracking-widest text-white/60 hover:border-mainstream-orange hover:text-mainstream-orange"
              >
                Refresh
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-white/50">
            Everyone who submitted a form on an opportunity or contact page.
          </p>

          <div className="mt-6 space-y-3">
            {applicationsLoading && <p className="text-white/50">Loading…</p>}
            {applicationsError && <p className="text-sm text-red-400">{applicationsError}</p>}
            {!applicationsLoading && !applicationsError && applications.length === 0 && (
              <p className="text-white/50">No registrations yet.</p>
            )}
            {applications.map((a) => {
              const paymentBadge =
                a.payment_status === "verified" ? (
                  <span className="rounded-sm bg-green-500/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-green-400">
                    Paid
                  </span>
                ) : a.payment_status === "rejected" ? (
                  <span className="rounded-sm bg-red-500/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-red-400">
                    Rejected
                  </span>
                ) : a.payment_status === "pending" ? (
                  <span className="rounded-sm bg-mainstream-orange/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-mainstream-orange">
                    Pending review
                  </span>
                ) : a.payment_status === "pending_upload" ? (
                  <span className="rounded-sm bg-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white/40">
                    Awaiting receipt
                  </span>
                ) : null;

              return (
                <div key={a.id} className="rounded-md border border-court-line bg-court-panel p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-lg text-white">{a.name}</p>
                      <p className="font-mono text-xs text-white/40">
                        {a.opportunity_title}
                        {a.registration_type && (
                          <>
                            {" · "}
                            <span className="text-mainstream-orange">
                              {a.registration_type === "viewer" ? "Spectator" : "Participant"}
                            </span>
                          </>
                        )}
                        {paymentBadge && <> · {paymentBadge}</>}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-white/30">{formatDateTime(a.created_at)}</span>
                      <button
                        onClick={() => handleDeleteApplication(a.id)}
                        disabled={removingAppId === a.id}
                        className="rounded-sm border border-red-400/40 px-3 py-1.5 text-xs uppercase tracking-widest text-red-400 hover:bg-red-400/10 disabled:opacity-50"
                      >
                        {removingAppId === a.id ? "Removing…" : "Remove"}
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/60">
                    <a href={`mailto:${a.email}`} className="hover:text-mainstream-orange">{a.email}</a>
                    {a.phone && <a href={`tel:${a.phone}`} className="hover:text-mainstream-orange">{a.phone}</a>}
                  </div>
                  {a.message && <p className="mt-2 text-sm text-white/50">{a.message}</p>}

                  {a.receipt_url && (
                    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-sm border border-court-line bg-court-black p-3">
                      <a
                        href={a.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-mainstream-orange hover:underline"
                      >
                        View receipt
                      </a>
                      {a.payment_status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updatePaymentStatus(a.id, "verified")}
                            disabled={updatingPaymentId === a.id}
                            className="rounded-sm border border-green-400/40 px-3 py-1.5 text-xs uppercase tracking-widest text-green-400 hover:bg-green-400/10 disabled:opacity-50"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => updatePaymentStatus(a.id, "rejected")}
                            disabled={updatingPaymentId === a.id}
                            className="rounded-sm border border-red-400/40 px-3 py-1.5 text-xs uppercase tracking-widest text-red-400 hover:bg-red-400/10 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {a.payment_status === "verified" && (
                        <button
                          onClick={() => updatePaymentStatus(a.id, "pending")}
                          disabled={updatingPaymentId === a.id}
                          className="text-xs uppercase tracking-widest text-white/40 hover:text-white"
                        >
                          Undo
                        </button>
                      )}
                      {a.payment_status === "rejected" && (
                        <button
                          onClick={() => updatePaymentStatus(a.id, "pending")}
                          disabled={updatingPaymentId === a.id}
                          className="text-xs uppercase tracking-widest text-white/40 hover:text-white"
                        >
                          Re-review
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Standalone payment link — for selected players only */}
        <div className="mt-16">
          <h2 className="font-display text-2xl text-white">Payment link</h2>
          <p className="mt-2 text-sm text-white/50">
            Share <code className="text-mainstream-orange">mainstreambasketball.com/pay</code> with
            selected players only — not everyone who registered. They submit
            a receipt there, you confirm it below.
          </p>

          <form
            onSubmit={savePaySettings}
            className="mt-6 grid gap-4 rounded-md border border-court-line bg-court-panel p-6 sm:grid-cols-2"
          >
            <p className="font-mono text-xs uppercase tracking-widest text-mainstream-orange sm:col-span-2">
              Bank details shown on the payment page
            </p>
            <input
              placeholder="Account Name"
              value={paySettings.accountName}
              onChange={(e) => setPaySettings({ ...paySettings, accountName: e.target.value })}
              className="rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange"
            />
            <input
              placeholder="Bank Name"
              value={paySettings.bankName}
              onChange={(e) => setPaySettings({ ...paySettings, bankName: e.target.value })}
              className="rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange"
            />
            <input
              placeholder="Account Number"
              value={paySettings.accountNumber}
              onChange={(e) => setPaySettings({ ...paySettings, accountNumber: e.target.value })}
              className="rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange sm:col-span-2"
            />
            <input
              placeholder="Optional note (e.g. amount to pay)"
              value={paySettings.amountNote}
              onChange={(e) => setPaySettings({ ...paySettings, amountNote: e.target.value })}
              className="rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange sm:col-span-2"
            />
            <button
              type="submit"
              disabled={paySettingsSaving || !paySettingsLoaded}
              className="rounded-sm bg-mainstream-orange px-4 sm:px-6 py-3 text-sm font-semibold uppercase tracking-widest text-court-black transition hover:bg-mainstream-hot disabled:opacity-50 sm:col-span-2"
            >
              {paySettingsSaving ? "Saving…" : paySettingsSaved ? "Saved ✓" : "Save payment details"}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between">
            <h3 className="font-display text-xl text-white">Submitted payments</h3>
            <div className="flex gap-2">
              <button
                onClick={exportConfirmedPaymentsToCsv}
                disabled={!payments.some((p) => p.status === "confirmed")}
                className="rounded-sm border border-mainstream-orange px-4 py-2 text-xs uppercase tracking-widest text-mainstream-orange hover:bg-mainstream-orange hover:text-court-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-mainstream-orange"
              >
                Export confirmed CSV
              </button>
              <button
                onClick={loadPayments}
                className="rounded-sm border border-court-line px-4 py-2 text-xs uppercase tracking-widest text-white/60 hover:border-mainstream-orange hover:text-mainstream-orange"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {paymentsLoading && <p className="text-white/50">Loading…</p>}
            {paymentsError && <p className="text-sm text-red-400">{paymentsError}</p>}
            {!paymentsLoading && !paymentsError && payments.length === 0 && (
              <p className="text-white/50">No payments submitted yet.</p>
            )}
            {payments.map((p) => {
              const players = p.players && p.players.length > 0 ? p.players : [{ name: "", email: p.email }];
              return (
              <div key={p.id} className="rounded-md border border-court-line bg-court-panel p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="font-display text-lg text-white">
                      {players.map((pl, i) => (
                        <span key={i}>
                          {pl.name || pl.email}
                          {i < players.length - 1 && <span className="text-white/30">, </span>}
                        </span>
                      ))}
                      {players.length > 1 && (
                        <span className="ml-2 rounded-sm bg-white/10 px-2 py-0.5 align-middle font-mono text-[10px] uppercase tracking-widest text-white/40">
                          {players.length} players
                        </span>
                      )}
                    </div>
                    <span
                      className={`rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                        p.status === "confirmed"
                          ? "bg-green-500/15 text-green-400"
                          : p.status === "rejected"
                          ? "bg-red-500/15 text-red-400"
                          : "bg-mainstream-orange/15 text-mainstream-orange"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-white/30">{formatDateTime(p.created_at)}</span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {p.receipt_url && (
                    <a
                      href={p.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-mainstream-orange hover:underline"
                    >
                      View receipt
                    </a>
                  )}
                  {p.status === "pending" && (
                    <>
                      <button
                        onClick={() => updatePayStatus(p.id, "confirmed")}
                        disabled={updatingPayId === p.id}
                        className="rounded-sm border border-green-400/40 px-3 py-1.5 text-xs uppercase tracking-widest text-green-400 hover:bg-green-400/10 disabled:opacity-50"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updatePayStatus(p.id, "rejected")}
                        disabled={updatingPayId === p.id}
                        className="rounded-sm border border-red-400/40 px-3 py-1.5 text-xs uppercase tracking-widest text-red-400 hover:bg-red-400/10 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {(p.status === "confirmed" || p.status === "rejected") && (
                    <button
                      onClick={() => {
                        const emailAlreadySent =
                          p.status === "confirmed"
                            ? "a 'registration complete' email"
                            : "a 'please resubmit' email";
                        if (
                          confirm(
                            `This moves it back to pending review. Note: ${emailAlreadySent} has already been sent and can't be recalled.`
                          )
                        ) {
                          updatePayStatus(p.id, "pending");
                        }
                      }}
                      disabled={updatingPayId === p.id}
                      className="text-xs uppercase tracking-widest text-white/40 hover:text-white"
                    >
                      Undo
                    </button>
                  )}
                  <button
                    onClick={() => deletePayment(p.id)}
                    className="ml-auto rounded-sm border border-court-line px-3 py-1.5 text-xs uppercase tracking-widest text-white/40 hover:border-red-400/40 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
