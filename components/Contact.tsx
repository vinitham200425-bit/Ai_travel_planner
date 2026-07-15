export default function Contact() {
  return (
    <section
      id="contact"
      className="py-20 bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
    >
      <div className="max-w-6xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center mb-4">
          Contact Us
        </h2>

        <p className="text-center text-lg mb-12">
          Have questions or suggestions? We'd love to hear from you.
        </p>

        <div className="grid md:grid-cols-2 gap-10">

          {/* Contact Details */}
          <div className="space-y-6">

            <div>
              <h3 className="text-xl font-semibold">📧 Email</h3>
              <p>support@aitravelplanner.com</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold">📞 Phone</h3>
              <p>+91 8778083559</p>
              <p>+91 7200255248</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold">📍 Address</h3>
              <p>Chennai, Tamil Nadu, India</p>
            </div>

          </div>

          {/* Contact Form */}
          <form className="bg-white rounded-2xl p-8 text-black shadow-xl">

            <input
              type="text"
              placeholder="Your Name"
              className="w-full border rounded-lg p-3 mb-4"
            />

            <input
              type="email"
              placeholder="Email Address"
              className="w-full border rounded-lg p-3 mb-4"
            />

            <textarea
              rows={5}
              placeholder="Your Message"
              className="w-full border rounded-lg p-3 mb-4"
            />

            <button
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              Send Message
            </button>

          </form>

        </div>

      </div>
    </section>
  );
}