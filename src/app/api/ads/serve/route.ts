import { NextRequest, NextResponse } from 'next/server';
import { serveAd } from '@/lib/monetization';

export const dynamic = 'force-dynamic';

// GET /api/ads/serve?placement=banner-home
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placement = searchParams.get('placement') || 'banner-home';
  const ad = await serveAd(placement);
  return NextResponse.json({ ad });
}
