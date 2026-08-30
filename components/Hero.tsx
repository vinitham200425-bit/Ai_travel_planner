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
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "AITrips",
    url: "https://www.aitrips.in",
    applicationCategory: "TravelApplication",
    operatingSystem: "Web",
    description:
      "AITrips is an AI travel planner and itinerary generator that creates personalized day-by-day travel plans based on destination, budget, dates, travelers and travel style.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <main className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
        <Navbar />

        <Hero />

        <section
          aria-labelledby="ai-travel-planner-heading"
          className="bg-white px-4 py-14 dark:bg-gray-950 sm:px-6"
        >
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              AI-Powered Trip Planning
            </p>

            <h2
              id="ai-travel-planner-heading"
              className="mt-3 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl"
            >
              AI Travel Planner & Itinerary Generator
            </h2>

            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-gray-600 dark:text-gray-300 sm:text-lg">
              AITrips helps you create personalized travel itineraries
              based on your destination, travel dates, budget, number of
              travelers and travel style. Build a practical day-by-day
              AI travel plan with attractions, hotel suggestions,
              transportation guidance, food ideas, weather information
              and estimated costs.
            </p>

            <div className="mt-8 grid gap-5 text-left sm:grid-cols-3">
              <article className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Personalized AI Itinerary
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  Generate an AI travel itinerary tailored to your
                  destination, budget, trip duration and preferences.
                </p>
              </article>

              <article className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Day-by-Day Trip Planner
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  Organize attractions, meals, hotels and local
                  transportation into a practical daily travel plan.
                </p>
              </article>

              <article className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Travel Planning Made Simple
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  Plan trips across India and international
                  destinations with one easy AI trip planner.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          id="trip-form"
          aria-label="AI itinerary generator"
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
    </>
  );
}