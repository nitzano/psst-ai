import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Explicitly indicate we're using the Pages Router
  // (this is the default, but good to be explicit)
  useFileSystemPublicRoutes: true,
};

export default nextConfig;
