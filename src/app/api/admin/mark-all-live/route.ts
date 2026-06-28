import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// POST /api/admin/mark-all-live — mark every enabled channel as live now + online.
// This makes the /live page show all channels as streaming.
export async function POST() {
  const result = await db.channel.updateMany({
    where: { enabled: true },
    data: { liveNow: true, status: 'online' },
  });
  // Update playlist counts.
  const playlists = await db.playlist.findMany({ select: { id: true } });
  for (const p of playlists) {
    const count = await db.channel.count({ where: { sourceId: p.id, enabled: true } });
    await db.playlist.update({
      where: { id: p.id },
      data: { onlineCount: count, offlineCount: 0 },
    });
  }
  return NextResponse.json({ ok: true, updated: result.count });
}
