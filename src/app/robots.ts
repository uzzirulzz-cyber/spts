import type { MetadataRoute } from 'next';

// GET /robots.txt
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/admin/', '/api/ads/', '/api/revenue'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
    ],
    sitemap: 'https://playbeat-arena.example.com/sitemap.xml',
    host: 'https://playbeat-arena.example.com',
  };
}
