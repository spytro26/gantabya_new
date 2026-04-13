// ============================================================
//  BACKEND URL — SINGLE SOURCE OF TRUTH
// ============================================================
//  To switch between LOCAL DEV and PRODUCTION, flip the
//  IS_PRODUCTION flag below. Everything in the app reads
//  BACKEND_URL / API_BASE_URL from here.
//
//  Workflow:
//    1. Change IS_PRODUCTION (true = prod, false = local dev)
//    2. git add . && git commit -m "switch backend url"
//    3. git push
//    4. On EC2:  git pull && (rebuild / restart)
// ============================================================

const IS_PRODUCTION = false; // <-- CHANGE THIS: true = production, false = localhost

export const BACKEND_URL = IS_PRODUCTION
  ? "https://api.gogantabya.com"
  : "http://localhost:3000";

// Alias kept so existing imports (`API_BASE_URL`) keep working.
export const API_BASE_URL = BACKEND_URL;
export const API_ENDPOINTS = {
  // User Auth
  USER_SIGNUP: "/user/signup",
  USER_SIGNIN: "/user/signin",
  USER_VERIFY_EMAIL: "/user/verifyEmail",
  USER_FORGOT_PASSWORD: "/user/forgot-password",
  USER_RESET_PASSWORD: "/user/reset-password",
  USER_PROFILE: "/user/profile",

  // User Booking
  SEARCH_BUSES: "/user/showbus",
  PAYMENTS_INITIATE: "/user/payments/initiate",
  PAYMENTS_VERIFY: "/user/payments/verify",
  PAYMENTS_CONFIRM: "/user/payments/confirm",
  MY_BOOKINGS: "/user/mybookings",
  // CANCEL_TICKET: "/user/cancelticket", // DISABLED
  DOWNLOAD_TICKET: "/user/booking/download-ticket", // + /:groupId

  // User Notifications
  GET_NOTIFICATIONS: "/user/notifications",
  UNREAD_COUNT: "/user/notifications/unread-count",
  MARK_ALL_READ: "/user/notifications/read-all",

  // User Offers (Public)
  GET_PUBLIC_OFFERS: "/user/offers",
  GET_TRIP_SEATS: "/user/trip", // + /:tripId/seats

  // Admin Auth
  ADMIN_SIGNUP: "/admin/signup",
  ADMIN_SIGNIN: "/admin/signin",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_DASHBOARD_MONTHLY: "/admin/dashboard/monthly",
  ADMIN_SERVICE_NAME: "/admin/profile/service-name",

  // Admin Bus Management
  ADMIN_CREATE_BUS: "/admin/createbus",
  ADMIN_UPDATE_BUS: "/admin/updatebus",
  ADMIN_GET_BUSES: "/admin/buses",
  ADMIN_DELETE_BUS: "/admin/deletebus",

  // Admin Stops
  ADMIN_ADD_STOP: "/admin/addstop",
  ADMIN_UPDATE_STOP: "/admin/updatestop",
  ADMIN_DELETE_STOP: "/admin/deletestop",

  // Admin Trips
  ADMIN_CREATE_TRIP: "/admin/createtrip",
  ADMIN_GET_TRIPS: "/admin/trips",
  ADMIN_CANCEL_TRIP: "/admin/canceltrip",

  // Admin Bookings Report
  ADMIN_BOOKINGS_DATE_REPORT: "/admin/bookings/date-report",
  
  // Admin Offline Booking
  ADMIN_OFFLINE_BOOKING: "/admin/booking/offline",

  // Admin Offers
  ADMIN_CREATE_OFFER: "/admin/offers",
  ADMIN_GET_OFFERS: "/admin/offers",
  ADMIN_UPDATE_OFFER: "/admin/offers",
  ADMIN_DELETE_OFFER: "/admin/offers",

  // Admin Amenities
  ADMIN_UPDATE_AMENITIES: "/admin/updateamenities",
};

export const APP_NAME = "Go Gantabya";
export const APP_TAGLINE = "Your Journey, Our Priority";
