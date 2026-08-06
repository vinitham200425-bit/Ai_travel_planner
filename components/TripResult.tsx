"use client";

type DayPlan = {
  day: number;
  date: string;
  location: string;
  morning: string[];
  afternoon: string[];
  evening: string[];
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  transport: string;
  stay: string;
  weatherAdvice: string;
  optional: string[];
  estimatedDailyCost: string;
};

type StructuredItinerary = {
  tripOverview: {
    title: string;
    route: string[];
    summary: string;
    feasibilityNote: string;
  };
  days: DayPlan[];
  hotels: Array<{
    nameOrArea: string;
    category: string;
    approximateNightlyCost: string;
    bestFor: string;
  }>;
  budget: {
    accommodation: string;
    intercityTransport: string;
    localTransport: string;
    food: string;
    attractions: string;
    miscellaneous: string;
    estimatedTotal: string;
    budgetNote: string;
  };
  transportTips: string[];
  mustTryFood: string[];
  packingChecklist: string[];
  safetyTips: string[];
  bookingReminders: string[];
  quickTips: string[];
};

type Trip = {
  destination: string;
  country?: string;
  days: number;
  budget: string;
  travelers: string;
  travelStyle: string;
  hotelCategory: string;
  itinerary: string[];
};

type TripResultProps = {
  trip: Trip;
};

function parseItinerary(
  itinerary: string[]
): StructuredItinerary | null {
  const raw = itinerary.join("\n").trim();

  try {
    return JSON.parse(raw) as StructuredItinerary;
  } catch {
    return null;
  }
}

