import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8001/:path*',
      },
    ];
  },
  
  async headers() {
    // Log port information when Next.js starts
    const port = process.env.PORT || 3001;
    console.log(`🚀 Next.js Frontend is starting on http://localhost:${port}`);
    console.log(`🔗 Apollo Client configured for API at ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/graphql'}`);
    
    return [];
  },
};

export default nextConfig;
