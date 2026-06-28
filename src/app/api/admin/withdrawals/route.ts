import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/admin/withdrawals — list all withdrawal requests
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const withdrawals = await db.withdrawalRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  // Get user emails for each withdrawal
  const userIds = [...new Set(withdrawals.map((w) => w.userId))];
  const users = await db.user.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true, name: true } });
  const userMap = new Map(users.map((u) => [u.id, u]));

  return NextResponse.json({
    withdrawals: withdrawals.map((w) => ({
      id: w.id,
      userId: w.userId,
      userName: userMap.get(w.userId)?.name || 'Unknown',
      userEmail: userMap.get(w.userId)?.email || 'N/A',
      amountCents: w.amountCents,
      status: w.status,
      method: w.method,
      payoutDetail: w.payoutDetail,
      note: w.note,
      createdAt: w.createdAt.toISOString(),
      processedAt: w.processedAt?.toISOString() ?? null,
    })),
  });
}

// PATCH /api/admin/withdrawals — approve/reject a withdrawal
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { id, status, note } = body;

  if (!id || !['approved', 'paid', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'id and valid status required' }, { status: 400 });
  }

  const withdrawal = await db.withdrawalRequest.update({
    where: { id },
    data: {
      status,
      note: note || undefined,
      processedAt: new Date(),
    },
  });

  return NextResponse.json({ withdrawal });
}
