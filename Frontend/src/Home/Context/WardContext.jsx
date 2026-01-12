import React, { createContext, useContext, useState } from "react";
// import axios from 'axios'; // पछि axios प्रयोग गर्दा सजिलो हुन्छ
import { API_ENDPOINTS } from "../../config/api";
import { useAuth } from "./AuthContext";

const WardContext = createContext(null);

export function WardProvider({ children }) {
  // सुरुमा खाली वा डिफल्ट डाटा राख्ने
  const [municipality, setMunicipality] = useState("");
  const [ward, setWard] = useState(null);
  const [wardId, setWardId] = useState(null); // No default - must be set explicitly
  const [stats, setStats] = useState({
    followers: 0,
    rating: 0,
    reviews: 0,
    totalWorks: 0,
    completedWorks: 0,
    isFollowing: false,
  });

  const [hasAutoSwitched, setHasAutoSwitched] = useState(false);
  const { user, wards } = useAuth();

  // Reset auto-switch flag if user changes (login/logout)
  React.useEffect(() => {
    setHasAutoSwitched(false);
  }, [user?.id]);

  // Set default ward or user's ward if none selected
  React.useEffect(() => {
    if (!wards || wards.length === 0) return;

    // 1. Auto-switch to user's ward ONLY ONCE if they just logged in
    if (user && (user.ward_number || user.work_ward) && !hasAutoSwitched) {
      const uWardNum =
        user.role === "officer" ? user.work_ward : user.ward_number;
      const uMuni =
        user.role === "officer" ? user.work_municipality : user.city;

      const matchedWard = wards.find(
        (w) =>
          String(w.number) === String(uWardNum) &&
          (String(w.municipality)
            .toLowerCase()
            .includes(String(uMuni).toLowerCase()) ||
            String(uMuni)
              .toLowerCase()
              .includes(String(w.municipality).toLowerCase()))
      );

      if (matchedWard) {
        setMunicipality(matchedWard.municipality);
        setWard(matchedWard.number);
        setWardId(matchedWard.id);
        setHasAutoSwitched(true);
        console.log(
          `Auto-synced to user's ward: ${matchedWard.municipality} - ${matchedWard.number}`
        );
        return;
      }
    }

    // 2. Fallback to default if no ward selected at all
    if (!wardId) {
      const defaultWard = wards[0];
      setMunicipality(defaultWard.municipality);
      setWard(defaultWard.number);
      setWardId(defaultWard.id);
    }
  }, [wardId, wards, user, hasAutoSwitched]);

  const refreshStats = (currentWardId, followerId) => {
    // Don't fetch if no ward is selected
    if (!currentWardId) {
      console.warn("No ward selected, skipping stats refresh");
      return;
    }

    const followerParam = followerId ? `&follower_id=${followerId}` : "";
    fetch(
      `${API_ENDPOINTS.stats.getProfileStats}?ward_id=${currentWardId}${followerParam}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats({
            followers: data.followers || 0,
            rating: data.rating || 0,
            reviews: data.reviews || 0,
            totalWorks: data.totalWorks || 0,
            completedWorks: data.completedWorks || 0,
            isFollowing: data.isFollowing || false,
          });
        }
      })
      .catch((err) => console.error("Error fetching global stats:", err));
  };

  const value = {
    municipality,
    ward,
    wardId, // Expose ID
    stats,
    setMunicipality,
    setWard,
    setWardId, // Expose setter
    setStats,
    refreshStats,
  };

  return <WardContext.Provider value={value}>{children}</WardContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWard() {
  return useContext(WardContext);
}
