export default function Hero() {
  return (
<section className="h-[500px] flex flex-col justify-center items-center bg-gradient-to-b from-blue-50 to-white px-6 pt-20">      <h1 className="text-5xl font-bold text-blue-700">
        AI Travel Planner ✈️
      </h1>

      <p className="mt-4 text-xl text-gray-600 text-center max-w-xl">
        Plan your dream vacation in seconds using Artificial Intelligence.
      </p>

      <button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition">
        Generate My Trip
      </button>
    </section>
  );
}