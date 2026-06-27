// Shared TypeScript types for the IPTV Sports Streaming Platform.

export interface ParsedChannel {
  name: string;
  url: string;
  logo?: string;
  tvgId?: string;
  tvgName?: string;
  groupTitle?: string;
  country?: string;
  language?: string;
}

export interface CategoryRule {
  category: string;
  subcategory: string | null;
  keywords: string[];
  /** higher priority wins when multiple rules match */
  priority: number;
}

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  icon?: string;
  color?: string;
  keywords: string;
  isCustom: boolean;
  sortOrder: number;
}

export interface ChannelDTO {
  id: string;
  name: string;
  displayName: string;
  url: string;
  logo: string | null;
  category: string;
  subcategory: string | null;
  country: string | null;
  language: string | null;
  tvgName: string | null;
  groupTitle: string | null;
  status: string;
  enabled: boolean;
  featured: boolean;
  trending: boolean;
  liveNow: boolean;
  viewCount: number;
  sourceId: string;
  sourceName: string;
  isFavorite: boolean;
  isSubscribed: boolean;
}

export interface PlaylistDTO {
  id: string;
  name: string;
  url: string;
  status: string;
  channelCount: number;
  onlineCount: number;
  offlineCount: number;
  lastRefreshAt: string | null;
  lastRefreshMs: number;
  nextRefreshAt: string | null;
  refreshHours: number;
  errorMessage: string | null;
  enabled: boolean;
}

export interface AnalyticsDTO {
  totalChannels: number;
  onlineChannels: number;
  offlineChannels: number;
  disabledChannels: number;
  totalPlaylists: number;
  activePlaylists: number;
  featuredChannels: number;
  trendingChannels: number;
  liveNowChannels: number;
  totalFavorites: number;
  totalViews: number;
  totalUsers: number;
  activeStreams: number;
  streamErrors: number;
  importRuns: number;
  byCategory: { category: string; count: number }[];
  playlistHealth: {
    id: string;
    name: string;
    channelCount: number;
    onlineCount: number;
    offlineCount: number;
    health: number;
  }[];
  topChannels: { id: string; name: string; viewCount: number; logo: string | null }[];
  /** simulated buffer statistics (avg ms across recent probes) */
  bufferStats: { avgMs: number; p95Ms: number; samples: number };
  recentLogs: { id: string; playlist: string; status: string; imported: number; duplicates: number; errors: number; createdAt: string }[];
}

export interface AdSlotDTO {
  id: string;
  name: string;
  placement: string;
  type: string;
  imageUrl: string | null;
  videoUrl: string | null;
  targetUrl: string;
  headline: string | null;
  description: string | null;
  cta: string;
  cpmCents: number;
  cpcCents: number;
  enabled: boolean;
  impressions: number;
  clicks: number;
  revenueCents: number;
  ctr: number;
}

export interface SubscriptionPlanDTO {
  id: string;
  name: string;
  tier: string;
  priceCents: number;
  currency: string;
  interval: string;
  features: string[];
  popular: boolean;
  enabled: boolean;
  sortOrder: number;
}

export interface RevenueDTO {
  totalRevenueCents: number;
  todayRevenueCents: number;
  monthRevenueCents: number;
  adRevenueCents: number;
  subscriptionRevenueCents: number;
  donationRevenueCents: number;
  totalImpressions: number;
  totalClicks: number;
  overallCtr: number;
  activeSubscribers: number;
  // last 14 days timeseries for charts
  timeseries: { date: string; adRevenue: number; subRevenue: number; total: number }[];
  topAdSlots: AdSlotDTO[];
  revenueBySource: { source: string; amount: number; pct: number }[];
  // estimated RPM (revenue per mille) per 1000 page views
  rpmCents: number;
  pageViews: number;
}
