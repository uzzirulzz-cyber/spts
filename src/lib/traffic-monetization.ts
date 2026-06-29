// Traffic monetization engine: ad networks, native ads, sticky ads,
// conversion tracking, and RPM optimization.

import { db } from './db';
import { getCurrentUser } from './user';

/** Supported ad network types for integration. */
export const AD_NETWORKS = {
  adsense: {
    name: 'Google AdSense',
    scriptUrl: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
    note: 'Add your publisher ID (ca-pub-XXXX) in settings to activate',
  },
  admgr: {
    name: 'Ad Manager',
    scriptUrl: 'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
    note: 'Google Ad Manager / DFP — needs network code',
  },
  mediavine: {
    name: 'Mediavine',
    scriptUrl: 'https://scripts.mediavine.com/tags/stream2arena.js',
    note: 'Requires Mediavine approval (50K sessions/mo)',
  },
  ezoic: {
    name: 'Ezoic',
    scriptUrl: 'https://www.ezoic.com/',
    note: 'AI-optimized ad placements',
  },
  custom: {
    name: 'Custom / Direct',
    scriptUrl: '',
    note: 'Direct ad sales or custom ad code',
  },
} as const;

export type AdNetworkKey = keyof typeof AD_NETWORKS;

/** Native ad placement — appears between channel cards in grids/rails. */
export interface NativeAd {
  id: string;
  headline: string;
  description: string;
  cta: string;
  targetUrl: string;
  imageUrl?: string;
  sponsor: string;
  cpcCents: number;
}

/** Get native ads for in-feed placement. */
export async function getNativeAds(limit = 3): Promise<NativeAd[]> {
  const slots = await db.adSlot.findMany({
    where: { enabled: true, placement: { in: ['native-feed', 'banner-home', 'sponsored-rail'] } },
    take: limit * 2,
  });
  const now = Date.now();
  const valid = slots.filter(
    (s) => (!s.startAt || s.startAt.getTime() <= now) && (!s.endAt || s.endAt.getTime() >= now),
  );
  return valid.slice(0, limit).map((s) => ({
    id: s.id,
    headline: s.headline || s.name,
    description: s.description || '',
    cta: s.cta,
    targetUrl: s.targetUrl,
    imageUrl: s.imageUrl || undefined,
    sponsor: s.name,
    cpcCents: s.cpcCents,
  }));
}

/** Record a conversion (affiliate signup/purchase) — higher revenue than clicks. */
export async function trackConversion(linkId: string, conversionValueCents: number): Promise<void> {
  const link = await db.affiliateLink.findUnique({ where: { id: linkId } });
  if (!link || !link.enabled) return;

  const today = new Date().toISOString().slice(0, 10);
  const revenueCents = link.cpaCents || conversionValueCents;

  await db.$transaction([
    db.affiliateLink.update({
      where: { id: linkId },
      data: { conversions: { increment: 1 }, revenueCents: { increment: revenueCents } },
    }),
    db.revenueDaily.upsert({
      where: { date_source: { date: today, source: 'affiliate_conversion' } },
      create: { id: `${today}_affiliate_conversion`, date: today, source: 'affiliate_conversion', amountCents: revenueCents, count: 1 },
      update: { amountCents: { increment: revenueCents }, count: { increment: 1 } },
    }),
  ]);
}

/** Get live revenue ticker — real-time earnings for the navbar. */
export async function getLiveRevenueTicker(): Promise<{
  todayCents: number;
  totalCents: number;
  pageViewsToday: number;
  rpmCents: number;
}> {
  const today = new Date().toISOString().slice(0, 10);
  const daily = await db.revenueDaily.findMany({ where: { date: today } });
  const todayCents = daily.reduce((s, d) => s + d.amountCents, 0);

  const allDaily = await db.revenueDaily.findMany();
  const totalCents = allDaily.reduce((s, d) => s + d.amountCents, 0);

  const todayViews = await db.trafficEvent.count({
    where: { kind: 'page_view', createdAt: { gte: new Date(today) } },
  });

  const rpmCents = todayViews > 0 ? Math.round((todayCents / todayViews) * 1000) : 0;

  return { todayCents, totalCents, pageViewsToday: todayViews, rpmCents };
}

/** Get ad network settings. */
export async function getAdNetworkSettings(): Promise<{
  network: string;
  publisherId: string;
  autoAds: boolean;
  stickyBottom: boolean;
  inFeed: boolean;
  preRoll: boolean;
}> {
  const settings = await db.setting.findMany({
    where: { key: { in: ['ad_network', 'ad_publisher_id', 'ad_auto', 'ad_sticky', 'ad_infeed', 'ad_preroll'] } },
  });
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  return {
    network: map['ad_network'] || 'custom',
    publisherId: map['ad_publisher_id'] || '',
    autoAds: map['ad_auto'] !== 'false',
    stickyBottom: map['ad_sticky'] !== 'false',
    inFeed: map['ad_infeed'] !== 'false',
    preRoll: map['ad_preroll'] === 'true',
  };
}

/** RPM optimization tips based on current performance. */
export function getRpmOptimizationTips(rpmCents: number, pageViews: number): { tip: string; impact: string }[] {
  const tips: { tip: string; impact: string }[] = [];

  if (rpmCents < 200) {
    tips.push({ tip: 'Add Google AdSense auto ads for broader coverage', impact: '+$0.50-$2.00 RPM' });
  }
  if (pageViews < 1000) {
    tips.push({ tip: 'Share on social media with trending hashtags to boost traffic', impact: '+10x page views' });
  }
  tips.push({ tip: 'Enable video pre-roll ads (8x higher RPM than display)', impact: '+$4-8 RPM' });
  tips.push({ tip: 'Add affiliate links to high-traffic category pages', impact: '+$1.20 RPM' });
  tips.push({ tip: 'Increase interstitial ad frequency (every 3 navigations)', impact: '+$0.80 RPM' });
  tips.push({ tip: 'Add sponsored channel placements for direct revenue', impact: '+$2.00 RPM' });

  return tips.slice(0, 4);
}
