// Helpers to convert Prisma records into DTOs for the API.

import type { Channel, Playlist } from '@prisma/client';
import type { ChannelDTO, PlaylistDTO } from './types';

export function toChannelDTO(
  ch: Channel & { playlist?: Playlist | null },
  isFavorite = false,
  isSubscribed = false,
): ChannelDTO {
  return {
    id: ch.id,
    name: ch.name,
    displayName: ch.displayName,
    url: ch.url,
    logo: ch.logo,
    category: ch.category,
    subcategory: ch.subcategory,
    country: ch.country,
    language: ch.language,
    tvgName: ch.tvgName,
    groupTitle: ch.groupTitle,
    status: ch.status,
    enabled: ch.enabled,
    featured: ch.featured,
    trending: ch.trending,
    liveNow: ch.liveNow,
    viewCount: ch.viewCount,
    sourceId: ch.sourceId,
    sourceName: ch.playlist?.name ?? 'Unknown',
    isFavorite,
    isSubscribed,
  };
}

/** Mask credentials in URLs so they're never exposed to the client.
 *  Replaces username=XXX&password=YYY with username=***&password=*** */
function maskUrl(url: string): string {
  return url
    .replace(/(username=)[^&]+/gi, '$1***')
    .replace(/(password=)[^&]+/gi, '$1***')
    .replace(/(\/)[^/]+:[^/@]+@/g, '$1***:***@');
}

export function toPlaylistDTO(pl: Playlist): PlaylistDTO {
  return {
    id: pl.id,
    name: pl.name,
    url: maskUrl(pl.url),
    status: pl.status,
    channelCount: pl.channelCount,
    onlineCount: pl.onlineCount,
    offlineCount: pl.offlineCount,
    lastRefreshAt: pl.lastRefreshAt ? pl.lastRefreshAt.toISOString() : null,
    lastRefreshMs: pl.lastRefreshMs,
    nextRefreshAt: pl.nextRefreshAt ? pl.nextRefreshAt.toISOString() : null,
    refreshHours: pl.refreshHours,
    errorMessage: pl.errorMessage,
    enabled: pl.enabled,
  };
}
