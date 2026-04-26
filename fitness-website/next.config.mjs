/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Exclude server-only packages from client bundle
  serverExternalPackages: ['firebase-admin'],
  // Tree-shake heavy libraries — only import what's used
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'date-fns',
      'framer-motion',
      '@radix-ui/react-icons',
    ],
  },
};

export default nextConfig;
