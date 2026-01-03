import React, { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../config/api";
import "./ChairpersonPersonalAssets.css";

const ChairpersonPersonalAssets = ({ wardId }) => {
  const [personalAssets, setPersonalAssets] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    asset_type: "land",
    asset_name: "",
    description: "",
    location: "",
    value: "",
    acquired_date: "",
    ownership_type: "self",
  });

  useEffect(() => {
    if (wardId) {
      fetchPersonalAssets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wardId]);

  const fetchPersonalAssets = async () => {
    try {
      const res = await fetch(
        `${API_ENDPOINTS.assets.manageChairpersonAssets}?ward_id=${wardId}`
      );
      const data = await res.json();
      if (data.success) {
        setPersonalAssets(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching personal assets:", err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!wardId) return;

    try {
      const res = await fetch(API_ENDPOINTS.assets.manageChairpersonAssets, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ward_id: wardId,
          ...formData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Personal asset added successfully!");
        setIsAdding(false);
        setFormData({
          asset_type: "land",
          asset_name: "",
          description: "",
          location: "",
          value: "",
          acquired_date: "",
          ownership_type: "self",
        });
        fetchPersonalAssets();
      } else {
        alert("Failed to add personal asset: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error adding personal asset.");
    }
  };

  const handleDelete = async (assetId) => {
    if (!window.confirm("Are you sure you want to delete this personal asset?"))
      return;

    try {
      const res = await fetch(API_ENDPOINTS.assets.manageChairpersonAssets, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: assetId }),
      });
      const data = await res.json();
      if (data.success) {
        setPersonalAssets(personalAssets.filter((a) => a.id !== assetId));
        alert("Personal asset deleted successfully!");
      } else {
        alert("Failed to delete personal asset: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting personal asset.");
    }
  };

  // Calculate total value
  const totalValue = personalAssets.reduce(
    (acc, curr) => acc + (parseFloat(curr.value) || 0),
    0
  );

  return (
    <div className="assets-container">
      <div className="assets-header">
        <h3 className="assets-title">Chairperson's Personal Property</h3>
        <button className="asset-btn-add" onClick={() => setIsAdding(true)}>
          + Add Personal Asset
        </button>
      </div>

      <div className="assets-summary-card">
        <div>
          <span className="summary-label">Total Asset Value</span>
          <div className="summary-value">NPR {totalValue.toLocaleString()}</div>
        </div>
        <div>
          <span className="summary-label">Total Items</span>
          <div className="summary-value" style={{ fontSize: "1rem" }}>
            {personalAssets.length}
          </div>
        </div>
      </div>

      {/* Add Personal Asset Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="asset-form-card">
          <h4 className="form-title-small">Add Personal Asset</h4>
          <div className="asset-form-grid">
            <div>
              <label className="stat-label">Asset Type *</label>
              <select
                required
                value={formData.asset_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    asset_type: e.target.value,
                  })
                }
                className="asset-input"
                style={{ backgroundColor: "white" }}
              >
                <option value="land">Land</option>
                <option value="building">Building (House)</option>
                <option value="vehicle">Vehicle</option>
                <option value="bank_account">Bank Account</option>
                <option value="gold_silver">Gold/Silver</option>
                <option value="investment">Investment/Shares</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="stat-label">Asset Name *</label>
              <input
                required
                type="text"
                value={formData.asset_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    asset_name: e.target.value,
                  })
                }
                placeholder="e.g., House in Kathmandu"
                className="asset-input"
              />
            </div>
            <div>
              <label className="stat-label">Value (NPR)</label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    value: e.target.value,
                  })
                }
                placeholder="e.g., 25000000"
                className="asset-input"
              />
            </div>
            <div>
              <label className="stat-label">Location/Details</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: e.target.value,
                  })
                }
                placeholder="e.g., Thamel, Kathmandu"
                className="asset-input"
              />
            </div>
            <div>
              <label className="stat-label">Acquired Date</label>
              <input
                type="date"
                value={formData.acquired_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    acquired_date: e.target.value,
                  })
                }
                className="asset-input"
              />
            </div>
            <div>
              <label className="stat-label">Ownership Type</label>
              <select
                value={formData.ownership_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ownership_type: e.target.value,
                  })
                }
                className="asset-input"
                style={{ backgroundColor: "white" }}
              >
                <option value="self">Self</option>
                <option value="spouse">Spouse</option>
                <option value="family">Family</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="stat-label">Description</label>
              <textarea
                rows="2"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                placeholder="Additional details about the asset"
                className="asset-input"
                style={{ fontFamily: "inherit" }}
              />
            </div>
            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                gap: "8px",
                marginTop: "8px",
              }}
            >
              <button type="submit" className="asset-btn-add">
                Add Asset
              </button>
              <button
                type="button"
                className="asset-btn-add"
                onClick={() => setIsAdding(false)}
                style={{
                  backgroundColor: "#e2e8f0",
                  color: "#475569",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {personalAssets.length === 0 ? (
        <p className="no-assets-msg">
          No personal assets declared for this chairperson.
        </p>
      ) : (
        <div className="assets-table-wrapper">
          <table className="assets-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Asset Name</th>
                <th>Location/Details</th>
                <th>Value (NPR)</th>
                <th>Ownership</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {personalAssets.map((asset) => (
                <tr key={asset.id}>
                  <td style={{ textTransform: "capitalize" }}>
                    {asset.asset_type.replace("_", " ")}
                  </td>
                  <td>{asset.asset_name}</td>
                  <td>{asset.location || "N/A"}</td>
                  <td>
                    {asset.value
                      ? `NPR ${parseFloat(asset.value).toLocaleString()}`
                      : "N/A"}
                  </td>
                  <td style={{ textTransform: "capitalize" }}>
                    {asset.ownership_type}
                  </td>
                  <td>
                    <button
                      className="asset-action-btn asset-delete-btn"
                      onClick={() => handleDelete(asset.id)}
                      title="Delete Asset"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ChairpersonPersonalAssets;
