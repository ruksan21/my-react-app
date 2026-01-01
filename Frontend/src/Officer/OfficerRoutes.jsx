import React from "react";
import { Routes, Route } from "react-router-dom";
import OfficerDashboard from "./OfficerDashboard";
import OfficerWorks from "./OfficerWorks";
import OfficerDepartments from "./OfficerDepartments";
import OfficerBudget from "./OfficerBudget";
import OfficerNotices from "./OfficerNotices";
import OfficerFollowers from "./OfficerFollowers";
import OfficerProfile from "./OfficerProfile";

const OfficerRoutes = () => {
  return (
    <Routes>
      <Route index element={<OfficerDashboard />} />
      <Route path="profile" element={<OfficerProfile />} />
      <Route path="followers" element={<OfficerFollowers />} />
      <Route path="works" element={<OfficerWorks />} />
      <Route path="budgets" element={<OfficerBudget />} />
      <Route path="departments" element={<OfficerDepartments />} />
      <Route path="complaints" element={<OfficerComplaints />} />
      <Route path="notices" element={<OfficerNotices />} />
    </Routes>
  );
};

export default OfficerRoutes;
