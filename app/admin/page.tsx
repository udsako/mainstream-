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
}

export default function AdminPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [user, setUser] = useState<CurrentUser | null>(null);

  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", inviteCode: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
    const headers = ["Name", "Email", "Phone", "Opportunity", "Registration Type", "Message", "Submitted"];

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
      a.message || "",
      new Date(a.created_at).toLocaleString("en-GB"),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => escapeCell(String(cell))).join(","))
      .join("\r\n");

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
          <input
            type="password"
            placeholder="Password"
            value={authForm.password}
            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            className="mt-4 w-full rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange"
          />
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
            {applications.map((a) => (
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}