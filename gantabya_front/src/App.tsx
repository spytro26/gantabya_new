import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { Signup } from './pages/signup';
import { Signin } from './pages/user-signin';
import { UserForgotPassword } from './pages/user-forgot-password';
import { AdminSignin } from './pages/admin-signin';
import AdminSignup from './pages/admin-signup';
import AdminDashboard from './pages/admin-dashboard';
import BusManagement from './pages/admin-buses';
import BusForm from './pages/admin-bus-form';
import SeatLayoutDesigner from './pages/admin-seat-layout';
import AdminBusImages from './pages/admin-bus-images';
import RouteManagement from './pages/admin-routes';
import TripManagement from './pages/admin-trips';
import HolidayManagement from './pages/admin-holidays';
import OfferManagement from './pages/admin-offers';
import AmenityManagement from './pages/admin-amenities';
import AdminVerifyEmail from './pages/admin-verify-email';
import AdminVerificationPending from './pages/admin-verification-pending';
import AdminForgotPassword from './pages/admin-forgot-password';
import AdminBookingsReport from './pages/admin-bookings-report';
import AdminOfflineBooking from './pages/admin-offline-booking';
// AdminOfflineBookingSeats and AdminOfflineBookingPassengers removed as we reuse Bookings UI
import { UserHome } from './pages/user-home';
import { SearchResults } from './pages/search-results';
import { BookingPage } from './pages/booking-page';
import { BookingBoardingPage } from './pages/booking-boarding';
import { BookingPassengerPage } from './pages/booking-passenger';
import { MyBookings } from './pages/my-bookings';
import { UserProfile } from './pages/user-profile';
import { Notifications } from './pages/notifications';
import { EsewaSuccessPage } from './pages/esewa-success';
import { EsewaFailurePage } from './pages/esewa-failure';
import SuperAdminSignin from './pages/superadmin-signin';
import SuperAdminDashboard from './pages/superadmin-dashboard';
import SuperAdminAdminProfile from './pages/superadmin-admin-profile';
import SuperAdminOffers from './pages/superadmin-offers';
import { TermsAndConditions } from './pages/terms-and-conditions';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing - Redirect to home */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        {/* User Routes */}
        <Route path="/signup" element={<Signup />} />
    <Route path="/signin" element={<Signin />} />
    <Route path="/forgot-password" element={<UserForgotPassword />} />
        <Route path="/home" element={<UserHome />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/book/:tripId" element={<BookingPage />} />
    <Route path="/book/:tripId/boarding" element={<BookingBoardingPage />} />
    <Route path="/book/:tripId/passengers" element={<BookingPassengerPage />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/payment/esewa/success/:paymentId" element={<EsewaSuccessPage />} />
        <Route path="/payment/esewa/failure/:paymentId" element={<EsewaFailurePage />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        
        {/* Admin Routes */}
        <Route path="/plus/signup" element={<AdminSignup />} />
        <Route path="/plus/signin" element={<AdminSignin />} />
        <Route path="/plus/forgot-password" element={<AdminForgotPassword />} />
        <Route path="/plus/verify-email" element={<AdminVerifyEmail />} />
        <Route path="/plus/verification-pending" element={<AdminVerificationPending />} />
        <Route path="/plus/dashboard" element={<AdminDashboard />} />
        <Route path="/plus/buses" element={<BusManagement />} />
        <Route path="/plus/buses/:busId" element={<BusForm />} />
        <Route path="/plus/buses/:busId/edit" element={<BusForm />} />
        <Route path="/plus/buses/:busId/seats" element={<SeatLayoutDesigner />} />
        <Route path="/plus/buses/:busId/images" element={<AdminBusImages />} />
        <Route path="/plus/routes" element={<RouteManagement />} />
        <Route path="/plus/trips" element={<TripManagement />} />
        <Route path="/plus/holidays" element={<HolidayManagement />} />
        <Route path="/plus/offers" element={<OfferManagement />} />
        <Route path="/plus/amenities" element={<AmenityManagement />} />
        <Route path="/plus/bookings-report" element={<AdminBookingsReport />} />
        <Route path="/plus/offline-booking" element={<AdminOfflineBooking />} />
        <Route path="/plus/offline-booking/:tripId" element={<BookingPage isAdmin={true} />} />
        <Route path="/plus/offline-booking/:tripId/boarding" element={<BookingBoardingPage isAdmin={true} />} />
        <Route path="/plus/offline-booking/:tripId/passengers" element={<BookingPassengerPage isAdmin={true} />} />

        {/* Super Admin Routes */}
        <Route path="/superadmin" element={<SuperAdminSignin />} />
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/superadmin/offers" element={<SuperAdminOffers />} />
        <Route path="/superadmin/admin/:adminId" element={<SuperAdminAdminProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;








