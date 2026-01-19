import type { NextConfig } from "next";

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* config options here */
  async rewrites() {
    return [
      // Only rewrite OCR and translator APIs to Python backend
      {
        source: '/api/ocr/:path*',
        destination: 'http://localhost:8000/api/ocr/:path*',
      },
      {
        source: '/api/translator/:path*',
        destination: 'http://localhost:8000/api/translator/:path*',
      },
      {
        source: '/docs',
        destination: 'http://localhost:8000/docs',
      },
      {
        source: '/openapi.json',
        destination: 'http://localhost:8000/openapi.json',
      },
    ];
  },
};

export default nextConfig;
