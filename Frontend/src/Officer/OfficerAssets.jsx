import React, { useState, useEffect, useCallback } from "react";
import OfficerLayout from "./OfficerLayout";
import { useAuth } from "../Home/Context/AuthContext";
import { API_ENDPOINTS, API_BASE_URL } from "../config/api";

const OfficerAssets = () => {
  const { officerWorkLocation, user } = useAuth();
  const workLocation = officerWorkLocation;
  const wardId = user?.assigned_ward || user?.ward || 1;

  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAssetId, setCurrentAssetId] = useState(null);
  const [wardError, setWardError] = useState(null);

  const [formData, setFormData] = useState({
    asset_type: "",
    asset_name: "",
    description: "",
    value: "",
    acquisition_date: "",
    status: "active",
  });

  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = `${API_ENDPOINTS.assets.manageWardAssets}`;
      if (workLocation) {
        const params = new URLSearchParams({
          work_province: workLocation.work_province || "",
          work_district: workLocation.work_district || "",
          work_municipality: workLocation.work_municipality || "",
          work_ward: String(workLocation.work_ward || ""),
        });
        url += `?${params.toString()}`;
      } else if (wardId) {
        url += `?ward_id=${wardId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setAssets(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch assets:", err);
    } finally {
      setIsLoading(false);
    }
  }, [workLocation, wardId]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = "POST";
    const payload = isEditing
      ? { ...formData, id: currentAssetId }
      : workLocation
      ? {
          ...formData,
          ward_id: 0,
          work_province: workLocation.work_province,
          work_district: workLocation.work_district,
          work_municipality: workLocation.work_municipality,
          work_ward: workLocation.work_ward,
        }
      : { ...formData, ward_id: wardId };

    console.log("Asset submission payload:", payload);
    console.log("Work Location:", workLocation);

    try {
      const res = await fetch(`${API_ENDPOINTS.assets.manageWardAssets}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("Asset API Response:", data);

      if (res.status === 422) {
        setWardError(
          data.message || "Ward not found. Ask admin to create this ward."
        );
        setShowAddModal(false);
        return;
      }

      if (data.success) {
        setWardError(null);
        setShowAddModal(false);
        setFormData({
          asset_type: "",
          asset_name: "",
          description: "",
          value: "",
          acquisition_date: "",
          status: "active",
        });
        setIsEditing(false);
        fetchAssets();
      } else {
        alert(data.message || "Failed to save asset");
      }
    } catch (err) {
      console.error("Failed to save asset:", err);
      alert("Error saving asset: " + err.message);
    }
  };

  const handleEdit = (asset) => {
    setFormData({
      asset_type: asset.asset_type,
      asset_name: asset.asset_name,
      description: asset.description,
      value: asset.value,
      acquisition_date: asset.acquisition_date,
      status: asset.status,
    });
    setCurrentAssetId(asset.id);
    setIsEditing(true);
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    try {
      const res = await fetch(`${API_ENDPOINTS.assets.manageWardAssets}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAssets();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Failed to delete asset:", err);
    }
  };

  return (
    <OfficerLayout title="Ward Assets Management">
      <div className="table-container">
        {wardError && (
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(239, 68, 68, 0.05))",
              border: "2px solid rgba(220, 38, 38, 0.5)",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "20px",
              color: "#dc2626",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "12px",
              backdropFilter: "blur(10px)",
            }}
          >
            <span style={{ fontSize: "24px" }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                Ward Not Found
              </div>
              <div style={{ fontSize: "0.9em", opacity: 0.9 }}>{wardError}</div>
            </div>
          </div>
        )}
        <div className="table-header-actions">
          <div>
            <h2 className="section-title">Registered Assets</h2>
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              {workLocation
                ? `${workLocation.work_municipality}, Ward ${workLocation.work_ward}`
                : `Ward ${wardId}`}
              : {assets.length}
            </span>
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              setIsEditing(false);
              setFormData({
                asset_type: "",
                asset_name: "",
                description: "",
                value: "",
                acquisition_date: "",
                status: "active",
              });
              setShowAddModal(true);
            }}
          >
            + Add Asset
          </button>
        </div>

        {isLoading ? (
          <div className="no-data">Loading assets...</div>
        ) : assets.length === 0 ? (
          <div className="no-data">No assets found for this ward.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Type</th>
                <th>Value (NPR)</th>
                <th>Acquired Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td style={{ fontWeight: 500 }}>{asset.asset_name}</td>
                  <td>{asset.asset_type}</td>
                  <td>Rs. {parseInt(asset.value).toLocaleString()}</td>
                  <td>{asset.acquisition_date || "N/A"}</td>
                  <td>
                    <span className={`badge ${asset.status.toLowerCase()}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="action-btn"
                      onClick={() => handleEdit(asset)}
                      style={{ background: "#3b82f6", color: "white" }}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => handleDelete(asset.id)}
                      style={{ background: "#ef4444", color: "white" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div
            className="stat-card modal-content"
            style={{ display: "block", maxWidth: "500px" }}
          >
            <div className="modal-header">
              <h3 className="section-title">
                {isEditing ? "Edit Asset" : "Add New Asset"}
              </h3>
              <button
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              style={{ display: "grid", gap: "15px", marginTop: "15px" }}
            >
              <div>
                <label className="stat-label">Asset Name</label>
                <input
                  type="text"
                  name="asset_name"
                  value={formData.asset_name}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="e.g. Dell Latitude Laptop"
                />
              </div>
              <div>
                <label className="stat-label">Asset Type</label>
                <select
                  name="asset_type"
                  value={formData.asset_type}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                >
                  <option value="">Select Type</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Land">Land</option>
                  <option value="Machinery">Machinery</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="stat-label">Value (Estimated NPR)</label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="stat-label">Acquisition Date</label>
                <input
                  type="date"
                  name="acquisition_date"
                  value={formData.acquisition_date}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="stat-label">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="active">Active/Working</option>
                  <option value="damaged">Damaged</option>
                  <option value="lost">Lost</option>
                  <option value="maintenance">Under Maintenance</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  {isEditing ? "Update Asset" : "Register Asset"}
                </button>
                <button
                  type="button"
                  className="action-btn"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: "#6b7280",
                    color: "white",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </OfficerLayout>
  );
};

export default OfficerAssets;
