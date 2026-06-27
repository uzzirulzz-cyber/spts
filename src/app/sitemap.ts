import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /sitemap.xml — dynamic sitemap with categories + top channels
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://playbeat-arena.example.com';
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'hourly', priority: 1.0 },
    { url: `${base}/?view=live`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/?view=football`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/?view=cricket`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/?view=wrestling`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/?view=other-sports`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/?view=search`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
  ];

  // Top 200 channels by views → individual channel "pages"
  const topChannels = await db.channel.findMany({
    where: { enabled: true },
    orderBy: { viewCount: 'desc' },
    take: 200,
    select: { id: true, name: true, updatedAt: true },
  });

  const channelEntries: MetadataRoute.Sitemap = topChannels.map((c) => ({
    url: `${base}/?ch=${encodeURIComponent(c.id)}`,
    lastModified: c.updatedAt,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [...staticEntries, ...channelEntries];
}
