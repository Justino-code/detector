// src/hooks/useDetection.ts
import { useState } from 'react';
import DetectionService from '../services/DetectionService';

export function useDetection() {
  const [loading, setLoading] = useState(false);

  const detect = async (imageUri: string) => {
    setLoading(true);
    try {
      return await DetectionService.completeAnalysis(imageUri);
    } finally {
      setLoading(false);
    }
  };

  return {
    detect,
    loading,
  };
}
