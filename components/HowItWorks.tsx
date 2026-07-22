import {
  CalendarDays,
  ClipboardCheck,
  PlaneTakeoff,
  Sparkles,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Choose Your Destination",
    description:
      "Select a country, search for your destination and explore nearby tourist places.",
    icon: PlaneTakeoff,
  },
  {
    number: "02",
    title: "Enter Your Trip Details",
    description:
      "Provide your travel dates, budget, number of travellers, travel style and hotel category.",
    icon: CalendarDays,
  },
  {
    number: "03",
    title: "Let AI Create Your Plan",
    description:
      "The planner prepares a personalized day-wise itinerary with attractions, food and estimated expenses.",
    icon: Sparkles,
  },
  {
    number: "04",
    title: "Save and Manage Your Trip",
    description:
      "Review your itinerary, save it to your account, share it or download it for later.",
    icon: ClipboardCheck,
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 bg-gray-50 py-20 dark:bg-gray-900 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Simple process
          </p>

          <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-5xl">
            How it works
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Create your complete travel itinerary through four easy steps.
          </p>
        </div>

        <div className="relative mt-16 grid gap-7 md:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-[12.5%] right-[12.5%] top-9 hidden h-px bg-blue-200 dark:bg-blue-900 lg:block" />

          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <article
                key={step.number}
                className="relative rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-950"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
                    <Icon size={28} />
                  </div>

                  <span className="text-4xl font-black text-gray-100 dark:text-gray-800">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-7 text-xl font-bold text-gray-900 dark:text-white">
                  {step.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <a
            href="#trip-form"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 font-semibold text-white shadow-md transition hover:bg-blue-700"
          >
            Create My Trip
            <PlaneTakeoff size={19} />
          </a>
        </div>
      </div>
    </section>
  );
}