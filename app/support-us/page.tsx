import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Support Us",
  description: "Explore ways to support Mainstream Basketball Club through sponsorship, partnerships, and community opportunities.",
};

const routes = [
  { number: "01", title: "Sponsorship", text: "Support player development and club events through a sponsorship conversation tailored to your organisation." },
  { number: "02", title: "Partnerships", text: "Collaborate by contributing services, facilities, expertise, or resources that help the programme deliver." },
  { number: "03", title: "Vendors & experiences", text: "Interested in serving the community at a club event? Get in touch to discuss vendor opportunities." },
];

export default function SupportUsPage() {
  return <main><Navbar /><section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24"><p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-mainstream-orange">Back the game</p><h1 className="max-w-4xl font-display text-5xl leading-[0.95] text-white sm:text-7xl">HELP BUILD WHAT&apos;S <span className="text-mainstream-orange">NEXT.</span></h1><p className="mt-6 max-w-2xl text-white/60">Mainstream grows through people and organisations who believe basketball can create opportunity. There are different ways to contribute, and we would like to hear what you have in mind.</p><div className="mt-12 grid gap-4 md:grid-cols-3">{routes.map((route) => <article key={route.number} className="mc-card rounded-md border border-court-line bg-court-panel p-6"><p className="font-mono text-xs tracking-widest text-mainstream-orange">{route.number}</p><h2 className="mt-5 font-display text-2xl text-white">{route.title}</h2><p className="mt-3 text-sm text-white/55">{route.text}</p></article>)}</div><a href="/contact" className="mc-btn-primary mt-8 inline-flex rounded-sm bg-mainstream-orange px-6 py-3 text-sm font-semibold uppercase tracking-widest text-court-black">Discuss supporting Mainstream <span aria-hidden="true" className="ml-2">↗</span></a></section><Footer /></main>;
}
