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
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
        {wardError && (
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(239, 68, 68, 0.05))",
              border: "2px solid rgba(220, 38, 38, 0.5)",
              borderRadius: "16px",
              padding: "20px 24px",
              marginBottom: "24px",
              color: "#dc2626",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "16px",
              backdropFilter: "blur(10px)",
            }}
          >
            <span style={{ fontSize: "28px" }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, marginBottom: "4px", fontSize: "1.1rem" }}>
                Ward Not Found
              </div>
              <div style={{ fontSize: "0.9em", opacity: 0.9 }}>{wardError}</div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
            borderRadius: "20px",
            padding: "32px",
            marginBottom: "28px",
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", right: "-20px", top: "-20px", fontSize: "120px", opacity: 0.1 }}>
            🏢
          </div>
          <h2 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, marginBottom: "8px" }}>
            📦 Registered Assets
          </h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: "1rem" }}>
            {workLocation
              ? `${workLocation.work_municipality}, Ward ${workLocation.work_ward}`
              : `Ward ${wardId}`}
            <span style={{ 
              background: "rgba(255,255,255,0.2)", 
              padding: "4px 12px", 
              borderRadius: "20px", 
              marginLeft: "12px",
              fontSize: "0.9rem",
              fontWeight: 600
            }}>
              {assets.length} Assets
            </span>
          </p>
          <button
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
            style={{
              marginTop: "20px",
              background: "white",
              color: "#1e3a8a",
              border: "none",
              padding: "12px 24px",
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.2)";
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>+</span> Add New Asset
          </button>
        </div>

        {isLoading ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "white",
            borderRadius: "16px",
            color: "#64748b"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⏳</div>
            <p style={{ margin: 0, fontSize: "1.1rem" }}>Loading assets...</p>
          </div>
        ) : assets.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            borderRadius: "16px",
            border: "2px dashed #cbd5e1"
          }}>
            <div style={{ fontSize: "4rem", marginBottom: "16px" }}>📭</div>
            <p style={{ margin: 0, fontSize: "1.2rem", color: "#475569", fontWeight: 600 }}>
              No assets registered yet
            </p>
            <p style={{ margin: "8px 0 0", color: "#94a3b8" }}>
              Click "Add New Asset" to register your first asset
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px"
          }}>
            {assets.map((asset) => (
              <div
                key={asset.id}
                style={{
                  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  cursor: "default",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.12)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
                }}
              >
                {/* Asset Icon */}
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: asset.asset_type === "Electronics" ? "linear-gradient(135deg, #dbeafe, #bfdbfe)" :
                             asset.asset_type === "Vehicle" ? "linear-gradient(135deg, #fef3c7, #fde68a)" :
                             asset.asset_type === "Furniture" ? "linear-gradient(135deg, #d1fae5, #a7f3d0)" :
                             asset.asset_type === "Land" ? "linear-gradient(135deg, #fce7f3, #fbcfe8)" :
                             "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  marginBottom: "16px"
                }}>
                  {asset.asset_type === "Electronics" ? "💻" :
                   asset.asset_type === "Vehicle" ? "🚗" :
                   asset.asset_type === "Furniture" ? "🪑" :
                   asset.asset_type === "Land" ? "🏞️" :
                   asset.asset_type === "Machinery" ? "⚙️" : "📦"}
                </div>

                {/* Asset Name & Type */}
                <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 700, color: "#1e293b" }}>
                  {asset.asset_name}
                </h3>
                <p style={{ margin: "0 0 16px", fontSize: "0.85rem", color: "#64748b" }}>
                  {asset.asset_type}
                </p>

                {/* Value */}
                <div style={{
                  background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  marginBottom: "16px"
                }}>
                  <div style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Asset Value
                  </div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#047857" }}>
                    Rs. {parseInt(asset.value || 0).toLocaleString()}
                  </div>
                </div>

                {/* Meta Info */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    📅 {asset.acquisition_date || "N/A"}
                  </div>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    background: asset.status === "active" ? "#dcfce7" :
                               asset.status === "damaged" ? "#fee2e2" :
                               asset.status === "maintenance" ? "#fef3c7" : "#f1f5f9",
                    color: asset.status === "active" ? "#059669" :
                           asset.status === "damaged" ? "#dc2626" :
                           asset.status === "maintenance" ? "#d97706" : "#64748b"
                  }}>
                    {asset.status}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => handleEdit(asset)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "10px",
                      border: "none",
                      background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                      color: "white",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      transition: "opacity 0.2s"
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "10px",
                      border: "2px solid #fee2e2",
                      background: "white",
                      color: "#dc2626",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      transition: "all 0.2s"
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              borderRadius: "24px",
              padding: "32px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
              animation: "slideUp 0.3s ease-out"
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
              paddingBottom: "16px",
              borderBottom: "2px solid #f1f5f9"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.4rem"
                }}>
                  {isEditing ? "✏️" : "📦"}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#1e293b" }}>
                    {isEditing ? "Edit Asset" : "Add New Asset"}
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#94a3b8" }}>
                    {isEditing ? "Update asset details" : "Register a new ward asset"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#f1f5f9",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                  transition: "all 0.2s"
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "8px", color: "#475569", fontWeight: 600 }}>
                  Asset Name
                </label>
                <input
                  type="text"
                  name="asset_name"
                  value={formData.asset_name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Dell Latitude Laptop"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: "2px solid #e2e8f0",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                    background: "#f8fafc",
                    transition: "all 0.2s"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "8px", color: "#475569", fontWeight: 600 }}>
                  Asset Type
                </label>
                <select
                  name="asset_type"
                  value={formData.asset_type}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: "2px solid #e2e8f0",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                    background: "#f8fafc",
                    cursor: "pointer"
                  }}
                >
                  <option value="">Select Type</option>
                  <option value="Electronics">💻 Electronics</option>
                  <option value="Furniture">🪑 Furniture</option>
                  <option value="Vehicle">🚗 Vehicle</option>
                  <option value="Land">🏞️ Land</option>
                  <option value="Machinery">⚙️ Machinery</option>
                  <option value="Other">📦 Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "8px", color: "#475569", fontWeight: 600 }}>
                  Value (Estimated NPR)
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute",
                    left: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontWeight: 600,
                    color: "#3b82f6",
                    background: "#e0e7ff",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "0.85rem"
                  }}>Rs</span>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    style={{
                      width: "100%",
                      padding: "14px 16px 14px 60px",
                      borderRadius: "12px",
                      border: "2px solid #e2e8f0",
                      fontSize: "1rem",
                      boxSizing: "border-box",
                      background: "#f8fafc"
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "8px", color: "#475569", fontWeight: 600 }}>
                  Acquisition Date
                </label>
                <input
                  type="date"
                  name="acquisition_date"
                  value={formData.acquisition_date}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: "2px solid #e2e8f0",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                    background: "#f8fafc"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "8px", color: "#475569", fontWeight: 600 }}>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: "2px solid #e2e8f0",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                    background: "#f8fafc",
                    cursor: "pointer"
                  }}
                >
                  <option value="active">✅ Active/Working</option>
                  <option value="damaged">⚠️ Damaged</option>
                  <option value="lost">❌ Lost</option>
                  <option value="maintenance">🔧 Under Maintenance</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "8px", paddingTop: "16px", borderTop: "2px solid #f1f5f9" }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "12px",
                    border: "none",
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "1rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)"
                  }}
                >
                  {isEditing ? "💾 Update Asset" : "📦 Register Asset"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "12px",
                    border: "2px solid #e2e8f0",
                    background: "white",
                    color: "#64748b",
                    fontWeight: 600,
                    fontSize: "1rem",
                    cursor: "pointer"
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
