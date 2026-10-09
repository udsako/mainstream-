"use client";

import { useEffect, useState } from "react";

type LinkItem = { label: string; url: string; platform: "YouTube" | "Instagram" | "Other" };
type Entry = { id: string; category_id: string; title: string; description: string; images: string[]; links: LinkItem[]; published: boolean; sort_order: number };
const CATEGORIES = [
  { id: "tournament-2025", label: "Mainstream Basketball Tournament 2025" },
  { id: "championship-2026", label: "Mainstream Basketball Championship 2026" },
  { id: "featured-tournaments", label: "Tournaments Mainstream Featured In" },
  { id: "friendlies", label: "Friendlies" },
];
const blank = { category_id: "tournament-2025", title: "", description: "", images: [] as string[], links: [] as LinkItem[], published: true, sort_order: 0 };
const field = "w-full rounded-sm border border-court-line bg-court-black px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-mainstream-orange focus:outline-none";

export default function OurJourneyAdminPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [form, setForm] = useState({ ...blank });
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newLink, setNewLink] = useState<LinkItem>({ label: "", url: "", platform: "Instagram" });

  async function load() {
    setLoading(true);
    const response = await fetch("/api/admin/our-journey");
    if (response.ok) setEntries(await response.json());
    else setError("Could not load entries. Check your admin session and run the Supabase migration.");
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  function reset() { setForm({ ...blank }); setEditing(null); setNewLink({ label: "", url: "", platform: "Instagram" }); setError(""); }

  async function addImages(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    for (const file of Array.from(files)) {
      const fd = new FormData(); fd.append("file", file);
      const response = await fetch("/api/our-journey/upload", { method: "POST", body: fd });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Image upload failed."); return; }
      setForm((current) => ({ ...current, images: [...current.images, data.url] }));
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError("");
    const response = await fetch(editing ? `/api/our-journey/${editing}` : "/api/our-journey", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) { setError(data.error || "Could not save entry."); return; }
    reset(); await load();
  }

  function edit(entry: Entry) {
    setEditing(entry.id);
    setForm({ category_id: entry.category_id, title: entry.title, description: entry.description || "", images: entry.images || [], links: entry.links || [], published: entry.published, sort_order: entry.sort_order || 0 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(id: string) {
    if (!confirm("Delete this Our Journey entry?")) return;
    const response = await fetch(`/api/our-journey/${id}`, { method: "DELETE" });
    if (!response.ok) { setError("Could not delete entry."); return; }
    await load();
  }

  function addLink() {
    if (!newLink.label.trim() || !newLink.url.trim()) { setError("Enter a link label and URL first."); return; }
    try { new URL(newLink.url); } catch { setError("Enter a complete URL starting with https://."); return; }
    setForm((current) => ({ ...current, links: [...current.links, { ...newLink }] }));
    setNewLink({ label: "", url: "", platform: "Instagram" });
  }

  return (
    <main className="min-h-screen bg-court-black px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <a href="/admin" className="text-xs uppercase tracking-widest text-mainstream-orange hover:underline">← Back to admin dashboard</a>
        <p className="mt-8 font-mono text-xs uppercase tracking-[0.25em] text-mainstream-orange">Website content</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">OUR JOURNEY MANAGER<span className="text-mainstream-orange">.</span></h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">Add event recaps, multiple video or social links, and optional images. Entries are shown on the public Our Journey page when published.</p>

        <form onSubmit={save} className="mt-8 space-y-5 rounded-md border border-court-line bg-court-panel p-5 sm:p-7">
          <h2 className="font-display text-2xl">{editing ? "Edit entry" : "Add an Our Journey entry"}</h2>
          {error && <p role="alert" className="rounded border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-300">{error}</p>}
          <label className="block text-sm text-white/70">Category
            <select className={`${field} mt-2`} value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </label>
          <label className="block text-sm text-white/70">Event / entry title
            <input className={`${field} mt-2`} required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Educational Basketball feature" />
          </label>
          <label className="block text-sm text-white/70">Short recap (optional)
            <textarea className={`${field} mt-2 min-h-24`} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Briefly describe the event or feature." />
          </label>

          <div className="rounded border border-court-line p-4">
            <h3 className="font-semibold">Photos (optional)</h3>
            <p className="mt-1 text-xs text-white/45">Upload JPG, PNG, or WebP images up to 10 MB each. You can upload several.</p>
            <input className="mt-3 block w-full text-sm text-white/70 file:mr-3 file:rounded-sm file:border-0 file:bg-mainstream-orange file:px-3 file:py-2 file:font-semibold file:text-court-black" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => { void addImages(e.target.files); e.currentTarget.value = ""; }} />
            {form.images.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{form.images.map((url, i) => <div key={`${url}-${i}`} className="relative"><img src={url} alt={`Uploaded event image ${i+1}`} className="aspect-square w-full rounded object-cover" /><button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, index) => index !== i) })} className="mt-1 text-xs text-red-300 hover:underline">Remove image</button></div>)}</div>}
          </div>

          <div className="rounded border border-court-line p-4">
            <h3 className="font-semibold">Video, Instagram, and other links</h3>
            <p className="mt-1 text-xs text-white/45">Add as many links as you need. Each gets its own button on the public page.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <input className={field} placeholder="Button label (e.g. Watch highlights)" value={newLink.label} onChange={e => setNewLink({ ...newLink, label: e.target.value })} />
              <input className={field} placeholder="Full URL" value={newLink.url} onChange={e => setNewLink({ ...newLink, url: e.target.value })} />
              <select className={field} value={newLink.platform} onChange={e => setNewLink({ ...newLink, platform: e.target.value as LinkItem["platform"] })}><option>Instagram</option><option>YouTube</option><option>Other</option></select>
            </div>
            <button type="button" onClick={addLink} className="mt-3 rounded-sm border border-mainstream-orange px-4 py-2 text-xs uppercase tracking-widest text-mainstream-orange hover:bg-mainstream-orange hover:text-court-black">Add link</button>
            {form.links.length > 0 && <ul className="mt-4 space-y-2">{form.links.map((link, i) => <li key={`${link.url}-${i}`} className="flex flex-wrap items-center justify-between gap-2 rounded border border-court-line p-3 text-sm"><span>{link.label} <span className="text-white/40">· {link.platform}</span><br /><span className="break-all text-xs text-white/40">{link.url}</span></span><button type="button" onClick={() => setForm({ ...form, links: form.links.filter((_, index) => index !== i) })} className="text-xs text-red-300 hover:underline">Remove</button></li>)}</ul>}
          </div>

          <label className="flex items-center gap-3 text-sm text-white/70"><input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} /> Publish this entry on the website</label>
          <div className="flex flex-wrap gap-3">
            <button disabled={saving} className="rounded-sm bg-mainstream-orange px-5 py-3 text-sm font-semibold uppercase tracking-widest text-court-black disabled:opacity-50">{saving ? "Saving…" : editing ? "Save changes" : "Create entry"}</button>
            {editing && <button type="button" onClick={reset} className="rounded-sm border border-court-line px-5 py-3 text-sm uppercase tracking-widest text-white/70">Cancel edit</button>}
          </div>
        </form>

        <section className="mt-12">
          <div className="flex items-center justify-between gap-3"><h2 className="font-display text-2xl">Existing entries</h2><button onClick={() => void load()} className="text-xs uppercase tracking-widest text-mainstream-orange">Refresh</button></div>
          {loading ? <p className="mt-4 text-sm text-white/50">Loading entries…</p> : entries.length === 0 ? <p className="mt-4 text-sm text-white/50">No entries yet. Create the first one above.</p> : <div className="mt-4 space-y-3">{entries.map(entry => <article key={entry.id} className="flex flex-col gap-4 rounded-md border border-court-line bg-court-panel p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{entry.title}</p><p className="mt-1 text-xs text-white/40">{CATEGORIES.find(c => c.id === entry.category_id)?.label} · {entry.images?.length || 0} images · {entry.links?.length || 0} links · {entry.published ? "Published" : "Draft"}</p></div><div className="flex gap-2"><button onClick={() => edit(entry)} className="rounded-sm border border-court-line px-3 py-2 text-xs uppercase tracking-widest hover:border-mainstream-orange">Edit</button><button onClick={() => void remove(entry.id)} className="rounded-sm border border-red-400/30 px-3 py-2 text-xs uppercase tracking-widest text-red-300">Delete</button></div></article>)}</div>}
        </section>
      </div>
    </main>
  );
}
