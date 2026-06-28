import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { toAdSlotDTO } from '@/lib/monetization';

export const dynamic = 'force-dynamic';

// PATCH /api/ads/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  for (const k of ['name', 'placement', 'type', 'imageUrl', 'videoUrl', 'targetUrl', 'headline', 'description', 'cta']) {
    if (k in body) data[k] = body[k] === null ? null : body[k];
  }
  for (const k of ['cpmCents', 'cpcCents']) {
    if (k in body) data[k] = Number(body[k]) || 0;
  }
  if (typeof body.enabled === 'boolean') data.enabled = body.enabled;
  const slot = await db.adSlot.update({ where: { id }, data });
  return NextResponse.json({ ad: toAdSlotDTO(slot) });
}

// DELETE /api/ads/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.adSlot.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
