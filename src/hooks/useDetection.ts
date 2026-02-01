// src/hooks/useDetection.ts
import { useState } from 'react';
import { PreprocessImage } from '../utils/preprocessImage';
import DetectionService from '../services/DetectionService';

export function useDetection() {
  const [loading, setLoading] = useState(false);

  const detect = async (imageUri: string) => {
    setLoading(true);
    try {
      const processed = await PreprocessImage.preprocess(imageUri);
      return await DetectionService.completeAnalysis(processed.base64Image);
    } finally {
      setLoading(false);
    }
  };

  return {
    detect,
    loading,
  };
}
