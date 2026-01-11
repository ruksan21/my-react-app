import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import WardManagement from "./WardManagement";
import OfficerManagement from "./OfficerManagement";
import UserManagement from "./UserManagement";
import AlertCentre from "./AlertCentre";
import AdminSettings from "./AdminSettings";
import Reports from "./Reports";
import AdminComplaints from "./AdminComplaints";
import AdminNotifications from "./AdminNotifications";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="wards" element={<WardManagement />} />
      <Route path="officers" element={<OfficerManagement />} />
      <Route path="users" element={<UserManagement />} />
      <Route path="alerts" element={<AlertCentre />} />
      <Route path="notifications" element={<AdminNotifications />} />
      <Route path="settings" element={<AdminSettings />} />
      <Route path="reports" element={<Reports />} />
      <Route path="complaints" element={<AdminComplaints />} />
    </Routes>
  );
};

export default AdminRoutes;
