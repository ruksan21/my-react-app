import React, { useState, useEffect } from "react";

const ChairpersonPersonalAssets = ({ wardId }) => {
  const API_URL = "http://localhost/my-react-app/Backend/api";
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
  }, [wardId]);

  const fetchPersonalAssets = async () => {
    try {
      const res = await fetch(
        `${API_URL}/manage_chairperson_assets.php?ward_id=${wardId}`
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
      const res = await fetch(`${API_URL}/manage_chairperson_assets.php`, {
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
      alert("Error adding personal asset.");
    }
  };

  const handleDelete = async (assetId) => {
    if (!window.confirm("Are you sure you want to delete this personal asset?"))
      return;

    try {
      const res = await fetch(`${API_URL}/manage_chairperson_assets.php`, {
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
      alert("Error deleting personal asset.");
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
          Chairperson's Personal Property
        </h3>
        <button
          className="action-btn approve"
          onClick={() => setIsAdding(true)}
          style={{ fontSize: "0.9rem" }}
        >
          + Add Personal Asset
        </button>
      </div>

      {/* Add Personal Asset Form */}
      {isAdding && (
        <form
          onSubmit={handleAdd}
          style={{
            marginBottom: "20px",
            padding: "16px",
            backgroundColor: "var(--bg-secondary)",
            borderRadius: "8px",
          }}
        >
          <h4 style={{ marginTop: 0 }}>Add Personal Asset</h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
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
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  marginTop: "4px",
                }}
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
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  marginTop: "4px",
                }}
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
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  marginTop: "4px",
                }}
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
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  marginTop: "4px",
                }}
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
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  marginTop: "4px",
                }}
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
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  marginTop: "4px",
                }}
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
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  marginTop: "4px",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button
              type="submit"
              className="action-btn approve"
              style={{ fontSize: "0.9rem" }}
            >
              Add Personal Asset
            </button>
            <button
              type="button"
              className="action-btn"
              onClick={() => setIsAdding(false)}
              style={{
                backgroundColor: "var(--text-muted)",
                fontSize: "0.9rem",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {personalAssets.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>
          No personal assets declared for this chairperson.
        </p>
      ) : (
        <table className="admin-table">
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
                    className="action-btn delete"
                    onClick={() => handleDelete(asset.id)}
                    style={{ fontSize: "0.85rem", padding: "6px 12px" }}
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
  );
};

export default ChairpersonPersonalAssets;
