import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Rotate User-Agents to bypass simple UA-based blocking
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
];

// GET /api/proxy/stream?url=ENCODED_URL — proxy M3U8/TS streams through the
// server with rotating User-Agents + referer spoofing to bypass geo-blocks + CORS.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');
  if (!targetUrl) {
    return NextResponse.json({ error: 'url parameter required' }, { status: 400 });
  }

  // Pick a random User-Agent for each request
  const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  let referer = '';
  try {
    referer = new URL(targetUrl).origin;
  } catch {
    referer = 'https://www.google.com';
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': ua,
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': referer,
        'Origin': referer,
        'Connection': 'keep-alive',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      // If first UA fails, try with a different one
      const ua2 = USER_AGENTS[(USER_AGENTS.indexOf(ua) + 1) % USER_AGENTS.length];
      const retryRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': ua2,
          'Accept': '*/*',
          'Referer': referer,
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!retryRes.ok) {
        return NextResponse.json(
          { error: `Stream returned ${res.status} (geo-blocked)` },
          { status: res.status },
        );
      }

      const contentType2 = retryRes.headers.get('content-type') || 'application/octet-stream';
      const body2 = await retryRes.arrayBuffer();
      return new NextResponse(body2, {
        status: 200,
        headers: {
          'Content-Type': contentType2,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Cache-Control': 'no-cache',
        },
      });
    }

    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    const body = await res.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Cache-Control': 'no-cache',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to proxy stream — may be offline or heavily geo-blocked' },
      { status: 502 },
    );
  }
}
