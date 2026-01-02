import React, { useState, useEffect } from "react";
import OfficerLayout from "./OfficerLayout";
import { useAuth } from "../Home/Context/AuthContext";

const OfficerAssets = () => {
  const { user } = useAuth();
  const API_URL = "http://localhost/my-react-app/Backend/api";
  const wardId = user?.assigned_ward || user?.ward || 1;

  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAssetId, setCurrentAssetId] = useState(null);

  const [formData, setFormData] = useState({
    asset_type: "",
    asset_name: "",
    description: "",
    value: "",
    acquisition_date: "",
    status: "active",
  });

  useEffect(() => {
    fetchAssets();
  }, [wardId]);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/manage_ward_assets.php?ward_id=${wardId}`
      );
      const data = await res.json();
      if (data.success) {
        setAssets(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch assets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = "POST";
    const payload = isEditing
      ? { ...formData, id: currentAssetId }
      : { ...formData, ward_id: wardId };

    try {
      const res = await fetch(`${API_URL}/manage_ward_assets.php`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
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
        alert(data.message);
      }
    } catch (err) {
      console.error("Failed to save asset:", err);
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
      const res = await fetch(`${API_URL}/manage_ward_assets.php`, {
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
        <div className="table-header-actions">
          <div>
            <h2 className="section-title">Registered Assets</h2>
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Total assets in Ward {wardId}: {assets.length}
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
