import React from "react";

export default function DeleteAccount() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-10">
      <div className="max-w-3xl w-full bg-white shadow-2xl rounded-2xl p-8 md:p-12">
        
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-6 text-center">
          Pure Drop Account Deletion
        </h1>

        {/* Description */}
        <p className="text-gray-700 mb-6 text-lg">
          If you would like to request deletion of your <span className="font-semibold">Pure Drop</span> account and associated personal data, please follow the steps below:
        </p>

        {/* Steps */}
        <div className="bg-blue-50 p-6 rounded-xl mb-8">
          <ol className="list-decimal list-inside space-y-3 text-gray-800">
            <li>
              Send an email to:{" "}
              <a
                href="mailto:bskwater7@gmail.com"
                className="text-blue-600 font-semibold hover:underline"
              >
                bskwater7@gmail.com
              </a>
            </li>
            <li>Use the subject line: <span className="font-semibold">Account Deletion Request</span></li>
            <li>Include your registered phone number and full name.</li>
          </ol>
        </div>

        {/* Processing Time */}
        <div className="mb-8">
          <p className="text-gray-700">
            We will process your request within{" "}
            <span className="font-semibold text-blue-700">7 business days</span>.
          </p>
        </div>

        {/* Data Deleted */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-red-600 mb-3">
            Data Deleted:
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Name</li>
            <li>Phone number</li>
            <li>Address</li>
            <li>Order history</li>
          </ul>
        </div>

        {/* Data Retained */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-yellow-600 mb-3">
            Data Retained (if required by law):
          </h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Transaction records required for tax or legal compliance.</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="text-center border-t pt-6">
          <p className="text-gray-600">
            If you have any questions, please contact us at{" "}
            <a
              href="mailto:bskwater7@gmail.com"
              className="text-blue-600 font-semibold hover:underline"
            >
              bskwater7@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}