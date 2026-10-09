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
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadOpportunities() {
      try {
        const response = await fetch("/api/opportunities");

        if (!response.ok) {
          throw new Error("Failed to load opportunities");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected opportunities response");
        }

        if (!cancelled) {
          setOpportunities(data);
          setLoadError(false);
        }
      } catch (error) {
        console.error("Unable to load opportunities:", error);

        if (!cancelled) {
          setLoadError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOpportunities();

    return () => {
      cancelled = true;
    };
  }, []);

  // Only show opportunities that are open, unless they are
  // explicitly configured to remain visible after their deadline.
  const visible = opportunities.filter(
    (opportunity) =>
      isOpen(opportunity) 
  );

  return (
    <section
      id="opportunities"
      className="bg-court-panel/40 py-12 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Refined section heading */}
        <div className="mb-10 flex items-center gap-4 sm:mb-12">
          <div className="h-10 w-1 shrink-0 rounded-full bg-mainstream-orange" />

          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.25em] text-mainstream-orange">
              What&apos;s happening
            </p>

            <h2 className="font-display text-2xl leading-tight text-white sm:text-3xl">
              Get involved with Mainstream
            </h2>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <p className="text-sm text-white/50">
            Loading opportunities...
          </p>
        )}

        {/* Error state */}
        {!loading && loadError && (
          <div className="rounded-md border border-court-line bg-court-black p-6 sm:p-8">
            <h3 className="font-display text-xl text-white sm:text-2xl">
              Opportunities are temporarily unavailable.
            </h3>

            <p className="mt-3 max-w-xl text-sm text-white/60">
              We couldn&apos;t load the current listings. Please try again
              shortly.
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex border border-mainstream-orange px-5 py-3 text-xs font-semibold uppercase tracking-widest text-mainstream-orange transition hover:bg-mainstream-orange hover:text-court-black"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !loadError && visible.length === 0 && (
          <div className="rounded-md border border-court-line bg-court-black p-6 sm:p-8">
            <p className="font-display text-xl text-white sm:text-2xl">
              No open opportunities right now.
            </p>

            <p className="mt-3 max-w-xl text-sm text-white/60">
              There are no active opportunities at the moment. Check back
              soon for new ways to play, compete, volunteer, or support
              Mainstream.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/our-journey"
                className="inline-flex items-center border border-mainstream-orange px-5 py-3 text-xs font-semibold uppercase tracking-widest text-mainstream-orange transition hover:bg-mainstream-orange hover:text-court-black"
              >
                Explore our journey
              </a>

              <a
                href="/contact"
                className="inline-flex items-center border border-white/20 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-white/70 transition hover:border-mainstream-orange hover:text-mainstream-orange"
              >
                Contact the club
              </a>
            </div>
          </div>
        )}

        {/* Active opportunities */}
        {!loading && !loadError && visible.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
            {visible.map((opp) => {
              const open = isOpen(opp);
              const bundleCount = opp.subEvents?.length || 0;

              return (
                <article
                  key={opp.id}
                  className="rounded-md border border-court-line bg-court-black p-5 transition-colors duration-200 hover:border-mainstream-orange/40 sm:p-6"
                >
                  <a
                    href={`/opportunities/${opp.id}`}
                    className="block rounded-sm focus-visible:outline-mainstream-orange"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-mainstream-orange">
                            {opp.category}
                          </span>

                          {bundleCount > 0 && (
                            <span className="rounded-sm bg-mainstream-orange/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-mainstream-orange">
                              {bundleCount} events · 1 registration
                            </span>
                          )}
                        </div>

                        <h3 className="mt-2 font-display text-xl leading-snug text-white sm:text-2xl">
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

                    <p className="mt-3 text-sm leading-relaxed text-white/60">
                      {opp.description}
                    </p>

                    {bundleCount > 0 && (
                      <p className="mt-3 text-xs leading-relaxed text-white/40">
                        Includes: {opp.subEvents!.join(" · ")}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-court-line pt-4 font-mono text-[11px] text-white/40 sm:text-xs">
                      <span>{opp.venue}</span>

                      <span>
                        {open ? "Closes" : "Closed"}{" "}
                        {formatDate(opp.deadline)}
                      </span>
                    </div>
                  </a>

                  {open && (
                    <a
                      href={`/opportunities/${opp.id}`}
                      className="mt-5 inline-flex items-center rounded-sm border border-mainstream-orange px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-mainstream-orange transition hover:bg-mainstream-orange hover:text-court-black"
                    >
                      {opp.category === "Sponsorship" ||
                      opp.category === "Volunteer"
                        ? "Reach out"
                        : "View & register"}
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}