import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdNetworkSettings, AD_NETWORKS } from '@/lib/traffic-monetization';

export const dynamic = 'force-dynamic';

// GET /api/admin/ad-network — current ad network config
export async function GET() {
  const settings = await getAdNetworkSettings();
  return NextResponse.json({
    settings,
    networks: Object.entries(AD_NETWORKS).map(([key, val]) => ({
      key,
      name: val.name,
      note: val.note,
    })),
  });
}

// POST /api/admin/ad-network — update ad network settings
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const updates: { key: string; value: string }[] = [];

  if (typeof body.network === 'string') updates.push({ key: 'ad_network', value: body.network });
  if (typeof body.publisherId === 'string') updates.push({ key: 'ad_publisher_id', value: body.publisherId });
  if (typeof body.autoAds === 'boolean') updates.push({ key: 'ad_auto', value: String(body.autoAds) });
  if (typeof body.stickyBottom === 'boolean') updates.push({ key: 'ad_sticky', value: String(body.stickyBottom) });
  if (typeof body.inFeed === 'boolean') updates.push({ key: 'ad_infeed', value: String(body.inFeed) });
  if (typeof body.preRoll === 'boolean') updates.push({ key: 'ad_preroll', value: String(body.preRoll) });

  for (const u of updates) {
    await db.setting.upsert({
      where: { key: u.key },
      create: { key: u.key, value: u.value },
      update: { value: u.value },
    });
  }

  return NextResponse.json({ ok: true });
}
