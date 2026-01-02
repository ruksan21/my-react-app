import React, { createContext, useContext, useState } from "react";
// import axios from 'axios'; // पछि axios प्रयोग गर्दा सजिलो हुन्छ

const WardContext = createContext(null);

export function WardProvider({ children }) {
  // सुरुमा खाली वा डिफल्ट डाटा राख्ने
  const [municipality, setMunicipality] = useState(
    "Kathmandu Metropolitan City"
  );
  const [ward, setWard] = useState(1);
  const [wardId, setWardId] = useState(1); // Track database ID
  const [stats, setStats] = useState({
    followers: 0,
    rating: 0,
    reviews: 0,
    totalWorks: 0,
    completedWorks: 0,
    isFollowing: false,
  });

  const refreshStats = (currentWardId, followerId) => {
    // We use the ID for fetching stats
    const followerParam = followerId ? `&follower_id=${followerId}` : "";
    fetch(
      `http://127.0.0.1/my-react-app/Backend/api/get_profile_stats.php?ward_id=${currentWardId}${followerParam}`
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
