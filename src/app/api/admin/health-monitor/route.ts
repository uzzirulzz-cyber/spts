import { NextResponse } from 'next/server';
import { runHealthMonitor } from '@/lib/firewall';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// POST /api/admin/health-monitor — run background health check
// Probes offline/unknown channels and auto-recovers ones that come back
export async function POST() {
  const result = await runHealthMonitor(50);
  return NextResponse.json({
    ok: true,
    ...result,
    message: `Tested ${result.tested} channels: ${result.recovered} recovered, ${result.stillBroken} still broken, ${result.newlyBroken} newly broken`,
  });
}
