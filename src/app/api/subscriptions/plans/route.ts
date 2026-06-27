import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { toPlanDTO, seedMonetization } from '@/lib/monetization';

export const dynamic = 'force-dynamic';

// GET /api/subscriptions/plans — list all plans
export async function GET() {
  await seedMonetization();
  const plans = await db.subscriptionPlan.findMany({
    where: { enabled: true },
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json({ plans: plans.map(toPlanDTO) });
}
