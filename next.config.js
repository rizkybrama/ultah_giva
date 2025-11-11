/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use standalone output in production
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
  
  // Enable Fast Refresh (default in Next.js, but make sure it's enabled)
  reactStrictMode: true,
  
  // Webpack configuration for better hot reload
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Ensure HMR is enabled
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
      };
      
      // Watch options for better file watching
      // Use polling for iCloud Drive compatibility
      config.watchOptions = {
        poll: 1000, // Poll every 1 second for iCloud Drive compatibility
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
      };
    }
    return config;
  },
}

module.exports = nextConfig

