import { NextRequest, NextResponse } from 'next/server';
import { trackConversion } from '@/lib/traffic-monetization';

export const dynamic = 'force-dynamic';

// POST /api/affiliates/[id]/convert — record a conversion (signup/purchase)
// Body: { valueCents?: number }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const valueCents = Number(body.valueCents) || 0;
  await trackConversion(id, valueCents);
  return NextResponse.json({ ok: true });
}
