import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/user';
import { recordSubscriptionPayment } from '@/lib/monetization';

export const dynamic = 'force-dynamic';

// POST /api/subscriptions/subscribe
// Body: { planId: string }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const planId = String(body.planId ?? '');
  if (!planId) return NextResponse.json({ error: 'planId required' }, { status: 400 });

  const plan = await db.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

  const user = await getCurrentUser();

  // For free plan, just create an active subscription with no payment.
  if (plan.priceCents === 0) {
    await db.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: 'active',
        endsAt: null,
      },
    });
    return NextResponse.json({ ok: true, tier: plan.tier, paid: false });
  }

  // For paid plans, simulate a successful payment (no real gateway in sandbox).
  await recordSubscriptionPayment(user.id, plan.id, plan.priceCents);
  return NextResponse.json({ ok: true, tier: plan.tier, paid: true, amountCents: plan.priceCents });
}
