import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Mainstream Basketball Club about player development, events, sponsorship, and other enquiries.",
};

export default function ContactPage() {
  return <main><Navbar /><section className="mx-auto max-w-6xl px-4 pb-0 pt-16 sm:px-6 sm:pt-24"><p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-mainstream-orange">Start a conversation</p><h1 className="font-display text-5xl text-white sm:text-7xl">LET&apos;S TALK<span className="text-mainstream-orange">.</span></h1></section><Contact /><Footer /></main>;
}
