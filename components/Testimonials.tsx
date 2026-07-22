import {
  Clock3,
  MapPinned,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const benefits = [
  {
    title: "Faster Trip Planning",
    description:
      "Create a structured travel plan in minutes instead of spending hours researching different websites.",
    icon: Clock3,
  },
  {
    title: "Personalized Suggestions",
    description:
      "Receive recommendations based on your destination, budget, travel dates and preferred travel style.",
    icon: Sparkles,
  },
  {
    title: "Everything in One Place",
    description:
      "Keep destinations, nearby attractions, weather information and your itinerary together.",
    icon: MapPinned,
  },
];

export default function Testimonials() {
  return (
    <section className="bg-blue-50 py-20 dark:bg-gray-900 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
            <ShieldCheck size={28} />
          </div>

          <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Why travellers will love it
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Travel planning made simple
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Spend less time researching and more time enjoying your journey.
          </p>
        </div>

        <div className="mt-14 grid gap-7 md:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <article
                key={benefit.title}
                className="rounded-3xl border border-blue-100 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-950"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  <Icon size={27} />
                </div>

                <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">
                  {benefit.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-600 dark:text-gray-400">
                  {benefit.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}