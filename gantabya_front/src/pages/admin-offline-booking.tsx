import React, { useState, useEffect } from 'react';
import { FaTicketAlt, FaInfoCircle, FaBus, FaCalendar, FaArrowRight, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../lib/api';
import { getDualDate } from '../utils/nepaliDateConverter';

interface Bus {
  id: string;
  busNumber: string;
  name: string;
}

interface Route {
  id: string;
  origin: string;
  destination: string;
  fromStopId?: string;
  toStopId?: string;
}

interface Trip {
  id: string;
  tripDate: string;
  departureTime: string;
  arrivalTime: string;
  status: string;
  bus: Bus;
  route: Route;
  _count?: {
    bookings: number;
  };
}

const AdminOfflineBooking: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedDate) {
      fetchTrips();
    }
  }, [selectedDate]);

  const fetchTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/trips', {
        params: { date: selectedDate }
      });
      setTrips(response.data.trips || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load trips');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrip = (trip: Trip) => {
    navigate(`/admin/offline-booking/${trip.id}`, {
      state: {
        tripDate: trip.tripDate,
        fromStopId: trip.route.fromStopId,
        toStopId: trip.route.toStopId,
      }
    });
  };

  const getAvailableSeats = (trip: Trip) => {
    const totalSeats = 40; // Placeholder - actual count would come from bus seat layout
    const bookedSeats = trip._count?.bookings || 0;
    return totalSeats - bookedSeats;
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <FaTicketAlt className="text-3xl text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Offline Booking
              </h1>
              <p className="text-gray-600 mt-1">
                Create bookings for walk-in customers
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
          <div className="flex items-start">
            <FaInfoCircle className="text-blue-600 mt-1 mr-3" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">
                Offline Booking Feature
              </h3>
              <p className="text-blue-700 text-sm">
                Select a date and trip to book tickets. Payment will be marked as Cash on Delivery (COD).
                No coupons or time restrictions apply. You can book anytime until the trip is completed.
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaCalendar className="inline mr-2" />
            Select Travel Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {selectedDate && (
            <p className="text-sm text-gray-600 mt-2">
              {getDualDate(new Date(selectedDate))}
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading trips...</p>
          </div>
        )}

        {/* Trips List */}
        {!loading && trips.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">
              Available Trips - {getDualDate(new Date(selectedDate))}
            </h2>
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <FaBus className="text-blue-600 text-2xl" />
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {trip.bus.name} ({trip.bus.busNumber})
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {trip.route.origin} <FaArrowRight className="inline mx-2" /> {trip.route.destination}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500">Departure</p>
                        <p className="font-semibold text-gray-800">{trip.departureTime}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Arrival</p>
                        <p className="font-semibold text-gray-800">{trip.arrivalTime}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Available Seats</p>
                        <p className="font-semibold text-green-600">
                          {getAvailableSeats(trip)} seats
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          trip.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          trip.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {trip.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6">
                    <button
                      onClick={() => handleSelectTrip(trip)}
                      disabled={trip.status === 'CANCELLED' || trip.status === 'COMPLETED'}
                      className={`px-6 py-3 rounded-lg font-semibold transition flex items-center space-x-2 ${
                        trip.status === 'ACTIVE'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <span>Select Seats</span>
                      <FaArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Trips Found */}
        {!loading && trips.length === 0 && selectedDate && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaBus className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              No Trips Found
            </h2>
            <p className="text-gray-600 mb-4">
              No trips scheduled for {getDualDate(new Date(selectedDate))}
            </p>
            <p className="text-sm text-gray-500">
              Trips are automatically created when needed. If you have buses configured with routes,
              trips will be available for booking. Check your bus and route configuration if needed.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOfflineBooking;
