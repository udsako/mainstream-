import Image from "next/image";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-16">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 py-12 sm:py-20 md:grid-cols-[1.3fr_1fr] md:py-32">
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-mainstream-orange">
            Mainstream Basketball Club
          </p>
          <h1 className="font-display text-4xl leading-[0.95] tracking-wide text-white sm:text-6xl md:text-7xl lg:text-8xl">
            ONE CLUB.
            <br />
            <span className="jersey-outline">EVERY LEVEL.</span>
          </h1>
          <p className="mt-6 max-w-md text-base text-white/60">
            Mainstream is a basketball club and community — developing
            players, running combines and tournaments, and connecting
            sponsors with the game. Here&apos;s what we&apos;re about, and
            what&apos;s currently open.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#opportunities"
              className="rounded-sm bg-mainstream-orange px-6 py-3 text-sm font-semibold uppercase tracking-widest text-court-black transition hover:bg-mainstream-hot"
            >
              See what&apos;s open
            </a>
            <a
              href="#contact"
              className="rounded-sm border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:border-mainstream-orange hover:text-mainstream-orange"
            >
              Get in touch
            </a>
          </div>
        </div>

        <div className="self-start rounded-md border border-court-line bg-court-panel p-6 shadow-[0_0_40px_rgba(241,90,36,0.06)]">
          <div className="flex justify-center border-b border-court-line pb-6">
            <Image
              src="/logo.jpg"
              alt="Mainstream Basketball Club logo"
              width={140}
              height={140}
              className="rounded-full"
              priority
            />
          </div>

          <ul className="space-y-4 py-6 text-sm text-white/70">
            <li className="flex gap-3">
              <span className="text-mainstream-orange">●</span>
              Player development from grassroots to draft-ready
            </li>
            <li className="flex gap-3">
              <span className="text-mainstream-orange">●</span>
              Combines, draft nights, and a full club championship
            </li>
            <li className="flex gap-3">
              <span className="text-mainstream-orange">●</span>
              Open sponsorship tiers for partners backing the game
            </li>
          </ul>

          <div className="border-t border-court-line pt-3 font-mono text-xs text-white/50">
            Reach out any time — details below
          </div>
        </div>
      </div>
    </section>
  );
}
