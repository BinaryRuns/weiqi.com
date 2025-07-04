import type { NextConfig } from "next";

// Get the API URL from environment variable or use default for Docker
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://backend:8080";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/nextauth/:path*",
        destination: "/api/nextauth/:path*",
      },
      {
        source: "/api/:path*", // Proxy all API requests
        destination: `${API_URL}/api/:path*`, // Use environment variable
      },
    ];
  },

  // Don't fail the build on ESLint warnings/errors
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Don't fail the build on TypeScript errors
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
