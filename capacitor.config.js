/** @type {import('@capacitor/cli').CapacitorConfig} */
module.exports = {
  appId: 'com.telugudb.app',
  appName: 'Watchdb HD',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: 'https://watchdbhd.vercel.app',
  },
  plugins: {
    AdMob: {
      initializeForTesting: false,
    },
  },
};
