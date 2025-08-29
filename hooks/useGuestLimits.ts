import { useState, useEffect } from 'react';
import { getFreemiumPlantInfo } from '../services/plantService';
import { useAuth } from '../services/authContext';

interface GuestLimitsData {
  viewedCount: number;
  maxViewedPlants: number;
  plantsViewed: string[];
  maxGrowingPlants: number;
  loading: boolean;
}

export const useGuestLimits = (): GuestLimitsData => {
  const { isGuest } = useAuth();
  const [limitsData, setLimitsData] = useState<GuestLimitsData>({
    viewedCount: 0,
    maxViewedPlants: 50, // Aumentado para testing
    plantsViewed: [],
    maxGrowingPlants: 50, // Aumentado para testing  
    loading: true,
  });

  useEffect(() => {
    const loadLimits = async () => {
      if (!isGuest) {
        setLimitsData({
          viewedCount: 0,
          maxViewedPlants: Infinity,
          plantsViewed: [],
          maxGrowingPlants: Infinity,
          loading: false,
        });
        return;
      }

      try {
        const info = await getFreemiumPlantInfo(isGuest);
        setLimitsData({
          viewedCount: info.viewedCount,
          maxViewedPlants: 50, // Aumentado para testing
          plantsViewed: info.plantsViewed,
          maxGrowingPlants: 50, // Aumentado para testing
          loading: false,
        });
      } catch (error) {
        setLimitsData(prev => ({
          ...prev,
          loading: false,
        }));
      }
    };

    loadLimits();
  }, [isGuest]);

  return limitsData;
}; 