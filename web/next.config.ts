import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "or-cloud-model-prod.s3.dualstack.us-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "makerworld.bblmw.com",
      },
    ],
  },
};

export default nextConfig;
