import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Only configure fallbacks for webpack (used in production)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve("buffer/"),
        fs: false,
        path: false,
      }
    }

    return config
  },
}

export default nextConfig
