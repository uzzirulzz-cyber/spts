import { NextResponse } from 'next/server';
import { getFirewallStats } from '@/lib/firewall';

export const dynamic = 'force-dynamic';

// GET /api/admin/firewall — firewall status + stats
export async function GET() {
  const stats = getFirewallStats();
  return NextResponse.json({
    status: 'active',
    ...stats,
    features: [
      'Manifest caching (keeps streams online during brief outages)',
      'User-Agent rotation (6 UAs: Chrome, Firefox, Safari, FFmpeg, VLC)',
      'Referer/Origin spoofing',
      'Stale cache fallback (serves last good manifest if origin fails)',
      'Rate limiting (100 req/min per IP)',
      'Auto-recovery health monitor',
    ],
  });
}
