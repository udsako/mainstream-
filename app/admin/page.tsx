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
};

interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

export default function AdminPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [user, setUser] = useState<CurrentUser | null>(null);

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", inviteCode: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitError, setSubmitError] = useState("");

  // Editing state — which opportunity id is currently being edited, and its draft values.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .finally(() => setCheckingSession(false));
  }, []);

  useEffect(() => {
    if (user) loadOpportunities();
  }, [user]);

  async function loadOpportunities() {
    setLoading(true);
    const res = await fetch("/api/opportunities");
    setOpportunities(await res.json());
    setLoading(false);
  }

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
    const payload =
      mode === "login"
        ? { email: authForm.email, password: authForm.password }
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

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setOpportunities([]);
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
      body: JSON.stringify(form),
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
      body: JSON.stringify(editForm),
    });

    if (!res.ok) {
      setEditError("Failed to save. Your session may have expired — try logging in again.");
      return;
    }

    setEditingId(null);
    loadOpportunities();
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-court-black">
        <p className="text-white/50">Loading…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-court-black px-6">
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

          {authError && <p className="mt-3 text-xs text-red-400">{authError}</p>}

          <button
            type="submit"
            disabled={authLoading}
            className="mt-5 w-full rounded-sm bg-mainstream-orange px-6 py-3 text-sm font-semibold uppercase tracking-widest text-court-black transition hover:bg-mainstream-hot disabled:opacity-50"
          >
            {authLoading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-court-black px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-white">Manage opportunities</h1>
            <p className="mt-1 text-xs text-white/40">Signed in as {user.name} ({user.email})</p>
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
            className="rounded-sm bg-mainstream-orange px-6 py-3 text-sm font-semibold uppercase tracking-widest text-court-black transition hover:bg-mainstream-hot sm:col-span-2"
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
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-lg text-white">{o.title}</p>
                      <p className="font-mono text-xs text-white/40">
                        {o.category} · {o.venue} · closes {o.deadline} ·{" "}
                        {isOpen(o) ? (
                          <span className="text-mainstream-orange">Open</span>
                        ) : (
                          <span>Closed</span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
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
      </div>
    </main>
  );
}
