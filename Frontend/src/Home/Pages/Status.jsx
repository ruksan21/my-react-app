import React, { useEffect } from "react";
import { useWard } from "../Context/WardContext";
import { useLanguage } from "../Context/useLanguage";
import { toNepaliNumber } from "../../data/nepal_locations";

// Working, backend-ready Status component.
const Status = () => {
  const { stats, wardId, refreshStats } = useWard();
  const { t, language } = useLanguage();
  const isNP = language === "NP";

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const followerId = user ? user.id : null;
    refreshStats(wardId, followerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wardId]);

  return (
    <section className="stats-section">
      <div className="stat-card">
        <div className="icon">💼</div>
        <h3>
          {isNP ? toNepaliNumber(stats.totalWorks || 0) : stats.totalWorks || 0}
        </h3>
        <p>{t("profile.total_works")}</p>
      </div>
      <div className="stat-card">
        <div className="icon">✅</div>
        <h3>
          {isNP
            ? toNepaliNumber(stats.completedWorks || 0)
            : stats.completedWorks || 0}
        </h3>
        <p>{t("profile.completed_works")}</p>
      </div>
      <div className="stat-card">
        <div className="icon">⭐</div>
        <h3>{isNP ? toNepaliNumber(stats.rating || 0) : stats.rating || 0}</h3>
        <p>{t("profile.avg_rating")}</p>
      </div>
      <div className="stat-card">
        <div className="icon">👥</div>
        <h3>
          {isNP ? toNepaliNumber(stats.followers || 0) : stats.followers || 0}
        </h3>
        <p>{t("profile.followers")}</p>
      </div>
    </section>
  );
};

export default Status;
