export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">

        {/* Logo */}
        <div className="text-2xl font-bold text-blue-600">
          ✈️ AI Travel Planner
        </div>

        {/* Navigation Links */}
        <ul className="hidden md:flex gap-8 text-gray-700 font-medium">
          <li className="cursor-pointer hover:text-blue-600">Home</li>
          <li className="cursor-pointer hover:text-blue-600">Features</li>
          <li className="cursor-pointer hover:text-blue-600">Pricing</li>
          <li className="cursor-pointer hover:text-blue-600">Contact</li>
        </ul>

        {/* Button */}
        <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
          Generate Trip
        </button>

      </div>
    </nav>
  );
}