import React, { useState, useEffect } from "react";
import OfficerLayout from "./OfficerLayout";
import "./OfficerComplaints.css";

const OfficerComplaints = () => {
  const [complaints, setComplaints] = useState([]);

  const handleResolve = (id) => {
    // Optimistic UI update; also attempt to notify backend to update status.
    setComplaints(
      complaints.map((complaint) =>
        complaint.id === id ? { ...complaint, status: "Resolved" } : complaint
      )
    );

    // Update complaint status in backend
    (async () => {
      try {
        await fetch(
          "http://localhost/my-react-app/Backend/api/update_complaint_status.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: "Resolved" }),
          }
        );
      } catch (err) {
        console.warn("Could not update complaint on server:", err);
      }
    })();
  };

  useEffect(() => {
    // Fetch complaints from backend
    (async () => {
      try {
        const res = await fetch(
          "http://localhost/my-react-app/Backend/api/get_complaints.php"
        );
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) setComplaints(data);
      } catch {
        console.warn("Could not fetch complaints from server");
      }
    })();
  }, []);

  return (
    <OfficerLayout title="Complaints">
      <div className="recent-activity">
        <h2 className="section-title">Citizen Complaints</h2>
        <table className="complaints-table">
          <thead>
            <tr>
              <th>Complainant</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint) => {
              return (
                <tr key={complaint.id}>
                  <td className="complaint-complainant">
                    {complaint.complainant}
                  </td>
                  <td>{complaint.subject}</td>
                  <td>{complaint.date}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        complaint.status === "Resolved" ? "resolved" : "open"
                      }`}
                    >
                      {complaint.status}
                    </span>
                  </td>
                  <td>
                    {complaint.status === "Open" ? (
                      <button
                        onClick={() => handleResolve(complaint.id)}
                        className="resolve-btn"
                      >
                        Mark as Resolved
                      </button>
                    ) : (
                      <span className="resolved-text">
                        <span>✅</span> Resolved
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </OfficerLayout>
  );
};

export default OfficerComplaints;
