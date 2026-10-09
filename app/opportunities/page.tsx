import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Opportunities from "@/components/Opportunities";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Opportunities",
  description:
    "Explore current tryouts, tournaments, sponsorship opportunities, and ways to get involved with Mainstream Basketball Club.",
};

export default function OpportunitiesPage() {
  return (
    <main>
      <Navbar />

      <section className="mx-auto max-w-6xl px-4 pb-0 pt-16 sm:px-6 sm:pt-24">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-mainstream-orange">
          Get involved
        </p>

        <h1 className="font-display text-5xl text-white sm:text-7xl">
          OPPORTUNITIES
          <span className="text-mainstream-orange">.</span>
        </h1>

        <p className="mt-5 max-w-2xl text-white/60">
          Find your place in the Mainstream community.
        </p>
      </section>

      <Opportunities />

      <Footer />
    </main>
  );
}