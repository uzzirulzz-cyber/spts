import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// GET /api/proxy/stream?url=ENCODED_URL — proxy an M3U8/TS stream through the
// server to bypass CORS restrictions and some geo-blocks. The browser can't
// fetch cross-origin streams directly, so we forward them server-side.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');
  if (!targetUrl) {
    return NextResponse.json({ error: 'url parameter required' }, { status: 400 });
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Referer': new URL(targetUrl).origin,
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Stream returned ${res.status}` },
        { status: res.status },
      );
    }

    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    const body = await res.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to proxy stream — may be offline or geo-blocked' },
      { status: 502 },
    );
  }
}
