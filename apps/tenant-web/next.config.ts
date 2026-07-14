import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@aptis/ui", "@aptis/api-client"],
  turbopack: {
    root: "../../",
  },
};

export default nextConfig;
