import { useState, useEffect } from "react";
import { useAuth } from "../Home/Context/AuthContext";

/**
 * Custom hook to check if officer's assigned ward exists in the system
 * Returns: { wardExists, isLoading, wardId }
 * - wardExists: boolean - true if ward exists, false if not
 * - isLoading: boolean - true while checking
 * - wardId: number|null - the ward ID if exists
 */
export const useWardVerification = () => {
  const { user, getOfficerWorkLocation } = useAuth();
  const workLocation = getOfficerWorkLocation();
  const [wardExists, setWardExists] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wardId, setWardId] = useState(null);

  useEffect(() => {
    const checkWardExists = async () => {
      if (user && user.role === "officer" && workLocation) {
        setIsLoading(true);
        try {
          const response = await fetch(
            `http://localhost/my-react-app/Backend/api/wards/verify_ward_exists.php?province=${encodeURIComponent(
              workLocation.work_province
            )}&district=${encodeURIComponent(
              workLocation.work_district
            )}&municipality=${encodeURIComponent(
              workLocation.work_municipality
            )}&ward_number=${workLocation.work_ward}`
          );
          const data = await response.json();
          setWardExists(data.exists || false);
          setWardId(data.ward_id || null);
        } catch (error) {
          console.error("Error checking ward:", error);
          setWardExists(false);
          setWardId(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkWardExists();
  }, [user, workLocation]);

  return { wardExists, isLoading, wardId };
};
