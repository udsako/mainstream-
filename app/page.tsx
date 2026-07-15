import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CourtDivider from "@/components/CourtDivider";
import About from "@/components/About";
import Opportunities from "@/components/Opportunities";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <CourtDivider />
      <About />
      <CourtDivider />
      <Opportunities />
      <CourtDivider />
      <Gallery />
      <Contact />
      <Footer />
    </main>
  );
}
