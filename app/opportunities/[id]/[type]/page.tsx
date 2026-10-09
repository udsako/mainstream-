import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getById } from "@/lib/db";
import { isOpen } from "@/lib/opportunities";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OpportunityApplicationForm from "@/components/OpportunityApplicationForm";

type RegistrationType = "player" | "viewer";

type PageProps = {
  params: Promise<{
    id: string;
    type: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const opportunity = await getById(id);

  if (!opportunity) {
    return {
      title: "Opportunity Not Found",
    };
  }

  return {
    title: `${opportunity.title} Registration`,
    description: `Register for ${opportunity.title} with Mainstream Basketball Club.`,
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function OpportunityRegistrationPage({
  params,
}: PageProps) {
  const { id, type } = await params;

  if (type !== "player" && type !== "viewer") {
    notFound();
  }

  const initialType: RegistrationType = type;

  const opportunity = await getById(id);

  if (!opportunity) {
    notFound();
  }

  const sponsorStyle =
    opportunity.category === "Sponsorship" ||
    opportunity.category === "Volunteer";

  // Sponsorship and volunteer enquiries use the standard detail page.
  if (sponsorStyle) {
    redirect(`/opportunities/${id}`);
  }

  const open = isOpen(opportunity);

  return (
    <main>
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <a
          href={`/opportunities/${id}`}
          className="text-sm text-white/50 transition hover:text-mainstream-orange"
        >
          ← Back to opportunity
        </a>

        <div className="mt-6 flex items-start justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-mainstream-orange">
              {opportunity.category}
            </span>

            <h1 className="mt-2 font-display text-4xl text-white sm:text-5xl">
              {opportunity.title}
            </h1>

            <p className="mt-3 text-sm text-white/50">
              {initialType === "player"
                ? "Player registration"
                : "Viewer registration"}
            </p>
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

          <span>
            {open ? "Closes" : "Closed"}:{" "}
            {formatDate(opportunity.deadline)}
          </span>
        </div>

        <p className="mt-8 text-base leading-relaxed text-white/70">
          {opportunity.description}
        </p>

        <div className="mt-10">
          {open ? (
            <OpportunityApplicationForm
              opportunity={opportunity}
              initialType={initialType}
            />
          ) : (
            <div className="rounded-md border border-court-line bg-court-panel p-6 text-center text-white/50">
              This opportunity has closed. Check the opportunities page for
              what&apos;s currently open.
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
