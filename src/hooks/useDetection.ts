// src/hooks/useDetection.ts
import { useState } from 'react';
import { PreprocessImage } from '../utils/preprocessImage';
import DetectionService from '../services/DetectionService';

export function useDetection() {
  const [loading, setLoading] = useState(false);

  const detect = async (imageUri: string) => {
    setLoading(true);
    try {
      if(DetectionService.withPreprocess){
        const processed = await DetectionService.preprocessImage(imageUri);
        return await DetectionService.completeAnalysis(processed);
      }else{
        return await DetectionService.completeAnalysis(imageUri);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    detect,
    loading,
  };
}
