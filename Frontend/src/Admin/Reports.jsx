/* eslint-disable react/prop-types */
import React from "react";
import AdminLayout from "./AdminLayout";
import { useAuth } from "../Home/Context/AuthContext";
import "./Reports.css";

const Reports = () => {
  const { getSystemStats } = useAuth();
  const stats = getSystemStats();

  return (
    <AdminLayout title="System Reports">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{stats.totalUsers}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Officers</span>
            <span className="stat-value">{stats.totalOfficers}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">
              Rs. {stats.revenue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="table-container reports-container-center">
        <h3 className="section-title">Detailed Reports</h3>
        <p className="reports-placeholder-text">
          Downloadable PDF/Excel reports will be available here after backend
          integration.
        </p>
        <div className="reports-actions">
          <button className="btn-report-download">Download User Report</button>
          <button className="btn-report-download btn-report-secondary">
            Download Financial Report
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;
