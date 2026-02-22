/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.55.104", "192.168.55.105", "localhost:3000", "localhost:3001"],
  images: {
    domains: ["localhost", "res.cloudinary.com", "img.youtube.com", "i.ytimg.com", "drive.google.com", "lh3.googleusercontent.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    ADMIN_KEY: process.env.ADMIN_KEY,
    NEXT_PUBLIC_ADSENSE_ENABLED: process.env.NEXT_PUBLIC_ADSENSE_ENABLED,
    NEXT_PUBLIC_ADSENSE_CLIENT_ID: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
  },
};

module.exports = nextConfig;
