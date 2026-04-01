import React, { useState, useEffect } from 'react';
import { FaTicketAlt, FaInfoCircle, FaBus, FaCalendar, FaArrowRight, FaSpinner, FaMapMarkerAlt, FaExchangeAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../lib/api';
import { getDualDate } from '../utils/nepaliDateConverter';

interface Stop {
  id: string;
  name: string;
  city: string;
  stopIndex: number;
  departureTime?: string;
  arrivalTime?: string;
}

interface Bus {
  id: string;
  busNumber: string;
  name: string;
  type: string;
  totalSeats: number;
  stops: Stop[];
}

const AdminOfflineBooking: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [fromStopId, setFromStopId] = useState<string>('');
  const [toStopId, setToStopId] = useState<string>('');
  const [isReturnTrip, setIsReturnTrip] = useState(false);
  const [loading, setLoading] = useState(false);
  const [proceeding, setProceeding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/buses');
      const busesWithStops = (response.data.buses || []).filter(
        (bus: Bus) => bus.stops && bus.stops.length >= 2
      );
      setBuses(busesWithStops);
      if (busesWithStops.length > 0) {
        const firstBus = busesWithStops[0];
        setSelectedBus(firstBus);
        // Set default from/to stops
        if (firstBus.stops.length >= 2) {
          setFromStopId(firstBus.stops[0].id);
          setToStopId(firstBus.stops[firstBus.stops.length - 1].id);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load buses');
      setBuses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBusChange = (busId: string) => {
    const bus = buses.find(b => b.id === busId);
    if (bus) {
      setSelectedBus(bus);
      // Reset stop selections
      if (bus.stops.length >= 2) {
        setFromStopId(bus.stops[0].id);
        setToStopId(bus.stops[bus.stops.length - 1].id);
      }
      setIsReturnTrip(false);
    }
  };

  const handleProceedToSeats = async () => {
    if (!selectedBus || !fromStopId || !toStopId || !selectedDate) {
      setError('Please select bus, date, and stops');
      return;
    }

    // Validate that fromStop index < toStop index for forward, or vice versa for return
    const fromStop = selectedBus.stops.find(s => s.id === fromStopId);
    const toStop = selectedBus.stops.find(s => s.id === toStopId);
    
    if (!fromStop || !toStop) {
      setError('Invalid stop selection');
      return;
    }

    if (!isReturnTrip && fromStop.stopIndex >= toStop.stopIndex) {
      setError('For forward trip, departure stop must be before arrival stop');
      return;
    }

    if (isReturnTrip && fromStop.stopIndex <= toStop.stopIndex) {
      setError('For return trip, departure stop must be after arrival stop');
      return;
    }

    setProceeding(true);
    setError('');

    try {
      // Create or get trip for this bus and date
      const response = await api.post('/admin/trips/ensure', {
        busId: selectedBus.id,
        date: selectedDate,
      });

      const tripId = response.data.tripId;

      // Navigate to seat selection with all necessary info
      navigate(`/admin/offline-booking/${tripId}`, {
        state: {
          tripDate: selectedDate,
          fromStopId,
          toStopId,
          isReturnTrip,
          busName: selectedBus.name,
          busNumber: selectedBus.busNumber,
        }
      });
    } catch (err: any) {
      setError(err.response?.data?.errorMessage || 'Failed to proceed');
    } finally {
      setProceeding(false);
    }
  };

  const swapStops = () => {
    const temp = fromStopId;
    setFromStopId(toStopId);
    setToStopId(temp);
    setIsReturnTrip(!isReturnTrip);
  };

  // Get valid "to" stops based on selected "from" stop
  const getValidToStops = () => {
    if (!selectedBus || !fromStopId) return [];
    const fromStop = selectedBus.stops.find(s => s.id === fromStopId);
    if (!fromStop) return [];

    if (isReturnTrip) {
      // For return trip, show stops with lower index
      return selectedBus.stops.filter(s => s.stopIndex < fromStop.stopIndex);
    } else {
      // For forward trip, show stops with higher index
      return selectedBus.stops.filter(s => s.stopIndex > fromStop.stopIndex);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
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
                Select a bus, date, and route (from-to stops). Payment will be marked as Cash on Delivery (COD).
                No coupons or time restrictions apply. You can book anytime.
              </p>
            </div>
          </div>
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
            <p className="text-gray-600">Loading buses...</p>
          </div>
        )}

        {/* Booking Form */}
        {!loading && buses.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Select Trip Details</h2>
            
            {/* Bus Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaBus className="inline mr-2" />
                Select Bus
              </label>
              <select
                value={selectedBus?.id || ''}
                onChange={(e) => handleBusChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {buses.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.name} ({bus.busNumber}) - {bus.totalSeats} seats
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaCalendar className="inline mr-2" />
                Travel Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {selectedDate && (
                <p className="text-sm text-gray-600 mt-2">
                  {getDualDate(new Date(selectedDate))}
                </p>
              )}
            </div>

            {/* Route Selection */}
            {selectedBus && selectedBus.stops.length >= 2 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-2" />
                  Select Route
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
                  {/* From Stop */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <select
                      value={fromStopId}
                      onChange={(e) => {
                        setFromStopId(e.target.value);
                        // Reset toStopId if it's no longer valid
                        const fromStop = selectedBus.stops.find(s => s.id === e.target.value);
                        const toStop = selectedBus.stops.find(s => s.id === toStopId);
                        if (fromStop && toStop) {
                          if (!isReturnTrip && fromStop.stopIndex >= toStop.stopIndex) {
                            const validToStops = selectedBus.stops.filter(s => s.stopIndex > fromStop.stopIndex);
                            if (validToStops.length > 0) setToStopId(validToStops[0].id);
                          }
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {selectedBus.stops.map((stop) => (
                        <option key={stop.id} value={stop.id}>
                          {stop.city} - {stop.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Swap Button */}
                  <button
                    type="button"
                    onClick={swapStops}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition self-end"
                    title="Swap stops"
                  >
                    <FaExchangeAlt className="text-gray-600" />
                  </button>

                  {/* To Stop */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <select
                      value={toStopId}
                      onChange={(e) => setToStopId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {getValidToStops().map((stop) => (
                        <option key={stop.id} value={stop.id}>
                          {stop.city} - {stop.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Direction Indicator */}
                <div className="mt-3 flex items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isReturnTrip 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {isReturnTrip ? '↩ Return Trip' : '→ Forward Trip'}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleProceedToSeats}
              disabled={proceeding || !selectedBus || !fromStopId || !toStopId}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {proceeding ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Select Seats</span>
                  <FaArrowRight />
                </>
              )}
            </button>
          </div>
        )}

        {/* No Buses Found */}
        {!loading && buses.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaBus className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              No Buses Found
            </h2>
            <p className="text-gray-600 mb-4">
              You don't have any buses with routes configured.
            </p>
            <p className="text-sm text-gray-500">
              Please add buses and configure at least 2 stops for each bus to enable offline booking.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOfflineBooking;
