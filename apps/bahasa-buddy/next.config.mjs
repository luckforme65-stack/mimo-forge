/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@mimoforge/sdk'],
  experimental: {
    serverActions: { bodySizeLimit: '8mb' },
  },
};

export default nextConfig;
