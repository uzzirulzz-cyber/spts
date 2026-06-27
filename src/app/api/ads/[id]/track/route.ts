import { NextRequest, NextResponse } from 'next/server';
import { trackAdEvent } from '@/lib/monetization';

export const dynamic = 'force-dynamic';

// POST /api/ads/[id]/track — record impression or click
// Body: { kind: 'impression' | 'click' }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const kind = body.kind === 'click' ? 'click' : 'impression';
  const { revenueCents } = await trackAdEvent(id, kind);
  return NextResponse.json({ ok: true, kind, revenueCents });
}
