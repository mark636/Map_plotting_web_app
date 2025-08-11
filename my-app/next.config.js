/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Remove our custom alias – let Next.js resolve CSS from node_modules via "~"
    return config;
  },
};

module.exports = nextConfig;