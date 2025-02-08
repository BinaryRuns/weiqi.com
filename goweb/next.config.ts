import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/nextauth/:path*",
        destination: "/api/nextauth/:path*",
      },
      {
        source: "/api/:path*", // Proxy all API requests
        destination: "http://backend:8080/api/:path*", // Use Docker service name
      },
    ];
  },
};

export default nextConfig;
