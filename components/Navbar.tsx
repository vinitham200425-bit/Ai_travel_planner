"use client";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">

        {/* Logo */}
        <h1 className="text-3xl font-bold text-blue-600">
          ✈️ AI Travel Planner
        </h1>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-8 text-lg">

          <a href="#home" className="hover:text-blue-600">
            Home
          </a>

          <a href="#features" className="hover:text-blue-600">
            Features
          </a>

          <a href="#pricing" className="hover:text-blue-600">
            Pricing
          </a>

          <a href="#contact" className="hover:text-blue-600">
            Contact
          </a>

        </div>

        {/* Button */}
        <a
          href="#trip-form"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
        >
          Generate Trip
        </a>

      </div>
    </nav>
  );
}