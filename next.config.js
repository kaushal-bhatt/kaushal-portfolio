/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces .next/standalone — a self-contained server with only the
  // dependencies actually traced. The Dockerfile has always copied this
  // directory, but without this option Next never produced it, so the image
  // build failed at that COPY and had never succeeded.
  output: 'standalone',

  // Lint failures fail the build again. This was `true`, which turned out to be
  // hiding not a pile of errors but the absence of any ESLint configuration at
  // all — `next lint` had never been run, so there was nothing to ignore.
  eslint: {
    ignoreDuringBuilds: false,
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
