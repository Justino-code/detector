import 'dotenv/config';
import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'PlantaVigia',
  slug: 'detector-app',
  version: '0.0.1',
  orientation: 'portrait',
  icon: './assets/logo.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/logo.png',
    resizeMode: 'contain',
    backgroundColor: '#121212',
  },
  ios: {
    bundleIdentifier: 'com.justinocode.detectorapp',
    supportsTablet: true,
  },
  android: {
    package: 'com.justinocode.detectorapp',
    permessions: [
      'CAMERA'
    ],
    adaptiveIcon: {
      foregroundImage: './assets/logo.png',
      backgroundColor: '#121212',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    EXPO_PUBLIC_PLANTNET_API_URL: 'https://my-api.plantnet.org/v2/identify',
    EXPO_PUBLIC_PLANTNET_DISEASES_API_URL: 'https://my-api.plantnet.org/v2/diseases/identify',
    EXPO_PUBLIC_PLANTNET_API_KEY: '2b10NUANgaKd5MMW3M42RO0',
    EXPO_PUBLIC_KINDUISE_API_URL: process.env.EXPO_PUBLIC_KINDUISE_API_URL,
    EXPO_PUBLIC_KINDUISE_API_KEY: process.env.EXPO_PUBLIC_KINDUISE_API_KEY,

    EXPO_PUBLIC_APP_NAME: 'PlantaVigia',
    EXPO_PUBLIC_APP_VERSION: '0.0.1',

    eas: {
        projectId: '6a655d67-54fb-4732-b2b5-d9eebaf2f1db'
      }
  },
  jsEngine: 'hermes',
});
