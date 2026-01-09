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

  const { wards } = useAuth();

  // Set default ward if none selected
  React.useEffect(() => {
    if (!wardId && wards && wards.length > 0) {
      // Default to the first ward in the list
      const defaultWard = wards[0];
      setMunicipality(defaultWard.municipality);
      setWard(defaultWard.number);
      setWardId(defaultWard.id);
    }
  }, [wardId, wards]);

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
