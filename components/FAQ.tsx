"use client";

import { ChevronDown, CircleHelp } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "How does the AI Travel Planner work?",
    answer:
      "Enter your destination, travel dates, budget, number of travellers and travel preferences. The AI then creates a personalized day-by-day itinerary.",
  },
  {
    question: "Can I save my generated trips?",
    answer:
      "Yes. After signing in, generated itineraries can be saved and accessed from the My Trips page.",
  },
  {
    question: "Does the planner consider weather?",
    answer:
      "Yes. The trip form can show a weather forecast for the selected travel dates and use it while preparing suitable travel suggestions.",
  },
  {
    question: "Can I download or share my itinerary?",
    answer:
      "Yes. Saved trip details can be shared and downloaded as a PDF.",
  },
  {
    question: "Is the AI Travel Planner free?",
    answer:
      "The core website is currently available as a free version. Optional advanced features may be introduced later.",
  },
  {
    question: "Are the displayed costs always exact?",
    answer:
      "No. Travel, hotel, food and attraction costs are estimates. Always verify current prices before making a booking.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-gray-50 py-20 dark:bg-gray-900 sm:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <CircleHelp size={28} />
          </div>

          <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Frequently asked questions
          </p>

          <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-5xl">
            Questions about the planner
          </h2>
        </div>

        <div className="mt-14 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <article
                key={faq.question}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex((current) =>
                      current === index ? null : index
                    )
                  }
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-gray-900 dark:text-white sm:text-lg">
                    {faq.question}
                  </span>

                  <ChevronDown
                    size={21}
                    className={`shrink-0 text-blue-600 transition-transform duration-200 dark:text-blue-400 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 px-6 py-5 text-gray-600 dark:border-gray-800 dark:text-gray-400">
                    <p className="leading-7">{faq.answer}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}