function List({
  items,
  emptyText = "No details available.",
}: {
  items: string[];
  emptyText?: string;
}) {
  if (!items.length) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {emptyText}
      </p>
    );
  }

  return (
    <ul className="space-y-2 text-sm leading-6 text-gray-700 dark:text-gray-200">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TripResult({
  trip,
}: TripResultProps) {
  const structured = parseItinerary(trip.itinerary);

  if (!structured) {
    return (
      <section className="mx-auto mt-10 max-w-5xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 sm:p-10">
        <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          🌍 Your AI Trip Plan
        </h2>

        <div className="mt-6 whitespace-pre-wrap rounded-2xl bg-blue-50 p-6 leading-7 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
          {trip.itinerary.join("\n")}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto mt-10 max-w-6xl space-y-8">
      <div className="rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 sm:p-10">
        <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 sm:text-4xl">
          🌍 {structured.tripOverview.title || "Your AI Trip Plan"}
        </h2>

        <p className="mt-4 max-w-4xl leading-7 text-gray-600 dark:text-gray-300">
          {structured.tripOverview.summary}
        </p>

        {structured.tripOverview.feasibilityNote && (
          <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            ⚠️ {structured.tripOverview.feasibilityNote}
          </p>
        )}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard title="Destination" value={trip.destination} />
          <SummaryCard title="Duration" value={`${trip.days} days`} />
          <SummaryCard title="Budget" value={`₹${trip.budget}`} />
          <SummaryCard title="Travelers" value={trip.travelers} />
          <SummaryCard title="Style" value={trip.travelStyle} />
          <SummaryCard title="Hotel" value={trip.hotelCategory} />
        </div>

        {structured.tripOverview.route.length > 0 && (
          <div className="mt-6 rounded-2xl bg-slate-50 p-5 dark:bg-gray-800">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Recommended route
            </p>
            <p className="mt-2 font-bold text-gray-900 dark:text-white">
              {structured.tripOverview.route.join(" → ")}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-5">
        {structured.days.map((day) => (
          <article
            key={day.day}
            className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900 sm:p-8"
          >
            <div className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-5 dark:border-gray-800 sm:flex-row">
              <div>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  Day {day.day} · {day.date}
                </p>
                <h3 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {day.location}
                </h3>
              </div>

              <span className="h-fit rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-300">
                {day.estimatedDailyCost}
              </span>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              <PlanBlock title="🌅 Morning" items={day.morning} />
              <PlanBlock title="☀️ Afternoon" items={day.afternoon} />
              <PlanBlock title="🌙 Evening" items={day.evening} />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoBlock
                title="🍽 Meals"
                lines={[
                  `Breakfast: ${day.meals.breakfast}`,
                  `Lunch: ${day.meals.lunch}`,
                  `Dinner: ${day.meals.dinner}`,
                ]}
              />
              <InfoBlock
                title="🚖 Transport"
                lines={[day.transport]}
              />
              <InfoBlock title="🏨 Stay" lines={[day.stay]} />
              <InfoBlock
                title="🌦 Weather"
                lines={[day.weatherAdvice]}
              />
            </div>

            {day.optional.length > 0 && (
              <div className="mt-5 rounded-2xl border border-dashed border-purple-300 bg-purple-50 p-5 dark:border-purple-900 dark:bg-purple-950/30">
                <h4 className="font-bold text-purple-800 dark:text-purple-200">
                  Optional
                </h4>
                <div className="mt-3">
                  <List items={day.optional} />
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="🏨 Hotel Suggestions">
          <div className="space-y-4">
            {structured.hotels.map((hotel, index) => (
              <div
                key={`${hotel.nameOrArea}-${index}`}
                className="rounded-2xl bg-slate-50 p-4 dark:bg-gray-800"
              >
                <p className="font-bold text-gray-900 dark:text-white">
                  {hotel.nameOrArea}
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {hotel.category} · {hotel.approximateNightlyCost}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Best for: {hotel.bestFor}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="💰 Approximate Budget">
          <div className="space-y-3">
            <BudgetRow label="Accommodation" value={structured.budget.accommodation} />
            <BudgetRow label="Intercity transport" value={structured.budget.intercityTransport} />
            <BudgetRow label="Local transport" value={structured.budget.localTransport} />
            <BudgetRow label="Food" value={structured.budget.food} />
            <BudgetRow label="Attractions" value={structured.budget.attractions} />
            <BudgetRow label="Miscellaneous" value={structured.budget.miscellaneous} />
            <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
              <BudgetRow label="Estimated total" value={structured.budget.estimatedTotal} strong />
            </div>
            <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950/30 dark:text-blue-200">
              {structured.budget.budgetNote}
            </p>
          </div>
        </SectionCard>

        <SectionCard title="🚖 Transport Tips">
          <List items={structured.transportTips} />
        </SectionCard>

        <SectionCard title="🍽 Must-Try Food">
          <List items={structured.mustTryFood} />
        </SectionCard>

        <SectionCard title="🎒 Packing Checklist">
          <List items={structured.packingChecklist} />
        </SectionCard>

        <SectionCard title="🛡 Safety Tips">
          <List items={structured.safetyTips} />
        </SectionCard>

        <SectionCard title="🎟 Booking Reminders">
          <List items={structured.bookingReminders} />
        </SectionCard>

        <SectionCard title="⭐ Quick Local Tips">
          <List items={structured.quickTips} />
        </SectionCard>
      </div>
    </section>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-blue-50 p-4 dark:bg-blue-950/30">
      <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">
        {title}
      </p>
      <p className="mt-1 font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function PlanBlock({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5 dark:bg-gray-800">
      <h4 className="font-bold text-gray-900 dark:text-white">
        {title}
      </h4>
      <div className="mt-3">
        <List items={items} />
      </div>
    </div>
  );
}

function InfoBlock({
  title,
  lines,
}: {
  title: string;
  lines: string[];
}) {
  return (
    <div className="rounded-2xl border border-gray-100 p-5 dark:border-gray-700">
      <h4 className="font-bold text-gray-900 dark:text-white">
        {title}
      </h4>
      <div className="mt-3 space-y-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
        {lines.map((line, index) => (
          <p key={`${line}-${index}`}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
        {title}
      </h3>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function BudgetRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${
        strong ? "font-bold text-gray-900 dark:text-white" : "text-sm text-gray-600 dark:text-gray-300"
      }`}
    >
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
