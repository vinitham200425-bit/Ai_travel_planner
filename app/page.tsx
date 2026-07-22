import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TripForm from "@/components/TripForm";
import Feature from "@/components/Feature";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
      <Navbar />

      <Hero />

      <section
        id="trip-form"
        className="scroll-mt-24 bg-gray-50 py-16 dark:bg-gray-900"
      >
        <TripForm />
      </section>

      <Feature />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}