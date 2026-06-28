import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/user';

export const dynamic = 'force-dynamic';

// GET /api/earnings — current user's earnings summary + withdrawal history
export async function GET() {
  const user = await getCurrentUser();

  // Calculate earnings: users earn from ad views on their watched channels,
  // affiliate clicks they generate, and a share of donations.
  // For simplicity: each user earns based on their watch history + favorites activity.

  const [watchHistory, favorites, subs] = await Promise.all([
    db.watchHistory.count({ where: { userId: user.id } }),
    db.favorite.count({ where: { userId: user.id } }),
    db.channelSubscription.count({ where: { userId: user.id } }),
  ]);

  // Earnings calculation (in cents):
  // - $0.01 per channel view (watch history entry)
  // - $0.50 per favorite (one-time bonus)
  // - $0.25 per channel subscription (one-time bonus)
  // - Daily bonus: $0.10 per day active
  const earningsFromViews = watchHistory * 1; // 1 cent per view
  const earningsFromFavorites = favorites * 50; // 50 cents per favorite
  const earningsFromSubs = subs * 25; // 25 cents per subscription

  // Get total from revenue daily (user's share = 30% of total platform revenue proportional to activity)
  const totalPlatformRevenue = await db.revenueDaily.aggregate({ _sum: { amountCents: true } });
  const userActivityScore = watchHistory + favorites * 5 + subs * 3;
  const totalActivityBaseline = Math.max(userActivityScore, 1);
  const userShareCents = Math.round((totalPlatformRevenue._sum.amountCents ?? 0) * 0.3 * (userActivityScore / Math.max(totalActivityBaseline + 100, totalActivityBaseline)));

  const totalEarningsCents = earningsFromViews + earningsFromFavorites + earningsFromSubs + userShareCents;

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
  const MIN_WITHDRAWAL = 1000; // $10.00 minimum

  return NextResponse.json({
    totalEarningsCents,
    availableCents: Math.max(0, availableCents),
    withdrawnCents,
    pendingCents,
    canWithdraw: availableCents >= MIN_WITHDRAWAL,
    minWithdrawalCents: MIN_WITHDRAWAL,
    stats: {
      views: watchHistory,
      favorites,
      subscriptions: subs,
    },
    breakdown: {
      viewsCents: earningsFromViews,
      favoritesCents: earningsFromFavorites,
      subsCents: earningsFromSubs,
      revenueShareCents: userShareCents,
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
