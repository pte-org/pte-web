import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@pte/ui", "@pte/api-client"],
  turbopack: {
    root: "../../",
  },
};

export default nextConfig;
