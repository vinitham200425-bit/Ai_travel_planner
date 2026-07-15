export default function Testimonials() {
  return (
    <section className="py-24 bg-blue-50">
      <h2 className="text-5xl font-bold text-center text-blue-600 mb-16">
        What Travelers Say
      </h2>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-6">

        <div className="bg-white rounded-xl shadow-lg p-8">
          <p className="italic">
            "Planning my vacation took less than two minutes!"
          </p>

          <h3 className="font-bold mt-6">★★★★★</h3>

          <p className="text-gray-600">Priya - Chennai</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <p className="italic">
            "The itinerary was surprisingly accurate."
          </p>

          <h3 className="font-bold mt-6">★★★★★</h3>

          <p className="text-gray-600">Rahul - Bangalore</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <p className="italic">
            "Saved me hours of travel planning."
          </p>

          <h3 className="font-bold mt-6">★★★★★</h3>

          <p className="text-gray-600">Ananya - Hyderabad</p>
        </div>

      </div>
    </section>
  );
}