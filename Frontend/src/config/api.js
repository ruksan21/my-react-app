const BASE_URL = "http://localhost/my-react-app/Backend/api";

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
    getAll: `${BASE_URL}/wards/list_all_wards.php`,
    getDetails: `${BASE_URL}/wards/fetch_ward_full_details.php`,
    add: `${BASE_URL}/wards/add_ward.php`,
    update: `${BASE_URL}/wards/update_ward.php`,
    delete: `${BASE_URL}/wards/delete_ward.php`,
    autoGenerate: `${BASE_URL}/wards/create_wards_for_municipality.php`,
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
    getByWard: `${BASE_URL}/officers/get_officers_by_ward.php`,
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
    update: `${BASE_URL}/works/update_work.php`,
    getAll: `${BASE_URL}/works/get_works.php`,
    delete: `${BASE_URL}/works/delete_work.php`,
  },

  // Communication
  communication: {
    submitComplaint: `${BASE_URL}/communication/submit_complaint.php`,
    getComplaints: `${BASE_URL}/communication/get_complaints.php`,
    updateComplaintStatus: `${BASE_URL}/communication/update_complaint_status.php`,
    getFeedback: `${BASE_URL}/communication/get_feedback.php`,
    addFeedback: `${BASE_URL}/communication/add_feedback.php`,
    getReviews: `${BASE_URL}/communication/get_reviews.php`,
    addReview: `${BASE_URL}/communication/add_review.php`,
    getReplies: `${BASE_URL}/communication/get_replies.php`,
    addReply: `${BASE_URL}/communication/add_reply.php`,
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

  // Activities
  activities: {
    get: `${BASE_URL}/activities/get_activities.php`,
    add: `${BASE_URL}/activities/add_activity.php`,
    delete: `${BASE_URL}/activities/delete_activity.php`,
  },

  // Social Media
  socialMedia: {
    get: `${BASE_URL}/social-media/get_social_media.php`,
    update: `${BASE_URL}/social-media/update_social_media.php`,
  },

  // Notifications
  notifications: {
    get: `${BASE_URL}/notifications/get_notifications.php`,
    markAsRead: `${BASE_URL}/notifications/mark_as_read.php`,
    markAllAsRead: `${BASE_URL}/notifications/mark_all_as_read.php`,
    clear: `${BASE_URL}/notifications/clear_notifications.php`,
  },

  // Helper for uploads directory
  uploads: `${BASE_URL}/uploads`,
  authUploads: `${BASE_URL}/auth/uploads`,
};

// Export base URL for custom endpoints
export const API_BASE_URL = BASE_URL;

export default API_ENDPOINTS;
