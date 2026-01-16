import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import OfficerLayout from "./OfficerLayout";
import { useAuth } from "../Home/Context/AuthContext";
import { API_ENDPOINTS } from "../config/api";
import "./OfficerDashboard.css";

const OfficerDashboard = () => {
  const { getOfficerWorkLocation, user } = useAuth();
  const workLocation = getOfficerWorkLocation();
  const [wardExists, setWardExists] = useState(null);
  const [stats, setStats] = useState([
    { label: "Pending Complaints", value: "0", icon: "📢" },
    { label: "Ward Population", value: "-", icon: "👥" },
  ]);

  const [currentWardId, setCurrentWardId] = useState(null);

  // Check if officer's assigned ward exists and fetch data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user && user.role === "officer" && workLocation) {
        try {
          // 1. Verify Ward and Get Ward Stats
          const wardRes = await fetch(
            `${API_ENDPOINTS.wards.verifyAccess}?province=${encodeURIComponent(
              workLocation.work_province
            )}&district=${encodeURIComponent(
              workLocation.work_district
            )}&municipality=${encodeURIComponent(
              workLocation.work_municipality
            )}&ward_number=${workLocation.work_ward}`
          );
          const wardData = await wardRes.json();
          setWardExists(wardData.exists || false);
          if (wardData.exists && wardData.ward_id) {
            setCurrentWardId(wardData.ward_id);
          }

          // Fetch complaints and update stats
          const params = new URLSearchParams({
            province: workLocation.work_province,
            municipality: workLocation.work_municipality,
            ward: workLocation.work_ward,
            source: "citizen",
          }).toString();

          const complaintsRes = await fetch(
            `${API_ENDPOINTS.communication.getComplaints}?${params}`
          );
          const complaintsData = await complaintsRes.json();

          if (Array.isArray(complaintsData)) {
            const pendingCount = complaintsData.filter(
              (c) => c.status === "Open"
            ).length;

            let popValue = "Not Set";
            if (wardData.ward && wardData.ward.population) {
              popValue = Number(wardData.ward.population).toLocaleString();
            }

            setStats([
              {
                label: "Pending Complaints",
                value: pendingCount.toString(),
                icon: "📢",
              },
              {
                label: "Ward Population",
                value: popValue,
                icon: "👥",
                isEditable: true,
              },
            ]);
          }
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        }
      }
    };

    fetchDashboardData();
  }, [user, workLocation]);

  const handleStatClick = async (stat) => {
    if (!stat.isEditable || !currentWardId) return;

    const newPopulation = prompt(
      "Enter new Ward Population:",
      stat.value === "Not Set" ? "" : stat.value.replace(/,/g, "")
    );

    if (newPopulation && !isNaN(newPopulation)) {
      try {
        const response = await fetch(API_ENDPOINTS.wards.update, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: currentWardId,
            population: newPopulation,
          }),
        });
        const result = await response.json();

        if (result.success) {
          // Update local state
          setStats((prev) =>
            prev.map((item) =>
              item.label === "Ward Population"
                ? { ...item, value: Number(newPopulation).toLocaleString() }
                : item
            )
          );
          toast.success("Population updated successfully!");
        } else {
          toast.error("Failed to update: " + result.message);
        }
      } catch (err) {
        console.error("Update failed:", err);
        toast.error("An error occurred while updating.");
      }
    }
  };

  return (
    <OfficerLayout title="Ward Overview">


      {/* Warnings... */}
      {workLocation && wardExists === false && (
        <div className="ward-assignment-badge error">
          <span className="badge-icon">🚫</span>
          <span className="badge-text">
            <strong>तपाईंको Ward अझै Create भएको छैन!</strong>
            <br />
            कृपया Admin लाई सम्पर्क गर्नुहोस्।
          </span>
        </div>
      )}

      <div className="dashboard-stats-grid">
        {stats.map((stat, index) => (
          <div
            className={`dashboard-stat-card ${
              stat.isEditable ? "editable" : ""
            }`}
            key={index}
            onClick={() => handleStatClick(stat)}
            title={stat.isEditable ? "Click to edit" : ""}
          >
            <span className="dashboard-stat-label">
              <span>{stat.icon}</span> {stat.label}
              {stat.isEditable && <span className="edit-icon">✏️</span>}
            </span>
            <span className="dashboard-stat-value">{stat.value}</span>
          </div>
        ))}
      </div>


    </OfficerLayout>
  );
};

export default OfficerDashboard;
