import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { AnalyticsDTO } from '@/lib/types';

export const dynamic = 'force-dynamic';

// GET /api/analytics — dashboard metrics
export async function GET() {
  const [
    totalChannels,
    onlineChannels,
    offlineChannels,
    disabledChannels,
    totalPlaylists,
    activePlaylists,
    featuredChannels,
    trendingChannels,
    liveNowChannels,
    totalFavorites,
    totalUsers,
    channelViews,
    errorLogs,
    importLogs,
  ] = await Promise.all([
    db.channel.count(),
    db.channel.count({ where: { status: 'online' } }),
    db.channel.count({ where: { status: 'offline' } }),
    db.channel.count({ where: { enabled: false } }),
    db.playlist.count(),
    db.playlist.count({ where: { enabled: true, status: 'active' } }),
    db.channel.count({ where: { featured: true } }),
    db.channel.count({ where: { trending: true } }),
    db.channel.count({ where: { liveNow: true } }),
    db.favorite.count(),
    db.user.count(),
    db.channel.aggregate({ _sum: { viewCount: true } }),
    db.importLog.count({ where: { status: 'error' } }),
    db.importLog.count(),
  ]);

  const byCategoryRows = await db.channel.groupBy({
    by: ['category'],
    _count: true,
    orderBy: { _count: { category: 'desc' } },
  });

  const playlists = await db.playlist.findMany();
  const playlistHealth = playlists.map((p) => ({
    id: p.id,
    name: p.name,
    channelCount: p.channelCount,
    onlineCount: p.onlineCount,
    offlineCount: p.offlineCount,
    health: p.channelCount > 0 ? Math.round((p.onlineCount / p.channelCount) * 100) : 0,
  }));

  const topChannelsRows = await db.channel.findMany({
    orderBy: { viewCount: 'desc' },
    take: 10,
    select: { id: true, name: true, viewCount: true, logo: true },
  });

  // Recent import logs (for the Activity / Import History widget).
  const recentLogRows = await db.importLog.findMany({
    include: { playlist: true },
    orderBy: { createdAt: 'desc' },
    take: 8,
  });

  // Buffer statistics: derived from recent import durations as a proxy for
  // "how long stream operations take". In a real deployment this would come
  // from client-side telemetry. We compute avg + p95 from lastRefreshMs.
  const refreshSamples = playlists
    .filter((p) => p.lastRefreshMs > 0)
    .map((p) => p.lastRefreshMs);
  const bufferStats = {
    samples: refreshSamples.length,
    avgMs: refreshSamples.length
      ? Math.round(refreshSamples.reduce((a, b) => a + b, 0) / refreshSamples.length)
      : 0,
    p95Ms: refreshSamples.length
      ? Math.round(refreshSamples.sort((a, b) => a - b)[Math.floor(refreshSamples.length * 0.95)] ?? 0)
      : 0,
  };

  // "Active streams" = channels currently marked live now (a proxy for
  // concurrent active playback sessions).
  const activeStreams = liveNowChannels;

  const dto: AnalyticsDTO = {
    totalChannels,
    onlineChannels,
    offlineChannels,
    disabledChannels,
    totalPlaylists,
    activePlaylists,
    featuredChannels,
    trendingChannels,
    liveNowChannels,
    totalFavorites,
    totalViews: channelViews._sum.viewCount ?? 0,
    totalUsers,
    activeStreams,
    streamErrors: errorLogs,
    importRuns: importLogs,
    byCategory: byCategoryRows.map((r) => ({ category: r.category, count: r._count })),
    playlistHealth,
    topChannels: topChannelsRows,
    bufferStats,
    recentLogs: recentLogRows.map((l) => ({
      id: l.id,
      playlist: l.playlist?.name ?? 'Unknown',
      status: l.status,
      imported: l.imported,
      duplicates: l.duplicates,
      errors: l.errors,
      createdAt: l.createdAt.toISOString(),
    })),
  };

  return NextResponse.json(dto);
}
