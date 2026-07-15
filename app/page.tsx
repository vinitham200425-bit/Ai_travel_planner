import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import TripForm from "../components/TripForm";
import Feature from "../components/Feature";
import HowItWorks from "../components/HowItWorks";
export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <TripForm />
      <Feature />
      <HowItWorks />
    </>
  );
}