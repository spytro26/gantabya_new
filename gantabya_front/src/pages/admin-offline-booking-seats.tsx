import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../lib/api';
import { API_ENDPOINTS } from '../config';
import { FaArrowLeft, FaChair, FaBed, FaChevronUp, FaChevronDown } from 'react-icons/fa';
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

    setSelectedSeats((prev) =>
      prev.includes(seat.id)
        ? prev.filter((id) => id !== seat.id)
        : [...prev, seat.id]
    );
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

  if (error || !busInfo) {
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

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-bold text-xl">NPR {totalPrice}</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">Payment: Cash on Delivery (COD)</p>
                <button
                  onClick={handleContinue}
                  disabled={selectedSeats.length === 0}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continue ({selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOfflineBookingSeats;
