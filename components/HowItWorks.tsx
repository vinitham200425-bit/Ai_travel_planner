export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Enter Your Trip Details",
      description:
        "Choose your destination, budget, travel days and travel style."
    },
    {
      number: "2",
      title: "AI Creates Your Plan",
      description:
        "Our AI generates a complete day-wise itinerary with estimated costs."
    },
    {
      number: "3",
      title: "Enjoy Your Trip",
      description:
        "Download, share or customize your itinerary anytime."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <h2 className="text-4xl font-bold text-center text-blue-600 mb-14">
        How It Works
      </h2>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 px-6">
        {steps.map((step) => (
          <div
            key={step.number}
            className="text-center bg-gray-50 p-8 rounded-xl shadow hover:shadow-lg transition"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mb-6">
              {step.number}
            </div>

            <h3 className="text-xl font-semibold mb-4">
              {step.title}
            </h3>

            <p className="text-gray-600">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}