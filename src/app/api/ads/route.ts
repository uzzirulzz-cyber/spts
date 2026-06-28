import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { toAdSlotDTO } from '@/lib/monetization';

export const dynamic = 'force-dynamic';

// GET /api/ads — list all ad slots (admin)
export async function GET() {
  const slots = await db.adSlot.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ ads: slots.map(toAdSlotDTO) });
}

// POST /api/ads — create ad slot
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? '').trim();
  const targetUrl = String(body.targetUrl ?? '').trim();
  if (!name || !targetUrl) {
    return NextResponse.json({ error: 'name and targetUrl are required' }, { status: 400 });
  }
  const slot = await db.adSlot.create({
    data: {
      name,
      placement: String(body.placement ?? 'banner-home'),
      type: String(body.type ?? 'image'),
      imageUrl: body.imageUrl || null,
      videoUrl: body.videoUrl || null,
      targetUrl,
      headline: body.headline || null,
      description: body.description || null,
      cta: String(body.cta ?? 'Learn More'),
      cpmCents: Number(body.cpmCents) || 0,
      cpcCents: Number(body.cpcCents) || 0,
      enabled: body.enabled !== false,
    },
  });
  return NextResponse.json({ ad: toAdSlotDTO(slot) }, { status: 201 });
}
