import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8 md:p-12">
        
        <h1 className="text-3xl md:text-4xl font-bold text-sky-700 mb-6">
          Privacy Policy
        </h1>

        <p className="text-gray-600 mb-6">
          <strong>Last updated:</strong> 19 February 2026
        </p>

        <p className="text-gray-700 leading-relaxed mb-6">
          BSK Water operates this mobile application and website. We are committed 
          to protecting your privacy and ensuring the security of your personal information.
        </p>

        {/* Information We Collect */}
        <h2 className="text-2xl font-semibold text-sky-600 mt-8 mb-4">
          1. Information We Collect
        </h2>

        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Full Name</li>
          <li>Phone Number</li>
          <li>Delivery Address</li>
        </ul>

        {/* How We Use */}
        <h2 className="text-2xl font-semibold text-sky-600 mt-8 mb-4">
          2. How We Use Your Information
        </h2>

        <p className="text-gray-700 leading-relaxed mb-4">
          We use your information to:
        </p>

        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Process and deliver your water orders</li>
          <li>Communicate order updates</li>
          <li>Provide customer support</li>
          <li>Improve our services</li>
        </ul>

        {/* Data Security */}
        <h2 className="text-2xl font-semibold text-sky-600 mt-8 mb-4">
          3. Data Security
        </h2>

        <p className="text-gray-700 leading-relaxed">
          We use secure technologies including HTTPS encryption to protect 
          your personal information. We do not sell or share your personal 
          data with third parties for marketing purposes.
        </p>

        {/* User Rights */}
        <h2 className="text-2xl font-semibold text-sky-600 mt-8 mb-4">
          4. Your Rights
        </h2>

        <p className="text-gray-700 leading-relaxed">
          You may request access, correction, or deletion of your personal 
          information by contacting us at the email below.
        </p>

        {/* Contact */}
        <h2 className="text-2xl font-semibold text-sky-600 mt-8 mb-4">
          5. Contact Us
        </h2>

        <p className="text-gray-700">
          📧 Email:{" "}
          <a
            href="mailto:bskwater7@gmail.com"
            className="text-sky-600 font-medium hover:underline"
          >
            bskwater7@gmail.com   
          </a>
        </p>

      </div>
    </div>
  );
}
