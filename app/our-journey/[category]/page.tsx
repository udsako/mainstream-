import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const categories = [
  { id: "tournament-2025", title: "Mainstream Basketball Tournament 2025", intro: "A look back at the tournament through event coverage, photos, and standout moments." },
  { id: "championship-2026", title: "Mainstream Basketball Championship 2026", intro: "Championship coverage, highlights, and photographs from the club’s major event." },
  { id: "featured-tournaments", title: "Tournaments Mainstream Featured In", intro: "Coverage of tournaments and basketball events where Mainstream has participated or been featured." },
  { id: "friendlies", title: "Friendlies", intro: "Friendly games and basketball connections with other teams and programmes." },
];

type JourneyLink = { label: string; url: string; platform?: string };
type Entry = { id: string; category_id: string; title: string; description?: string | null; images?: string[] | null; links?: JourneyLink[] | null };

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: categoryId } = await params;
  const category = categories.find((item) => item.id === categoryId);
  return { title: category ? `${category.title} | Our Journey` : "Our Journey", description: category?.intro };
}

export default async function JourneyCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categoryId } = await params;
  const category = categories.find((item) => item.id === categoryId);
  if (!category) notFound();

  const { data, error } = await supabase
    .from("our_journey_entries")
    .select("id, category_id, title, description, images, links")
    .eq("category_id", category.id)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const entries = (error ? [] : data ?? []) as Entry[];

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-16 sm:px-6 sm:pt-24">
        <Link href="/our-journey" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-mainstream-orange hover:text-white">← All Our Journey stories</Link>
        <p className="mb-3 mt-8 font-mono text-xs uppercase tracking-[0.3em] text-mainstream-orange">Our story / {String(categories.findIndex((item) => item.id === category.id) + 1).padStart(2, "0")}</p>
        <h1 className="max-w-4xl font-display text-4xl leading-tight text-white sm:text-6xl">{category.title}<span className="text-mainstream-orange">.</span></h1>
        <p className="mt-5 max-w-2xl text-white/60">{category.intro}</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {entries.length === 0 ? (
          <div className="rounded-md border border-dashed border-court-line p-8 sm:p-12">
            <p className="font-display text-2xl text-white">The story is still being put together.</p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">Photos and coverage links for this section will appear here when they are published by the Mainstream team.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {entries.map((entry) => {
              const images = entry.images ?? [];
              const links = entry.links ?? [];
              return (
                <article key={entry.id} className="overflow-hidden rounded-md border border-court-line bg-court-panel">
                  <div className="p-5 sm:p-7">
                    <h2 className="font-display text-2xl text-white sm:text-3xl">{entry.title}</h2>
                    {entry.description && <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-7 text-white/60">{entry.description}</p>}
                    {links.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{links.map((link, index) => <a key={`${link.url}-${index}`} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-sm border border-mainstream-orange/70 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-mainstream-orange transition hover:bg-mainstream-orange hover:text-court-black">{link.label || link.platform || "View coverage"} ↗</a>)}</div>}
                  </div>
                  {images.length > 0 && <div className="grid grid-cols-1 gap-1 bg-black/30 p-1 sm:grid-cols-2 lg:grid-cols-3">{images.map((image, index) => <a key={`${image}-${index}`} href={image} target="_blank" rel="noreferrer" aria-label={`Open photo ${index + 1} from ${entry.title}`} className="group block overflow-hidden"><img src={image} alt={`${entry.title} photo ${index + 1}`} loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]" /></a>)}</div>}
                </article>
              );
            })}
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
