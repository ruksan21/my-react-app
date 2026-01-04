import React, { useState, useEffect, useCallback } from "react";
import "./Assets.css";
import { useWard } from "../Context/WardContext";
import Navbar from "../Nav/Navbar";
import { API_ENDPOINTS } from "../../config/api";

const AssetCard = ({ icon, title, subtitle, value, description }) => (
  <div className="asset-card">
    <div className="asset-header">
      <span className="asset-icon">{icon}</span>
      <div>
        <div className="asset-title">{title}</div>
        <div className="asset-subtitle">{subtitle}</div>
      </div>
    </div>
    <div className="asset-body">
      <div className="asset-label">Value</div>
      <div className="asset-value">Rs. {value}</div>
      <div className="asset-label">Description</div>
      <div className="asset-desc">{description}</div>
    </div>
  </div>
);

// Map asset types to icons
const getAssetIcon = (assetType) => {
  const iconMap = {
    Electronics: "💻",
    Furniture: "🪑",
    Vehicle: "🚗",
    Land: "⛏️",
    Machinery: "⚙️",
    Other: "📦",
  };
  return iconMap[assetType] || "📦";
};

export default function Assets({ embedded = false }) {
  const { municipality, ward, wardId } = useWard();
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_ENDPOINTS.assets.manageWardAssets}?ward_id=${wardId}`
      );
      const data = await res.json();
      if (data.success) {
        setAssets(data.data || []);
      } else {
        setError("Failed to load assets");
      }
    } catch (err) {
      console.error("Failed to fetch assets:", err);
      setError("Error connecting to server");
    } finally {
      setIsLoading(false);
    }
  }, [wardId]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return (
    <>
      {!embedded && <Navbar showHomeContent={false} />}
      <div className={`assets-page ${embedded ? "embedded" : ""}`}>
        {embedded && (
          <div className="embedded-header" style={{ marginBottom: 12 }}>
            <span className="embedded-pin">📍</span>
            <span className="embedded-title">
              {municipality} - Ward {ward}
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="assets-note">Loading assets...</div>
        ) : error ? (
          <div className="assets-note" style={{ color: "#ef4444" }}>
            {error}
          </div>
        ) : assets.length === 0 ? (
          <div className="assets-note">
            No assets have been registered for Ward {ward} yet.
          </div>
        ) : (
          <>
            <div className="assets-grid">
              {assets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  icon={getAssetIcon(asset.asset_type)}
                  title={asset.asset_name}
                  subtitle={`${asset.asset_type} - Ward ${ward}`}
                  value={parseInt(asset.value || 0).toLocaleString()}
                  description={asset.description || "No description"}
                />
              ))}
            </div>
            <div className="assets-note">
              Showing {assets.length} asset{assets.length !== 1 ? "s" : ""} for
              Ward {ward}.
            </div>
          </>
        )}
      </div>
    </>
  );
}
