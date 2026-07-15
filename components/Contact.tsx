"use client";

import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-mainstream-orange">
            Reach out
          </p>
          <h2 className="font-display text-4xl leading-tight text-white sm:text-5xl">
            Get in touch
          </h2>
          <p className="mt-6 max-w-md text-white/60">
            Player, parent, sponsor, or just curious about the club — send us
            a message and we&apos;ll get back to you.
          </p>

          <ul className="mt-8 space-y-4 text-sm text-white/70">
            <li>
              <span className="font-mono text-xs uppercase tracking-widest text-white/40">
                Email
              </span>
              <br />
              <a href="mailto:info@mainstreambasketball.com" className="hover:text-mainstream-orange">
                info@mainstreambasketball.com
              </a>
            </li>
            <li>
              <span className="font-mono text-xs uppercase tracking-widest text-white/40">
                Contact number
              </span>
              <br />
              <a href="tel:+2348102678560" className="hover:text-mainstream-orange">
                +234 810 267 8560
              </a>
            </li>
            <li>
              <span className="font-mono text-xs uppercase tracking-widest text-white/40">
                WhatsApp
              </span>
              <br />
              <a
                href="https://wa.me/2349017304921"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-mainstream-orange"
              >
                +234 901 730 4921
              </a>
            </li>
            <li>
              <span className="font-mono text-xs uppercase tracking-widest text-white/40">
                Program Director
              </span>
              <br />
              Bamidele Oluwakayode Moses
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="rounded-md border border-court-line bg-court-panel p-6">
          <div className="mb-4">
            <label htmlFor="name" className="mb-1 block font-mono text-xs uppercase tracking-widest text-white/50">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="mb-1 block font-mono text-xs uppercase tracking-widest text-white/50">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="message" className="mb-1 block font-mono text-xs uppercase tracking-widest text-white/50">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full resize-none rounded-sm border border-court-line bg-court-black px-4 py-2.5 text-sm text-white outline-none focus-visible:border-mainstream-orange"
            />
          </div>
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-sm bg-mainstream-orange px-6 py-3 text-sm font-semibold uppercase tracking-widest text-court-black transition hover:bg-mainstream-hot disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Send message"}
          </button>
          {status === "sent" && (
            <p className="mt-3 text-center text-xs text-mainstream-orange">
              Message sent — we&apos;ll be in touch.
            </p>
          )}
          {status === "error" && (
            <p className="mt-3 text-center text-xs text-red-400">
              Something went wrong. Try again, or email us directly.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
