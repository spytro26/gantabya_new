import { Link } from 'react-router-dom';
import { UserNavbar } from '../components/UserNavbar';
import { Footer } from '../components/Footer';
import { FaFileContract, FaExclamationTriangle, FaShieldAlt, FaCreditCard, FaBan, FaCalendarTimes, FaEnvelope } from 'react-icons/fa';

export function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-100 p-4 rounded-full">
              <FaFileContract className="text-4xl text-indigo-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
          <p className="text-gray-500 text-sm">Last updated: April 2025 &nbsp;|&nbsp; GoGantabya Bus Booking Platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md divide-y divide-gray-100">

          {/* 1. Acceptance */}
          <section className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaShieldAlt className="text-indigo-500" /> 1. Acceptance of Terms
            </h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using the GoGantabya platform (website, mobile app, or any associated service), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services. These terms apply to all users including passengers, visitors, and registered account holders.
            </p>
          </section>

          {/* 2. No Refund Policy */}
          <section className="p-6 sm:p-8 bg-red-50">
            <h2 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
              <FaBan className="text-red-500" /> 2. No Refund Policy
            </h2>
            <div className="bg-red-100 border border-red-300 rounded-xl p-4 mb-4">
              <p className="text-red-800 font-semibold text-sm">
                IMPORTANT: All ticket purchases are strictly non-refundable once the booking is confirmed.
              </p>
            </div>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
              <li>Once a booking is confirmed and payment is processed, no refunds will be issued under any circumstances.</li>
              <li>Cancellations made by the passenger after booking confirmation will not entitle the passenger to any refund.</li>
              <li>In the unlikely event of a bus cancellation by the operator, GoGantabya will make reasonable efforts to notify passengers. Any resolution in such cases will be at the sole discretion of GoGantabya.</li>
              <li>Partial payments or promotional discounts applied at the time of booking are also non-refundable.</li>
              <li>GoGantabya is not responsible for any losses arising from a passenger's inability to travel due to personal reasons, medical emergencies, or force majeure events.</li>
            </ul>
          </section>

          {/* 3. Booking for Future Dates Only */}
          <section className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaCalendarTimes className="text-indigo-500" /> 3. Bookings for Future Travel Only
            </h2>
            <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-4">
              <p className="text-yellow-800 font-semibold text-sm">
                Tickets can only be booked for upcoming (future) trips. Bookings for past dates are not permitted.
              </p>
            </div>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
              <li>GoGantabya only allows ticket bookings for trips scheduled in the future.</li>
              <li>Attempting to book a ticket for a trip that has already departed or is on a past date is not allowed and will be rejected by the system.</li>
              <li>It is the passenger's responsibility to verify the correct travel date and time before completing the booking.</li>
              <li>No claim or refund will be entertained for bookings made for incorrect dates due to passenger error.</li>
            </ul>
          </section>

          {/* 4. User Responsibilities */}
          <section className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaShieldAlt className="text-indigo-500" /> 4. User Responsibilities
            </h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
              <li>You must provide accurate and complete personal information while registering or booking a ticket.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>All passenger details entered at the time of booking (name, age, gender, ID) must be accurate. Incorrect details may result in denial of boarding by the bus operator.</li>
              <li>You must carry a valid government-issued ID proof that matches the name on the ticket at the time of travel.</li>
              <li>Passengers must report to the boarding point at least 15 minutes before the scheduled departure. GoGantabya is not responsible for missed trips due to late arrival.</li>
              <li>Any misuse of the platform, including attempting to make fraudulent bookings, will result in immediate account suspension.</li>
            </ul>
          </section>

          {/* 5. Payment Terms */}
          <section className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaCreditCard className="text-indigo-500" /> 5. Payment Terms
            </h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
              <li>GoGantabya supports payments in Indian Rupees (INR) via Razorpay and Nepali Rupees (NPR) via eSewa.</li>
              <li>All online payments are processed through secure third-party payment gateways. GoGantabya does not store your card or payment details.</li>
              <li>The ticket price displayed at the time of booking is the final price. Additional convenience fees or taxes, if any, will be clearly shown before payment confirmation.</li>
              <li>In case of a payment failure, please do not attempt multiple payments without verifying the status of your previous transaction. Contact us at <a href="mailto:contact@gogantabya.com" className="text-indigo-600 underline">contact@gogantabya.com</a> for payment-related issues.</li>
              <li>GoGantabya is not liable for any additional charges levied by your bank or payment provider.</li>
            </ul>
          </section>

          {/* 6. Operator Liability */}
          <section className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaExclamationTriangle className="text-indigo-500" /> 6. Limitation of Liability
            </h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
              <li>GoGantabya acts as a ticketing intermediary between passengers and bus operators. We are not directly responsible for the conduct, safety, or quality of service provided by bus operators.</li>
              <li>We are not liable for delays, route changes, accidents, or any other incidents that occur during travel.</li>
              <li>GoGantabya's liability in any claim shall not exceed the amount paid for the ticket in question.</li>
              <li>We do not guarantee uninterrupted or error-free access to the platform and may perform maintenance without prior notice.</li>
            </ul>
          </section>

          {/* 7. Privacy */}
          <section className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaShieldAlt className="text-indigo-500" /> 7. Privacy & Data
            </h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
              <li>GoGantabya collects personal information (name, email, phone, ID details) solely for the purpose of booking and travel services.</li>
              <li>Your data will not be sold or shared with third parties except as required for booking fulfillment or by law.</li>
              <li>We use cookies to improve your experience on our platform. By continuing to use the site, you consent to our use of cookies.</li>
            </ul>
          </section>

          {/* 8. Account Termination */}
          <section className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaBan className="text-indigo-500" /> 8. Account Suspension & Termination
            </h2>
            <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
              <li>GoGantabya reserves the right to suspend or terminate any account that violates these Terms and Conditions without prior notice.</li>
              <li>Users found engaging in fraudulent activity, abuse of offers/coupons, or harassment will be permanently banned.</li>
              <li>You may request deletion of your account by contacting us at <a href="mailto:contact@gogantabya.com" className="text-indigo-600 underline">contact@gogantabya.com</a>.</li>
            </ul>
          </section>

          {/* 9. Governing Law */}
          <section className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaShieldAlt className="text-indigo-500" /> 9. Governing Law
            </h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms and Conditions are governed by and construed in accordance with the applicable laws of Nepal and India, depending on the jurisdiction of the transaction. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in the relevant jurisdiction.
            </p>
          </section>

          {/* 10. Changes to Terms */}
          <section className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaFileContract className="text-indigo-500" /> 10. Changes to These Terms
            </h2>
            <p className="text-gray-600 leading-relaxed">
              GoGantabya reserves the right to modify these Terms and Conditions at any time. Updated terms will be posted on this page with a revised date. Continued use of the platform after any changes constitutes your acceptance of the new terms. We encourage you to review these terms periodically.
            </p>
          </section>

          {/* Contact */}
          <section className="p-6 sm:p-8 bg-indigo-50 rounded-b-2xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaEnvelope className="text-indigo-500" /> Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              For any questions, concerns, or support regarding these Terms and Conditions or your booking, please reach out to us:
            </p>
            <a
              href="https://mail.google.com/mail/?view=cm&to=contact@gogantabya.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition font-medium"
            >
              <FaEnvelope />
              contact@gogantabya.com
            </a>
          </section>
        </div>

        <div className="text-center mt-8">
          <Link to="/home" className="text-indigo-600 hover:underline text-sm">
            &larr; Back to Home
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
