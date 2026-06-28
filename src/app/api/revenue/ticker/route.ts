import { NextResponse } from 'next/server';
import { getLiveRevenueTicker } from '@/lib/traffic-monetization';

export const dynamic = 'force-dynamic';

// GET /api/revenue/ticker — live revenue for navbar display
export async function GET() {
  const ticker = await getLiveRevenueTicker();
  return NextResponse.json(ticker);
}
