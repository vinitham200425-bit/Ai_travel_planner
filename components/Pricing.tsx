export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-gray-100">
      <h2 className="text-5xl font-bold text-center text-blue-600 mb-16">
        Pricing Plans
      </h2>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 px-6">

        {/* Free Plan */}
        <div className="bg-white rounded-xl shadow-lg p-10 text-center">
          <h3 className="text-3xl font-bold mb-4">Free</h3>

          <p className="text-5xl font-bold text-blue-600 mb-8">
            ₹0
          </p>

          <ul className="space-y-4 text-lg">
            <li>✅ 5 AI Trips / Month</li>
            <li>✅ Basic Itinerary</li>
            <li>✅ Estimated Cost</li>
            <li>✅ PDF Download</li>
          </ul>

          <button className="mt-10 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700">
            Get Started
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-blue-600 text-white rounded-xl shadow-xl p-10 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Pro ⭐
          </h3>

          <p className="text-5xl font-bold mb-8">
            ₹299
            <span className="text-xl"> / month</span>
          </p>

          <ul className="space-y-4 text-lg">
            <li>✅ Unlimited Trips</li>
            <li>✅ Smart AI Recommendations</li>
            <li>✅ Hotel Suggestions</li>
            <li>✅ Restaurant Suggestions</li>
            <li>✅ Export PDF</li>
            <li>✅ Priority Support</li>
          </ul>

          <button className="mt-10 bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100">
            Upgrade Now
          </button>
        </div>

      </div>
    </section>
  );
}