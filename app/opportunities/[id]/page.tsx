import { getById } from "@/lib/db";
import { isOpen } from "@/lib/opportunities";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OpportunityApplicationForm from "@/components/OpportunityApplicationForm";
import { notFound } from "next/navigation";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const opportunity = await getById(params.id);
  if (!opportunity) notFound();

  const open = isOpen(opportunity);

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <a href="/#opportunities" className="text-sm text-white/50 hover:text-mainstream-orange">
          ← Back to opportunities
        </a>

        <div className="mt-6 flex items-start justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-mainstream-orange">
              {opportunity.category}
            </span>
            <h1 className="mt-2 font-display text-4xl text-white sm:text-5xl">
              {opportunity.title}
            </h1>
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

        <div className="mt-6 flex flex-wrap gap-6 border-y border-court-line py-4 font-mono text-xs text-white/50">
          <span>Venue: {opportunity.venue}</span>
          <span>{open ? "Closes" : "Closed"}: {formatDate(opportunity.deadline)}</span>
        </div>

        <p className="mt-8 text-base leading-relaxed text-white/70">
          {opportunity.description}
        </p>

        <div className="mt-10">
          {open ? (
            <OpportunityApplicationForm opportunity={opportunity} />
          ) : (
            <div className="rounded-md border border-court-line bg-court-panel p-6 text-center text-white/50">
              This opportunity has closed. Check the opportunities page for what&apos;s currently open.
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
