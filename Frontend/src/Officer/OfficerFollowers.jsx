import React, { useState, useEffect } from "react";
import OfficerLayout from "./OfficerLayout";
import "./OfficerFollowers.css";
import { API_ENDPOINTS } from "../config/api";

const OfficerFollowers = () => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) {
      fetch(
        `${API_ENDPOINTS.officers.getFollowers}?officer_id=${user.id}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setFollowers(data.data);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, []);

  return (
    <OfficerLayout title="My Followers">
      <div className="followers-container">
        {loading ? (
          <p>Loading followers...</p>
        ) : followers.length === 0 ? (
          <div className="followers-no-data">
            <span className="followers-no-data-icon">👥</span>
            <h3>No followers yet</h3>
            <p>Citizens from any ward can follow you to get updates.</p>
          </div>
        ) : (
          <div className="followers-grid">
            {followers.map((follower) => (
              <div key={follower.id} className="follower-card">
                <div className="follower-avatar">
                  {follower.first_name.charAt(0)}
                </div>
                <div className="follower-info">
                  <h4 className="follower-name">
                    {follower.first_name} {follower.last_name}
                  </h4>
                  <p className="follower-location">
                    Ward {follower.ward_number}, {follower.district}
                  </p>
                  <p className="follower-email">{follower.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </OfficerLayout>
  );
};

export default OfficerFollowers;
