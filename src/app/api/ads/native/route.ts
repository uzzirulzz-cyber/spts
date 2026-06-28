import { NextRequest, NextResponse } from 'next/server';
import { getNativeAds } from '@/lib/traffic-monetization';

export const dynamic = 'force-dynamic';

// GET /api/ads/native?limit=3 — native ads for in-feed placement
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get('limit')) || 3, 10);
  const ads = await getNativeAds(limit);
  return NextResponse.json({ ads });
}
