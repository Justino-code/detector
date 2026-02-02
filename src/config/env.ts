// src/config/env.ts
import Constants from 'expo-constants';

const extra =
  Constants.expoConfig?.extra ??
  Constants.manifest?.extra ??
  {};

export const ENV = {
  PLANTNET_API_URL: { 
    IDENTIFIED: extra.EXPO_PUBLIC_PLANTNET_API_URL as string,
    DISEASES:   extra.EXPO_PUBLIC_PLANTNET_DISEASES_API_URL as string,
  },
  
  PLANTNET_API_KEY: extra.EXPO_PUBLIC_PLANTNET_API_KEY as string,
  KINDUISE_API_URL: extra.EXPO_PUBLIC_KINDUISE_API_URL as string,
  KINDUISE_API_KEY: extra.EXPO_PUBLIC_KINDUISE_API_KEY as string,
};

export const APP_INFO = {
  APP_NAME: extra.EXPO_PUBLIC_APP_NAME as string,
  APP_VERSION: extra.EXPO_PUBLIC_APP_VERSION
}
