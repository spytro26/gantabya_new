import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../lib/api';
import { API_ENDPOINTS } from '../config';
import { FaArrowLeft, FaChair, FaBed, FaChevronUp, FaChevronDown, FaUser, FaCheckCircle, FaDownload, FaEnvelope, FaPhone } from 'react-icons/fa';
import { GiSteeringWheel } from 'react-icons/gi';

interface Seat {
  id: string;
  seatNumber: string;
  row: number;
  column: number;
  level: 'LOWER' | 'UPPER';
  type: 'SEATER' | 'SLEEPER';
  isBooked: boolean;
  price: number;
}

interface PassengerInfo {
  seatId: string;
  seatNumber: string;
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  email: string;
}

interface BusInfo {
  bus: {
    name: string;
    busNumber: string;
    type: string;
  };
  route: {
    fromStop: { name: string; stopIndex: number };
    toStop: { name: string; stopIndex: number };
    isReturnTrip: boolean;
  };
  seats: Seat[];
  boardingPoints: Array<{ id: string; name: string }>;
  droppingPoints: Array<{ id: string; name: string }>;
}

const AdminOfflineBookingSeats: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as {
    tripDate?: string;
    fromStopId?: string;
    toStopId?: string;
    isReturnTrip?: boolean;
    busName?: string;
    busNumber?: string;
  };

  const [busInfo, setBusInfo] = useState<BusInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [currentDeck, setCurrentDeck] = useState<'LOWER' | 'UPPER'>('LOWER');
  const [selectedBoardingPoint, setSelectedBoardingPoint] = useState('');
  const [selectedDroppingPoint, setSelectedDroppingPoint] = useState('');

  // Passenger details state
  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingGroupId, setBookingGroupId] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (tripId && routeState?.fromStopId && routeState?.toStopId) {
      fetchBusInfo();
    } else if (tripId && !routeState?.fromStopId) {
      setError('Missing route information. Please go back and select from/to stops.');
      setLoading(false);
    }
  }, [tripId]);

  const fetchBusInfo = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get(`${API_ENDPOINTS.GET_TRIP_SEATS}/${tripId}/seats`, {
        params: {
          fromStopId: routeState.fromStopId,
          toStopId: routeState.toStopId,
          isReturnTrip: routeState.isReturnTrip || false,
        },
      });

      if (response.data) {
        setBusInfo(response.data);
        if (response.data.boardingPoints?.length > 0) {
          setSelectedBoardingPoint(response.data.boardingPoints[0].id);
        }
        if (response.data.droppingPoints?.length > 0) {
          setSelectedDroppingPoint(response.data.droppingPoints[0].id);
        }
      }
    } catch (err: any) {
      console.error('Error fetching bus info:', err);
      setError(err.response?.data?.errorMessage || 'Failed to load seat information');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.isBooked) return;

    setSelectedSeats((prev) => {
      const isSelected = prev.includes(seat.id);
      if (isSelected) {
        // Remove seat - also remove passenger
        setPassengers((p) => p.filter((pass) => pass.seatId !== seat.id));
        return prev.filter((id) => id !== seat.id);
      } else {
        // Add seat - also add passenger
        setPassengers((p) => [
          ...p,
          {
            seatId: seat.id,
            seatNumber: seat.seatNumber,
            name: '',
            age: 0,
            gender: 'MALE' as const,
            phone: '',
            email: '',
          },
        ]);
        return [...prev, seat.id];
      }
    });
  };

  const handlePassengerChange = (seatId: string, field: keyof PassengerInfo, value: any) => {
    setPassengers((prev) =>
      prev.map((p) => (p.seatId === seatId ? { ...p, [field]: value } : p))
    );
  };

  const handleConfirmBooking = async () => {
    // Validate passengers
    const invalidPassenger = passengers.find((p) => !p.name || p.age <= 0 || p.age > 120);
    if (invalidPassenger) {
      setError('Please fill in all passenger details (name and valid age)');
      return;
    }

    if (!selectedBoardingPoint || !selectedDroppingPoint) {
      setError('Please select boarding and dropping points');
      return;
    }

    try {
      setBookingLoading(true);
      setError('');

      const response = await api.post(API_ENDPOINTS.ADMIN_OFFLINE_BOOKING, {
        tripId,
        fromStopId: routeState.fromStopId,
        toStopId: routeState.toStopId,
        seatIds: selectedSeats,
        passengers: passengers.map((p) => ({
          seatId: p.seatId,
          name: p.name,
          age: Number(p.age),
          gender: p.gender,
          phone: p.phone || undefined,
          email: p.email || undefined,
        })),
        boardingPointId: selectedBoardingPoint,
        droppingPointId: selectedDroppingPoint,
        adminNotes,
        customerPhone: customerPhone || undefined,
        customerEmail: customerEmail || undefined,
      });

      if (response.data) {
        setBookingGroupId(response.data.bookingGroupId);
        setEmailSent(response.data.emailSent || false);
        setBookingSuccess(true);
      }
    } catch (err: any) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.errorMessage || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!bookingGroupId) return;
    try {
      const response = await api.get(`/admin/booking/${bookingGroupId}/pdf`, {
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

  const handleContinue = () => {
    if (selectedSeats.length === 0 || !selectedBoardingPoint || !selectedDroppingPoint) {
      alert('Please select seats and boarding/dropping points');
      return;
    }

    navigate(`/admin/offline-booking/${tripId}/passengers`, {
      state: {
        selectedSeats,
        fromStopId: routeState.fromStopId,
        toStopId: routeState.toStopId,
        isReturnTrip: routeState.isReturnTrip || false,
        boardingPointId: selectedBoardingPoint,
        droppingPointId: selectedDroppingPoint,
        tripDate: routeState.tripDate,
      },
    });
  };

  const getSeatIcon = (seat: Seat) => {
    return seat.type === 'SLEEPER' ? <FaBed /> : <FaChair />;
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.isBooked) return 'bg-gray-300 cursor-not-allowed';
    if (selectedSeats.includes(seat.id)) return 'bg-blue-600 text-white';
    return 'bg-white border-2 border-gray-300 hover:border-blue-500 cursor-pointer';
  };

  const currentSeats = busInfo?.seats.filter((s) => s.level === currentDeck) || [];
  const maxRow = Math.max(...currentSeats.map((s) => s.row), 0);
  const maxCol = Math.max(...currentSeats.map((s) => s.column), 0);

  const totalPrice = selectedSeats.reduce((sum, seatId) => {
    const seat = busInfo?.seats.find((s) => s.id === seatId);
    return sum + (seat?.price || 0);
  }, 0);

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading seats...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error && !busInfo) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error || 'Failed to load seat information'}</p>
          <button
            onClick={() => navigate('/admin/offline-booking')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (!busInfo) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">No bus information available</p>
        </div>
      </AdminLayout>
    );
  }

  // Booking success state
  if (bookingSuccess) {
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
                onClick={() => {
                  setBookingSuccess(false);
                  setSelectedSeats([]);
                  setPassengers([]);
                  setCustomerEmail('');
                  setCustomerPhone('');
                  setAdminNotes('');
                  setBookingGroupId(null);
                  fetchBusInfo();
                }}
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={() => navigate('/admin/offline-booking')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Trips
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{busInfo.bus.name}</h1>
          <p className="text-gray-600">
            {busInfo.bus.busNumber} • {busInfo.route.fromStop.name} → {busInfo.route.toStop.name}
          </p>
        </div>

        {/* CUSTOMER CONTACT - LOCATION 1: TOP OF PAGE (ALWAYS VISIBLE) */}
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg shadow-md p-6 mb-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-yellow-800">
            <FaEnvelope className="text-yellow-600" />
            Customer Contact (Send Ticket) - LOCATION 1
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaEnvelope className="inline mr-2 text-blue-500" />
                Customer Email (Optional)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full p-3 text-lg border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="customer@email.com"
              />
              <p className="text-sm text-blue-600 mt-1">If provided, ticket PDF will be emailed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaPhone className="inline mr-2 text-green-500" />
                Customer Phone (Optional)
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full p-3 text-lg border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="9841234567"
              />
              <p className="text-sm text-green-600 mt-1">For WhatsApp/SMS (future)</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seat Layout */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Deck Selector */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Select Seats</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentDeck('LOWER')}
                    className={`px-4 py-2 rounded flex items-center space-x-2 ${
                      currentDeck === 'LOWER'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    <FaChevronDown />
                    <span>Lower</span>
                  </button>
                  <button
                    onClick={() => setCurrentDeck('UPPER')}
                    className={`px-4 py-2 rounded flex items-center space-x-2 ${
                      currentDeck === 'UPPER'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    <FaChevronUp />
                    <span>Upper</span>
                  </button>
                </div>
              </div>

              {/* Seat Grid */}
              <div className="relative">
                {/* Driver Indicator */}
                <div className="flex justify-end mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <GiSteeringWheel className="text-2xl" />
                    <span className="text-sm">Driver</span>
                  </div>
                </div>

                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${maxCol + 1}, 1fr)` }}>
                  {Array.from({ length: maxRow + 1 }, (_, row) =>
                    Array.from({ length: maxCol + 1 }, (_, col) => {
                      const seat = currentSeats.find((s) => s.row === row && s.column === col);
                      
                      if (!seat) {
                        return <div key={`${row}-${col}`} className="h-16"></div>;
                      }

                      return (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat)}
                          disabled={seat.isBooked}
                          className={`h-16 rounded-lg flex flex-col items-center justify-center text-sm font-semibold transition ${getSeatColor(seat)}`}
                        >
                          <span className="text-lg">{getSeatIcon(seat)}</span>
                          <span className="text-xs">{seat.seatNumber}</span>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-300 rounded"></div>
                    <span>Booked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="font-bold text-lg mb-4">Booking Summary</h3>

              {/* Boarding Point */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Boarding Point
                </label>
                <select
                  value={selectedBoardingPoint}
                  onChange={(e) => setSelectedBoardingPoint(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {busInfo.boardingPoints.map((point) => (
                    <option key={point.id} value={point.id}>
                      {point.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropping Point */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dropping Point
                </label>
                <select
                  value={selectedDroppingPoint}
                  onChange={(e) => setSelectedDroppingPoint(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {busInfo.droppingPoints.map((point) => (
                    <option key={point.id} value={point.id}>
                      {point.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Seats */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">Selected Seats</p>
                <p className="font-semibold">
                  {selectedSeats.length > 0
                    ? selectedSeats
                        .map((id) => busInfo.seats.find((s) => s.id === id)?.seatNumber)
                        .join(', ')
                    : 'None'}
                </p>
              </div>

              {/* CUSTOMER CONTACT - LOCATION 2: SIDEBAR (ALWAYS VISIBLE) */}
              <div className="border-2 border-purple-400 bg-purple-50 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-purple-800">
                  <FaEnvelope className="text-purple-500" />
                  Customer Contact - LOCATION 2
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email (for ticket)
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full p-2 text-sm border-2 border-purple-300 rounded focus:ring-2 focus:ring-purple-500"
                      placeholder="customer@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full p-2 text-sm border-2 border-purple-300 rounded focus:ring-2 focus:ring-purple-500"
                      placeholder="9841234567"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-bold text-xl">NPR {totalPrice}</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">Payment: Cash on Delivery (COD)</p>

                {selectedSeats.length > 0 && passengers.every(p => p.name && p.age > 0) ? (
                  <button
                    onClick={handleConfirmBooking}
                    disabled={bookingLoading}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {bookingLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <FaCheckCircle />
                        <span>Confirm Booking</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    disabled={selectedSeats.length === 0}
                    className="w-full py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
                  >
                    {selectedSeats.length === 0 ? 'Select seats' : 'Fill passenger details below'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Passenger Details Forms */}
        {selectedSeats.length > 0 && (
          <div className="mt-6">
            <div className="bg-white border-2 border-orange-400 rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-orange-800">
                <FaUser className="text-orange-600" />
                Passenger Details - LOCATION 3 (Phone/Email per passenger)
              </h3>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                {passengers.map((passenger) => (
                  <div key={passenger.seatId} className="border-2 border-orange-200 bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FaChair className="text-orange-500" />
                      <span className="font-semibold">Seat {passenger.seatNumber}</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="col-span-2 md:col-span-1">
                        <label className="block text-xs text-gray-600 mb-1">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={passenger.name}
                          onChange={(e) => handlePassengerChange(passenger.seatId, 'name', e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="Full name"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Age <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={passenger.age || ''}
                          onChange={(e) => handlePassengerChange(passenger.seatId, 'age', parseInt(e.target.value) || 0)}
                          className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="Age"
                          min="1"
                          max="120"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Gender</label>
                        <select
                          value={passenger.gender}
                          onChange={(e) => handlePassengerChange(passenger.seatId, 'gender', e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-green-700 mb-1">
                          <FaPhone className="inline mr-1 text-green-500" />
                          Phone <span className="text-gray-400">(opt)</span>
                        </label>
                        <input
                          type="tel"
                          value={passenger.phone}
                          onChange={(e) => handlePassengerChange(passenger.seatId, 'phone', e.target.value)}
                          className="w-full p-2 text-sm border-2 border-green-300 rounded focus:ring-2 focus:ring-green-500 bg-green-50"
                          placeholder="9841234567"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-blue-700 mb-1">
                          <FaEnvelope className="inline mr-1 text-blue-500" />
                          Email <span className="text-gray-400">(opt)</span>
                        </label>
                        <input
                          type="email"
                          value={passenger.email}
                          onChange={(e) => handlePassengerChange(passenger.seatId, 'email', e.target.value)}
                          className="w-full p-2 text-sm border-2 border-blue-300 rounded focus:ring-2 focus:ring-blue-500 bg-blue-50"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Admin Notes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Any notes about this booking..."
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOfflineBookingSeats;
