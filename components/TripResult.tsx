type Trip = {
  destination: string;
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

export default function TripResult({ trip }: TripResultProps) {
  return (
    <section className="max-w-5xl mx-auto mt-10 bg-white rounded-3xl shadow-2xl p-10">

      <h2 className="text-4xl font-bold text-blue-600 mb-8">
        🌍 Your AI Trip Plan
      </h2>

      <div className="grid md:grid-cols-2 gap-6 mb-10">

        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="font-semibold text-blue-600">📍 Destination</h4>
          <p>{trip.destination}</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="font-semibold text-blue-600">📅 Days</h4>
          <p>{trip.days}</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="font-semibold text-blue-600">💰 Budget</h4>
          <p>₹{trip.budget}</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="font-semibold text-blue-600">👨‍👩‍👧 Travelers</h4>
          <p>{trip.travelers}</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="font-semibold text-blue-600">🎒 Travel Style</h4>
          <p>{trip.travelStyle}</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="font-semibold text-blue-600">🏨 Hotel Category</h4>
          <p>{trip.hotelCategory}</p>
        </div>

      </div>

      <h3 className="text-3xl font-bold mb-6">
        📅 Day-wise Itinerary
      </h3>

      <div className="space-y-4">

        {trip.itinerary.map((item, index) => (
          <div
            key={index}
            className="border-l-4 border-blue-600 bg-blue-50 rounded-xl p-5 shadow-sm"
          >
            <h4 className="font-bold text-lg mb-2">
              Day {index + 1}
            </h4>

            <p>{item}</p>
          </div>
        ))}

      </div>

    </section>
  );
}