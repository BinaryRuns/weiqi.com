import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/:path*", // Proxy all API requests
        destination: "http://localhost:8080/api/:path*", // Spring Boot backend
      },
    ];
  },
};

export default nextConfig;
