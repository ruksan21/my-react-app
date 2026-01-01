import React, { useState } from "react";
import OfficerLayout from "./OfficerLayout";
import "./OfficerApplications.css";

const OfficerApplications = () => {
  const [applications, setApplications] = useState([
    {
      id: 1,
      applicant: "Ram Kumar",
      type: "Citizenship Recommendation",
      date: "2023-11-15",
      status: "Pending",
    },
    {
      id: 2,
      applicant: "Sita Sharma",
      type: "Relationship Verification",
      date: "2023-11-16",
      status: "Pending",
    },
    {
      id: 3,
      applicant: "Hari Bahadur",
      type: "Tax Clearance",
      date: "2023-11-14",
      status: "Approved",
    },
  ]);

  const handleStatusChange = (id, newStatus) => {
    setApplications(
      applications.map((app) =>
        app.id === id ? { ...app, status: newStatus } : app
      )
    );
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      setApplications(applications.filter((a) => a.id !== id));
    }
  };

  return (
    <OfficerLayout title="Applications">
      <div className="recent-activity">
        <h2 className="section-title">Incoming Applications</h2>
        <table className="applications-table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Type</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td className="applicant-name">{app.applicant}</td>
                <td>{app.type}</td>
                <td>{app.date}</td>
                <td>
                  <span className={`status-badge ${app.status.toLowerCase()}`}>
                    {app.status}
                  </span>
                </td>
                <td>
                  <div className="actions-cell">
                    {app.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(app.id, "Approved")}
                          className="action-btn approve"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, "Rejected")}
                          className="action-btn reject"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {/* Delete is available for any application */}
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="action-btn delete"
                    >
                      Delete
                    </button>

                    {app.status !== "Pending" && (
                      <span className="status-text">
                        {/* keep visual hint that no more status actions available */}
                        Status: {app.status}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </OfficerLayout>
  );
};

export default OfficerApplications;
