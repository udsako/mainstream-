"use client";

import { useEffect, useState } from "react";
import { Opportunity, isOpen } from "@/lib/opportunities";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/opportunities")
      .then((res) => res.json())
      .then((data) => setOpportunities(data))
      .finally(() => setLoading(false));
  }, []);

  // Postings without keepVisibleAfterDeadline disappear once closed —
  // like a job listing coming down after the vacancy is filled.
  const visible = opportunities.filter((o) => isOpen(o) || o.keepVisibleAfterDeadline);

  return (
    <section id="opportunities" className="bg-court-panel/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-mainstream-orange">
          What&apos;s happening
        </p>
        <h2 className="mb-12 font-display text-4xl text-white sm:text-5xl">
          Open opportunities
        </h2>

        {loading && <p className="text-white/50">Loading…</p>}

        {!loading && visible.length === 0 && (
          <p className="text-white/50">Nothing open right now — check back soon.</p>
        )}

        {!loading && visible.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {visible.map((opp) => {
              const open = isOpen(opp);
              return (
                <div
                  key={opp.id}
                  className="rounded-md border border-court-line bg-court-black p-6 transition hover:border-mainstream-orange/40"
                >
                  <a href={`/opportunities/${opp.id}`} className="block">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-mainstream-orange">
                          {opp.category}
                        </span>
                        <h3 className="mt-1 font-display text-2xl tracking-wide text-white">
                          {opp.title}
                        </h3>
                      </div>
                      <span
                        className={`shrink-0 rounded-sm px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${
                          open
                            ? "bg-mainstream-orange/15 text-mainstream-orange"
                            : "bg-white/5 text-white/40"
                        }`}
                      >
                        {open ? "Open" : "Closed"}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-white/55">{opp.description}</p>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-court-line pt-4 font-mono text-xs text-white/40">
                      <span>{opp.venue}</span>
                      <span>
                        {open ? "Closes" : "Closed"} {formatDate(opp.deadline)}
                      </span>
                    </div>
                  </a>

                  {open && (
                    <a
                      href={`/opportunities/${opp.id}`}
                      className="mt-5 inline-block rounded-sm border border-mainstream-orange px-5 py-2 text-xs font-semibold uppercase tracking-widest text-mainstream-orange transition hover:bg-mainstream-orange hover:text-court-black"
                    >
                      {opp.category === "Sponsorship" || opp.category === "Volunteer" ? "Reach out" : "View & register"}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
