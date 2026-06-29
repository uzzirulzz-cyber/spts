import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/user';

export const dynamic = 'force-dynamic';

// GET /api/earnings — current user's earnings summary + withdrawal history
export async function GET() {
  const user = await getCurrentUser();

  // Website owner earnings = total platform revenue from traffic
  // (ad impressions, clicks, affiliate, donations, PPV)
  const totalPlatformRevenue = await db.revenueDaily.aggregate({ _sum: { amountCents: true } });
  const totalEarningsCents = totalPlatformRevenue._sum.amountCents ?? 0;

  // Get withdrawal requests
  const withdrawals = await db.withdrawalRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  const withdrawnCents = withdrawals
    .filter((w) => w.status === 'paid')
    .reduce((s, w) => s + w.amountCents, 0);
  const pendingCents = withdrawals
    .filter((w) => w.status === 'pending' || w.status === 'approved')
    .reduce((s, w) => s + w.amountCents, 0);

  const availableCents = totalEarningsCents - withdrawnCents - pendingCents;
  const MIN_WITHDRAWAL = 500; // $5.00 minimum

  // Get revenue breakdown by source
  const adRev = await db.revenueDaily.aggregate({ where: { source: { in: ['ad_impression', 'ad_click'] } }, _sum: { amountCents: true } });
  const affRev = await db.revenueDaily.aggregate({ where: { source: { in: ['affiliate_click', 'affiliate_conversion'] } }, _sum: { amountCents: true } });
  const donRev = await db.revenueDaily.aggregate({ where: { source: 'donation' }, _sum: { amountCents: true } });
  const ppvRev = await db.revenueDaily.aggregate({ where: { source: 'ppv' }, _sum: { amountCents: true } });

  return NextResponse.json({
    totalEarningsCents,
    availableCents: Math.max(0, availableCents),
    withdrawnCents,
    pendingCents,
    canWithdraw: availableCents >= MIN_WITHDRAWAL,
    minWithdrawalCents: MIN_WITHDRAWAL,
    stats: {
      views: 0,
      favorites: 0,
      subscriptions: 0,
    },
    breakdown: {
      signupBonusCents: 0,
      viewsCents: 0,
      favoritesCents: 0,
      subsCents: 0,
      revenueShareCents: 0,
      adRevenueCents: adRev._sum.amountCents ?? 0,
      affiliateRevenueCents: affRev._sum.amountCents ?? 0,
      donationRevenueCents: donRev._sum.amountCents ?? 0,
      ppvRevenueCents: ppvRev._sum.amountCents ?? 0,
    },
    withdrawals: withdrawals.map((w) => ({
      id: w.id,
      amountCents: w.amountCents,
      status: w.status,
      method: w.method,
      createdAt: w.createdAt.toISOString(),
      processedAt: w.processedAt?.toISOString() ?? null,
      note: w.note,
    })),
  });
}
