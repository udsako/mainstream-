"use client";

import { useState } from "react";
import Image from "next/image";

const LINKS = [
  { label: "About", href: "#about" },
  { label: "Opportunities", href: "#opportunities" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-court-line bg-court-black/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-3">
          <Image
            src="/logo.jpg"
            alt="Mainstream Basketball Club logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="font-display text-xl tracking-wide">
            MAINSTREAM<span className="text-mainstream-orange">.</span>
          </span>
        </a>

        <div className="hidden items-center gap-10 md:flex">
          <ul className="flex gap-8">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-body text-sm uppercase tracking-widest text-white/70 transition hover:text-mainstream-orange"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            href="#contact"
            className="rounded-sm border border-mainstream-orange px-5 py-2 text-sm font-semibold uppercase tracking-widest text-mainstream-orange transition hover:bg-mainstream-orange hover:text-court-black"
          >
            Get in touch
          </a>
        </div>

        <button
          className="text-white md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          <span className="block h-0.5 w-6 bg-white" />
          <span className="mt-1.5 block h-0.5 w-6 bg-white" />
          <span className="mt-1.5 block h-0.5 w-6 bg-white" />
        </button>
      </nav>

      {open && (
        <ul className="flex flex-col gap-4 border-t border-court-line px-6 py-4 md:hidden">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="font-body text-sm uppercase tracking-widest text-white/70"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
