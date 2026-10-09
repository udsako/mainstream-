import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Our Journey",
  description: "Explore Mainstream Basketball Club’s tournaments, championship coverage, featured appearances, friendly games, photos, and videos.",
};

const categories = [
  { id: "tournament-2025", title: "Mainstream Basketball Tournament 2025", intro: "A look back at the tournament through event coverage, photos, and standout moments.", number: "01", label: "TOURNAMENT ARCHIVE" },
  { id: "championship-2026", title: "Mainstream Basketball Championship 2026", intro: "Championship coverage, highlights, photographs, and moments from the club’s major event.", number: "02", label: "CHAMPIONSHIP ARCHIVE" },
  { id: "featured-tournaments", title: "Tournaments Mainstream Featured In", intro: "Explore tournaments and basketball events where Mainstream has participated or been featured.", number: "03", label: "FEATURED APPEARANCES" },
  { id: "friendlies", title: "Friendlies", intro: "Friendly games, training matchups, and basketball connections with other teams and programmes.", number: "04", label: "ON-COURT CONNECTIONS" },
];

type Entry = { id: string; category_id: string };

export default async function OurJourneyPage() {
  const { data } = await supabase.from("our_journey_entries").select("id, category_id").eq("published", true);
  const entries = (data ?? []) as Entry[];

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-24">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-mainstream-orange">The work. The people. The moments.</p>
        <h1 className="font-display text-5xl text-white sm:text-7xl">OUR JOURNEY<span className="text-mainstream-orange">.</span></h1>
        <p className="mt-5 max-w-2xl text-white/60">Every event has a story. Choose a chapter to explore its photos, video coverage, highlights, and memories.</p>
      </section>
      <section className="mx-auto grid max-w-6xl gap-5 px-4 pb-20 sm:px-6 md:grid-cols-2">
        {categories.map((category) => {
          const count = entries.filter((entry) => entry.category_id === category.id).length;
          return (
            <Link key={category.id} href={`/our-journey/${category.id}`} className="mc-card group flex min-h-64 flex-col justify-between rounded-md border border-court-line bg-court-panel p-6 transition hover:border-mainstream-orange/80 sm:p-8">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-xs tracking-[0.25em] text-mainstream-orange">{category.number} / OUR STORY</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/35">{count} {count === 1 ? "entry" : "entries"}</span>
                </div>
                <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">{category.label}</p>
                <h2 className="mt-2 font-display text-3xl leading-tight text-white transition group-hover:text-mainstream-orange sm:text-4xl">{category.title}</h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/55">{category.intro}</p>
              </div>
              <span className="mt-8 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-mainstream-orange">Explore this story <span aria-hidden="true" className="transition-transform group-hover:translate-x-2">→</span></span>
            </Link>
          );
        })}
      </section>
      <Footer />
    </main>
  );
}
