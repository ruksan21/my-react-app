import React, { useEffect } from "react";
import { useWard } from "../Context/WardContext";

// Working, backend-ready Status component.
const Status = () => {
  const { stats, ward, refreshStats } = useWard();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const followerId = user ? user.id : null;
    refreshStats(ward || 1, followerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ward]);

  return (
    <section className="stats-section">
      <div className="stat-card">
        <div className="icon">💼</div>
        <h3>{stats.totalWorks}</h3>
        <p>Total Works</p>
      </div>
      <div className="stat-card">
        <div className="icon">✅</div>
        <h3>{stats.completedWorks}</h3>
        <p>Completed Works</p>
      </div>
      <div className="stat-card">
        <div className="icon">⭐</div>
        <h3>{stats.rating}</h3>
        <p>Average Rating</p>
      </div>
      <div className="stat-card">
        <div className="icon">👥</div>
        <h3>{stats.followers}</h3>
        <p>Followers</p>
      </div>
    </section>
  );
};

export default Status;
