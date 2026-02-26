import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.telugudb.app',
  appName: 'TeluguDB',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: 'https://your-app.vercel.app',
  },
};

export default config;
