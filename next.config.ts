import type { NextConfig } from "next";

// Allow configuring backend origin via env; default to localhost:3000
const backendOrigin = process.env.BACKEND_ORIGIN || "http://localhost:4400";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
