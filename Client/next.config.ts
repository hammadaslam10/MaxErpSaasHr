import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@reduxjs/toolkit', 'react-redux'],
  experimental: {
    optimizePackageImports: ['@reduxjs/toolkit', 'react-redux'],
  },
};

export default nextConfig;
