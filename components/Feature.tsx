export default function Features() {
  const features = [
    {
      title: "AI Generated Itinerary",
      description: "Get a complete travel plan in seconds.",
      icon: "🤖",
    },
    {
      title: "Budget Friendly",
      description: "Travel plans optimized for your budget.",
      icon: "💰",
    },
    {
      title: "Smart Recommendations",
      description: "Discover hotels, food and attractions.",
      icon: "📍",
    },
    {
      title: "Save Time",
      description: "No more hours spent planning vacations.",
      icon: "⏰",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <h2 className="text-4xl font-bold text-center text-blue-600 mb-12">
        Why Choose Us?
      </h2>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition"
          >
            <div className="text-5xl mb-4">{feature.icon}</div>

            <h3 className="text-xl font-semibold mb-2">
              {feature.title}
            </h3>

            <p className="text-gray-600">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}