import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { toAdSlotDTO, trackPageView } from '@/lib/monetization';
import type { RevenueDTO } from '@/lib/types';

export const dynamic = 'force-dynamic';

// GET /api/revenue — full revenue dashboard metrics.
// ?track=pageview — record a page view (for RPM calculation) and return 204.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('track') === 'pageview') {
    await trackPageView().catch(() => {});
    return new NextResponse(null, { status: 204 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().slice(0, 10);

  // Last 14 days for timeseries
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  const [allDaily, adSlots, activeSubs, completedPayments] = await Promise.all([
    db.revenueDaily.findMany({ where: { date: { in: days } } }),
    db.adSlot.findMany({ orderBy: { revenueCents: 'desc' }, take: 5 }),
    db.subscription.count({ where: { status: 'active' } }),
    db.payment.findMany({ where: { status: 'completed' } }),
  ]);

  // Aggregate totals
  let adRevenue = 0;
  let subRevenue = 0;
  let donationRevenue = 0;
  let totalImpressions = 0;
  let totalClicks = 0;
  let pageViews = 0;
  let todayRevenue = 0;
  let monthRevenue = 0;

  const timeseries: RevenueDTO['timeseries'] = days.map((date) => {
    const rows = allDaily.filter((d) => d.date === date);
    const ad = rows.filter((r) => r.source === 'ad_impression' || r.source === 'ad_click').reduce((s, r) => s + r.amountCents, 0);
    const sub = rows.filter((r) => r.source === 'subscription').reduce((s, r) => s + r.amountCents, 0);
    const pv = rows.find((r) => r.source === 'page_view')?.count ?? 0;
    adRevenue += ad;
    subRevenue += sub;
    if (date === today) todayRevenue += ad + sub;
    if (date >= monthStartStr) monthRevenue += ad + sub;
    pageViews += pv;
    // per-source counts
    const imp = rows.find((r) => r.source === 'ad_impression')?.count ?? 0;
    const clk = rows.find((r) => r.source === 'ad_click')?.count ?? 0;
    totalImpressions += imp;
    totalClicks += clk;
    return { date, adRevenue: ad, subRevenue: sub, total: ad + sub };
  });

  // donation revenue from payments
  donationRevenue = completedPayments
    .filter((p) => p.type === 'donation')
    .reduce((s, p) => s + p.amountCents, 0);

  const totalRevenue = adRevenue + subRevenue + donationRevenue;
  const overallCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const rpmCents = pageViews > 0 ? Math.round((totalRevenue / pageViews) * 1000) : 0;

  const revenueBySource = [
    { source: 'Ads', amount: adRevenue, pct: totalRevenue > 0 ? Math.round((adRevenue / totalRevenue) * 100) : 0 },
    { source: 'Subscriptions', amount: subRevenue, pct: totalRevenue > 0 ? Math.round((subRevenue / totalRevenue) * 100) : 0 },
    { source: 'Donations', amount: donationRevenue, pct: totalRevenue > 0 ? Math.round((donationRevenue / totalRevenue) * 100) : 0 },
  ];

  const dto: RevenueDTO = {
    totalRevenueCents: totalRevenue,
    todayRevenueCents: todayRevenue,
    monthRevenueCents: monthRevenue,
    adRevenueCents: adRevenue,
    subscriptionRevenueCents: subRevenue,
    donationRevenueCents: donationRevenue,
    totalImpressions,
    totalClicks,
    overallCtr: Math.round(overallCtr * 100) / 100,
    activeSubscribers: activeSubs,
    timeseries,
    topAdSlots: adSlots.map(toAdSlotDTO),
    revenueBySource,
    rpmCents,
    pageViews,
  };

  return NextResponse.json(dto);
}
