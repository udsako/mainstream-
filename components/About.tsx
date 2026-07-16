export default function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-mainstream-orange">
            Who we are
          </p>
          <h2 className="font-display text-4xl leading-tight text-white sm:text-5xl">
            More than a club.
            <br />A community built on the game.
          </h2>
          <p className="mt-6 text-white/60">
            Mainstream Basketball Club exists to develop players and grow the
            game — through year-round training, combines, tournaments, and
            partnerships with sponsors who believe in what we&apos;re
            building. Whatever&apos;s currently open, you&apos;ll find it
            below.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {[
            { n: "Development", label: "Player Growth", desc: "Training and coaching year-round, not just at events." },
            { n: "Community", label: "The Club", desc: "A home for players, families, and fans of the game." },
            { n: "Competition", label: "Tournaments", desc: "Combines, draft nights, and championships — posted when open." },
            { n: "Partnership", label: "Sponsors", desc: "Businesses and individuals backing the club's growth." },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-md border border-court-line bg-court-panel p-5"
            >
              <span className="font-mono text-[10px] uppercase tracking-widest text-mainstream-orange">{item.n}</span>
              <p className="mt-2 font-display text-lg tracking-wide text-white">
                {item.label}
              </p>
              <p className="mt-1 text-sm text-white/50">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
