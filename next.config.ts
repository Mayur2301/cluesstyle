import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.23.190.17', '192.168.31.139'],

  // typescript: {
  //   ignoreBuildErrors: true,
  // },
output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.cluesstyle.com',
        pathname: '/public/**',
      },
    ],
  },
};

export default nextConfig;