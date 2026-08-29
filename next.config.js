/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces .next/standalone — a self-contained server with only the
  // dependencies actually traced. The Dockerfile has always copied this
  // directory, but without this option Next never produced it, so the image
  // build failed at that COPY and had never succeeded.
  output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { 
    unoptimized: true 
  },
  
  // Better webpack config for production
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
