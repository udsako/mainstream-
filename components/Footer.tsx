import Image from "next/image";

export default function Footer() {
  return (
    <footer id="join" className="border-t border-court-line bg-court-panel">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/logo.jpg"
                alt="Mainstream Basketball Club logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-display text-xl tracking-wide text-white">
                MAINSTREAM<span className="text-mainstream-orange">.</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-white/50">
              Mainstream Basketball Club — one club, every level.
            </p>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-white/40">
              Contact
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li>Program Director: Bamidele Oluwakayode Moses</li>
              <li>
                Email:{" "}
                <a href="mailto:info@mainstreambasketball.com" className="hover:text-mainstream-orange">
                  info@mainstreambasketball.com
                </a>
              </li>
              <li>
                Contact number:{" "}
                <a href="tel:+2348102678560" className="hover:text-mainstream-orange">
                  +234 810 267 8560
                </a>
              </li>
              <li>
                WhatsApp:{" "}
                <a
                  href="https://wa.me/2349017304921"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-mainstream-orange"
                >
                  +234 901 730 4921
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-white/40">
              Join
            </p>
            <a
              href="#opportunities"
              className="mt-4 inline-block rounded-sm bg-mainstream-orange px-5 py-2.5 text-sm font-semibold uppercase tracking-widest text-court-black transition hover:bg-mainstream-hot"
            >
              See what&apos;s open
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-court-line pt-6 text-xs text-white/30 md:flex-row">
          <p>© {new Date().getFullYear()} Mainstream Basketball Club. All rights reserved.</p>
          <p>Combine · Draft Night · Championship</p>
        </div>
      </div>
    </footer>
  );
}
