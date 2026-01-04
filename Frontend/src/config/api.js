/**
 * Centralized API Configuration
 * All API endpoints are defined here for easy management
 */

// Base API URL - Change this for different environments
const BASE_URL = "http://localhost/my-react-app/Backend/api";

// API Endpoints organized by category
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: `${BASE_URL}/auth/login.php`,
    register: `${BASE_URL}/auth/register.php`,
    resetPassword: `${BASE_URL}/auth/reset_password.php`,
  },

  // User Management
  users: {
    getAll: `${BASE_URL}/users/get_users.php`,
    delete: `${BASE_URL}/users/delete_user.php`,
    update: `${BASE_URL}/users/update_user.php`,
    getPendingOfficers: `${BASE_URL}/users/get_pending_officers.php`,
    updateOfficerStatus: `${BASE_URL}/users/update_officer_status.php`,
  },

  // Ward Management
  wards: {
    getAll: `${BASE_URL}/wards/get_wards.php`,
    getDetails: `${BASE_URL}/wards/get_ward_details.php`,
    add: `${BASE_URL}/wards/add_ward.php`,
    update: `${BASE_URL}/wards/update_ward.php`,
    delete: `${BASE_URL}/wards/delete_ward.php`,
    autoGenerate: `${BASE_URL}/wards/auto_generate_wards.php`,
    verifyAccess: `${BASE_URL}/wards/verify_ward_access.php`,
  },

  // District Management
  districts: {
    getAll: `${BASE_URL}/districts/get_districts.php`,
    add: `${BASE_URL}/districts/add_district.php`,
  },

  // Officer Features
  officers: {
    add: `${BASE_URL}/officers/add_officer.php`,
    getFollowers: `${BASE_URL}/officers/get_officer_followers.php`,
    toggleFollow: `${BASE_URL}/officers/toggle_follow.php`,
    getChairpersonProfile: `${BASE_URL}/officers/get_chairperson_profile.php`,
    updateChairpersonProfile: `${BASE_URL}/officers/update_chairperson_profile.php`,
  },

  // Asset & Budget Management
  assets: {
    manageWardAssets: `${BASE_URL}/assets/manage_ward_assets.php`,
    manageChairpersonAssets: `${BASE_URL}/assets/manage_chairperson_assets.php`,
    manageBudgets: `${BASE_URL}/assets/manage_budgets.php`,
  },

  // Work & Development
  works: {
    add: `${BASE_URL}/works/add_work.php`,
    getAll: `${BASE_URL}/works/get_works.php`,
  },

  // Communication
  communication: {
    getComplaints: `${BASE_URL}/communication/get_complaints.php`,
    updateComplaintStatus: `${BASE_URL}/communication/update_complaint_status.php`,
    getFeedback: `${BASE_URL}/communication/get_feedback.php`,
    addFeedback: `${BASE_URL}/communication/add_feedback.php`,
  },

  // Alerts & Notices
  alerts: {
    getAlerts: `${BASE_URL}/alerts/get_alerts.php`,
    manageAlerts: `${BASE_URL}/alerts/manage_alerts.php`,
    manageNotices: `${BASE_URL}/alerts/manage_notices.php`,
    manageDepartments: `${BASE_URL}/alerts/manage_departments.php`,
  },

  // Statistics
  stats: {
    getProfileStats: `${BASE_URL}/stats/get_profile_stats.php`,
  },

  // Helper for uploads directory
  uploads: `${BASE_URL}/uploads`,
};

// Export base URL for custom endpoints
export const API_BASE_URL = BASE_URL;

export default API_ENDPOINTS;
