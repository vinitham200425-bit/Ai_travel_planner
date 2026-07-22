import {
  Bot,
  CalendarCheck,
  CloudSun,
  IndianRupee,
  MapPinned,
  Save,
} from "lucide-react";

const features = [
  {
    title: "AI-Generated Itinerary",
    description:
      "Receive a complete day-by-day travel plan based on your selected destination and preferences.",
    icon: Bot,
  },
  {
    title: "Budget-Friendly Planning",
    description:
      "Get recommendations designed around your total budget, number of travellers and hotel preference.",
    icon: IndianRupee,
  },
  {
    title: "Smart Destination Search",
    description:
      "Search destinations worldwide and discover nearby tourist attractions worth visiting.",
    icon: MapPinned,
  },
  {
    title: "Weather Forecast",
    description:
      "Check expected weather for your travel dates before generating your itinerary.",
    icon: CloudSun,
  },
  {
    title: "Save Your Trips",
    description:
      "Keep generated plans inside your account and access them whenever you need them.",
    icon: Save,
  },
  {
    title: "Plan in Minutes",
    description:
      "Avoid hours of manual research and create your travel plan through one simple form.",
    icon: CalendarCheck,
  },
];

export default function Feature() {
  return (
    <section
      id="features"
      className="scroll-mt-20 bg-white py-20 dark:bg-gray-950 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Everything you need
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Plan smarter and travel with confidence
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-gray-400">
            From choosing a destination to saving your final itinerary,
            the planner keeps everything simple and organised.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-800"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950/50 dark:text-blue-400">
                  <Icon size={27} />
                </div>

                <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}