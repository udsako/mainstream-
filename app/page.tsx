import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

const destinations = [
  {
    eyebrow: "Who we are",
    title: "Built for growth.",
    description:
      "Discover our mission, our player-development pathway, and the values that guide Mainstream.",
    href: "/about",
    link: "Meet Mainstream",
  },
  {
    eyebrow: "Get involved",
    title: "Find your next opportunity.",
    description:
      "Explore current tryouts, tournaments, volunteering, and other ways to take part.",
    href: "/opportunities",
    link: "View opportunities",
  },
  {
    eyebrow: "Our journey",
    title: "The moments that move us forward.",
    description:
      "Revisit the events, people, and milestones that have shaped the Mainstream community.",
    href: "/past-events",
    link: "Explore past events",
  },
  {
    eyebrow: "Back the game",
    title: "Help create what comes next.",
    description:
      "Learn how sponsors, partners, and vendors can contribute to the club's work.",
    href: "/support-us",
    link: "Support Mainstream",
  },
];

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-mainstream-orange">
            More than the game
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-white sm:text-5xl">
            Develop. Compete. <span className="text-mainstream-orange">Belong.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/60">
            Mainstream Basketball Club uses basketball to develop players,
            build community, and create meaningful opportunities on and off the court.
            Explore the club, find ways to get involved, or look back at what we have
            built together.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {destinations.map((item, index) => (
            <article
              key={item.href}
              className="mc-card rounded-md border border-court-line bg-court-panel p-6 sm:p-8"
            >
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-mainstream-orange">
                {item.eyebrow}
              </p>
              <h3 className="mt-4 font-display text-2xl text-white sm:text-3xl">
                {item.title}
              </h3>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/55">
                {item.description}
              </p>
              <a
                href={item.href}
                className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-mainstream-orange transition hover:text-white"
              >
                {item.link} <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
