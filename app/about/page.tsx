import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import About from "@/components/About";
import Footer from "@/components/Footer";
import MeetTheTeam from "@/components/MeetTheTeam";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Mainstream Basketball Club, our player-development focus, and the community we are building through basketball.",
};

export default function AboutPage() {
  return <main><Navbar /><section className="mx-auto max-w-6xl px-4 pb-4 pt-16 sm:px-6 sm:pt-24"><p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-mainstream-orange">The club behind the game</p><h1 className="font-display text-5xl text-white sm:text-7xl">ABOUT <span className="text-mainstream-orange">MAINSTREAM.</span></h1><p className="mt-5 max-w-2xl text-white/60">A basketball community focused on player development, competition, and creating meaningful opportunities around the game.</p><div className="mt-8 max-w-4xl space-y-5 text-sm leading-7 text-white/65 sm:text-base"><p>Mainstream is a Nigerian basketball club and community built on one belief: talent deserves a structure to grow in. We are a sport, lifestyle and media brand rooted in African culture, working to build a basketball ecosystem that lasts, starting in Nigeria and reaching across the continent.</p><p>At the grassroots level, we run a development program that gives young players coaching, structure, and a clear pathway to improve. At the top of the club, we field competitive men’s and women’s teams. Players at every stage have a place here, and the club grows with them.</p></div></section><About /><MeetTheTeam /><Footer /></main>;
}
