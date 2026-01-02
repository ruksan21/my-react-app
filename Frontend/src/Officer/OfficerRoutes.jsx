import React from "react";
import { Routes, Route } from "react-router-dom";
import OfficerDashboard from "./OfficerDashboard";
import OfficerWorks from "./OfficerWorks";
import OfficerBudget from "./OfficerBudget";
import OfficerDepartments from "./OfficerDepartments";
import OfficerNotices from "./OfficerNotices";
import OfficerComplaints from "./OfficerComplaints";
import OfficerAssets from "./OfficerAssets";

const OfficerRoutes = () => {
  return (
    <Routes>
      <Route index element={<OfficerDashboard />} />
      <Route path="works" element={<OfficerWorks />} />
      <Route path="budgets" element={<OfficerBudget />} />
      <Route path="departments" element={<OfficerDepartments />} />
      <Route path="assets" element={<OfficerAssets />} />
      <Route path="complaints" element={<OfficerComplaints />} />
      <Route path="notices" element={<OfficerNotices />} />
    </Routes>
  );
};

export default OfficerRoutes;
