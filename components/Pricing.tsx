import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

const freeFeatures = [
  "Generate personalized itineraries",
  "Destination and nearby-place search",
  "Weather forecast for travel dates",
  "Estimated travel budget",
  "Save and manage trips",
  "Download itinerary as PDF",
];

const upcomingFeatures = [
  "More AI trip generations",
  "Advanced itinerary customization",
  "Live hotel and flight information",
  "Collaborative trip planning",
  "Priority support",
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="scroll-mt-20 bg-white py-20 dark:bg-gray-950 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Simple pricing
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Start planning for free
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Use the core travel-planning features today. More advanced
            options can be introduced after launch.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-8 lg:grid-cols-2">
          <article className="rounded-3xl border-2 border-blue-600 bg-white p-8 shadow-xl dark:bg-gray-900 sm:p-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  Free plan
                </p>

                <h3 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  Start exploring
                </h3>
              </div>

              <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                Available now
              </span>
            </div>

            <div className="mt-8 flex items-end gap-2">
              <span className="text-5xl font-black text-gray-900 dark:text-white">
                ₹0
              </span>

              <span className="pb-1 text-gray-500 dark:text-gray-400">
                to get started
              </span>
            </div>

            <ul className="mt-8 space-y-4">
              {freeFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400">
                    <Check size={15} strokeWidth={3} />
                  </span>

                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="#trip-form"
              className="mt-10 flex w-full items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 font-semibold text-white shadow-md transition hover:bg-blue-700"
            >
              Plan My Trip
            </Link>
          </article>

          <article className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 p-8 dark:border-gray-800 dark:bg-gray-900 sm:p-10">
            <div className="absolute right-0 top-0 h-36 w-36 rounded-bl-full bg-blue-100/70 dark:bg-blue-950/40" />

            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-white dark:bg-white dark:text-gray-900">
                <Sparkles size={27} />
              </div>

              <p className="mt-6 text-lg font-semibold text-gray-600 dark:text-gray-400">
                Pro plan
              </p>

              <h3 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                More features coming later
              </h3>

              <p className="mt-4 leading-7 text-gray-600 dark:text-gray-400">
                We will introduce optional premium tools after the main
                website is completed and tested.
              </p>

              <ul className="mt-8 space-y-4">
                {upcomingFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-gray-600 dark:text-gray-400"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      <Check size={15} />
                    </span>

                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled
                className="mt-10 w-full cursor-not-allowed rounded-2xl bg-gray-300 px-6 py-4 font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                Coming Soon
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}