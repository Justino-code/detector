import { useEffect, useState } from 'react';
import DetectionService from '../services/DetectionService';

export function useDetectionSimulation(pollInterval = 300) {
  const [withSimulate, setWithSimulate] = useState(DetectionService.getSimulationMode());

  useEffect(() => {
    const interval = setInterval(() => {
      const current = DetectionService.getSimulationMode();
      setWithSimulate((prev) => {
        if (prev !== current) return current;
        return prev; // evita re-render desnecessário
      });
    }, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval]);

  return withSimulate;
}
