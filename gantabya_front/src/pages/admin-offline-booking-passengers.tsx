import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../lib/api';
import { API_ENDPOINTS } from '../config';
import { FaArrowLeft, FaUser, FaCheckCircle, FaDownload, FaEnvelope, FaPhone, FaWhatsapp } from 'react-icons/fa';

interface Passenger {
  seatId: string;
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  email: string;
}

const AdminOfflineBookingPassengers: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as {
    selectedSeats: string[];
    fromStopId: string;
    toStopId: string;
    boardingPointId: string;
    droppingPointId: string;
    tripDate: string;
  };

  const [passengers, setPassengers] = useState<Passenger[]>(() =>
    routeState?.selectedSeats?.map((seatId) => ({
      seatId,
      name: '',
      age: 0,
      gender: 'MALE' as const,
      phone: '',
      email: '',
    })) || []
  );

  const [adminNotes, setAdminNotes] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [bookingGroupId, setBookingGroupId] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handlePassengerChange = (index: number, field: keyof Passenger, value: any) => {
    setPassengers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const handleSubmit = async () => {
    // Validate all fields
    const invalidPassenger = passengers.find(
      (p) => !p.name || p.age <= 0 || p.age > 120
    );

    if (invalidPassenger) {
      setError('Please fill in all required passenger details correctly');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await api.post(API_ENDPOINTS.ADMIN_OFFLINE_BOOKING, {
        tripId,
        fromStopId: routeState.fromStopId,
        toStopId: routeState.toStopId,
        seatIds: routeState.selectedSeats,
        passengers: passengers.map((p) => ({
          seatId: p.seatId,
          name: p.name,
          age: Number(p.age),
          gender: p.gender,
          phone: p.phone || undefined,
          email: p.email || undefined,
        })),
        boardingPointId: routeState.boardingPointId,
        droppingPointId: routeState.droppingPointId,
        adminNotes,
        customerPhone: customerPhone || undefined,
        customerEmail: customerEmail || undefined,
      });

      if (response.data) {
        setBookingGroupId(response.data.bookingGroupId);
        setEmailSent(response.data.emailSent || false);
        setSuccess(true);
      }
    } catch (err: any) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.errorMessage || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!bookingGroupId) return;
    try {
      const response = await api.get(`/user/booking/download-ticket/${bookingGroupId}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${bookingGroupId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download ticket PDF');
    }
  };

  if (success) {
    return (
      <AdminLayout>
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-12 text-center">
            <FaCheckCircle className="text-6xl text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Booking Successful!
            </h2>
            <p className="text-green-700 mb-4">
              Offline booking created successfully. Payment marked as COD.
            </p>
            
            {emailSent && customerEmail && (
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 mb-4">
                <p className="text-blue-700 flex items-center justify-center gap-2">
                  <FaEnvelope className="text-blue-500" />
                  Ticket PDF sent to: <strong>{customerEmail}</strong>
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <button
                onClick={handleDownloadPdf}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                <FaDownload />
                Download Ticket PDF
              </button>
              <button
                onClick={() => navigate('/admin/offline-booking', { state: { bookingSuccess: true } })}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
              >
                Book Another Ticket
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Seat Selection
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Passenger Details</h1>
          <p className="text-gray-600">Enter details for {passengers.length} passenger(s)</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Passenger Forms */}
        <div className="space-y-4">
          {passengers.map((passenger, index) => (
            <div key={passenger.seatId} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FaUser className="text-blue-600" />
                <h3 className="font-bold text-lg">
                  Passenger {index + 1} (Seat: {passenger.seatId.slice(0, 8)})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={passenger.name}
                    onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={passenger.age || ''}
                    onChange={(e) => handlePassengerChange(index, 'age', parseInt(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter age"
                    min="1"
                    max="120"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={passenger.gender}
                    onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={passenger.phone}
                    onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={passenger.email}
                    onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Customer Contact Info - For sending ticket */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <FaUser className="text-blue-600" />
            Customer Contact Information
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Optional: Enter customer contact to send ticket PDF via email. Phone/WhatsApp for future integration.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaPhone className="text-gray-500" />
                Phone Number
                <span className="text-xs text-gray-400">(Optional - for WhatsApp)</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 9841234567"
              />
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <FaWhatsapp className="text-green-500" />
                Will be used for WhatsApp integration later
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaEnvelope className="text-gray-500" />
                Email Address
                <span className="text-xs text-gray-400">(Optional)</span>
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="customer@example.com"
              />
              <p className="text-xs text-gray-400 mt-1">
                If provided, ticket PDF will be sent to this email
              </p>
            </div>
          </div>
        </div>

        {/* Admin Notes */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="font-bold text-lg mb-4">Admin Notes (Optional)</h3>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Add any notes about this booking (e.g., payment amount received, customer details, etc.)"
          />
        </div>

        {/* Submit Button */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-bold text-lg">Cash on Delivery (COD)</p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Booking...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  <span>Confirm Booking</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOfflineBookingPassengers;
