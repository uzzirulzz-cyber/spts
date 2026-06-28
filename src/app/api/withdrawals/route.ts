import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/user';

export const dynamic = 'force-dynamic';

// GET /api/withdrawals — list user's withdrawal requests
export async function GET() {
  const user = await getCurrentUser();
  const withdrawals = await db.withdrawalRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({
    withdrawals: withdrawals.map((w) => ({
      id: w.id,
      amountCents: w.amountCents,
      status: w.status,
      method: w.method,
      payoutDetail: w.payoutDetail.replace(/.(?=.{2})/g, '*'), // mask payout detail
      note: w.note,
      createdAt: w.createdAt.toISOString(),
      processedAt: w.processedAt?.toISOString() ?? null,
    })),
  });
}

// POST /api/withdrawals — create a withdrawal request
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const amountCents = Number(body.amountCents);
  const method = String(body.method || 'paypal');
  const payoutDetail = String(body.payoutDetail || '');

  if (!amountCents || amountCents < 1000) {
    return NextResponse.json({ error: 'Minimum withdrawal is $10.00' }, { status: 400 });
  }
  if (!payoutDetail) {
    return NextResponse.json({ error: 'Payout detail is required' }, { status: 400 });
  }

  const user = await getCurrentUser();

  // Check available earnings
  const [watchHistory, favorites, subs] = await Promise.all([
    db.watchHistory.count({ where: { userId: user.id } }),
    db.favorite.count({ where: { userId: user.id } }),
    db.channelSubscription.count({ where: { userId: user.id } }),
  ]);
  const totalEarnings = watchHistory * 1 + favorites * 50 + subs * 25;
  const existingWithdrawals = await db.withdrawalRequest.findMany({ where: { userId: user.id } });
  const alreadyWithdrawn = existingWithdrawals
    .filter((w) => w.status === 'paid' || w.status === 'pending' || w.status === 'approved')
    .reduce((s, w) => s + w.amountCents, 0);
  const available = totalEarnings - alreadyWithdrawn;

  if (amountCents > available) {
    return NextResponse.json({ error: `Insufficient balance. Available: $${(available / 100).toFixed(2)}` }, { status: 400 });
  }

  const withdrawal = await db.withdrawalRequest.create({
    data: {
      userId: user.id,
      amountCents,
      method,
      payoutDetail,
      status: 'pending',
    },
  });

  return NextResponse.json({
    withdrawal: {
      id: withdrawal.id,
      amountCents: withdrawal.amountCents,
      status: withdrawal.status,
      method: withdrawal.method,
      createdAt: withdrawal.createdAt.toISOString(),
    },
  }, { status: 201 });
}
