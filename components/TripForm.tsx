export default function TripForm() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8">

        <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">
          Plan Your Trip
        </h2>

        <div className="space-y-6">

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Destination
            </label>
            <input
              type="text"
              placeholder="e.g. Bali"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Budget (₹)
            </label>
            <input
              type="number"
              placeholder="50000"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Number of Days
            </label>
            <input
              type="number"
              placeholder="5"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition">
            Generate AI Itinerary
          </button>

        </div>

      </div>
    </section>
  );
}