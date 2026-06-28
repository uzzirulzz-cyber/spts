import { NextRequest, NextResponse } from 'next/server';
import { firewallFetch, checkRateLimit } from '@/lib/firewall';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// GET /api/proxy/stream?url=ENCODED_URL — firewall-protected stream proxy
// Uses manifest caching + UA rotation + stale cache fallback to keep
// streams online even when the origin server is slow or briefly down.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');
  if (!targetUrl) {
    return NextResponse.json({ error: 'url parameter required' }, { status: 400 });
  }

  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const result = await firewallFetch(targetUrl);

    return new NextResponse(result.body, {
      status: 200,
      headers: {
        'Content-Type': result.contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Cache-Control': 'no-cache',
        'X-Firewall': 'active',
        'X-Firewall-Source': result.source,
        'X-Firewall-Cached': result.cached ? 'true' : 'false',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Firewall could not reach stream — origin is offline or heavily blocked' },
      { status: 502 },
    );
  }
}
