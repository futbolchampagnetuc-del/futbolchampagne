import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  outputFileTracingRoot: path.join(process.cwd(), ""),
  serverExternalPackages: ["@supabase/supabase-js"],
};

export default nextConfig;
