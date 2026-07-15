import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import TripForm from "../components/TripForm";
import Feature from "../components/Feature";
import HowItWorks from "../components/HowItWorks";
import Testimonials from "../components/Testimonials";
import Pricing from "../components/Pricing";
import FAQ from "../components/FAQ";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <TripForm />
      <Feature />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Contact />
      <Footer />
    </>
  );
}