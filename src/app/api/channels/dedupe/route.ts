import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// POST /api/channels/dedupe — scan for and remove duplicate channels
// (same signature). Keeps the oldest copy of each signature.
export async function POST() {
  const channels = await db.channel.findMany({
    select: { id: true, signature: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const seen = new Map<string, string>(); // signature -> kept id
  const toDelete: string[] = [];

  for (const ch of channels) {
    if (seen.has(ch.signature)) {
      toDelete.push(ch.id);
    } else {
      seen.set(ch.signature, ch.id);
    }
  }

  if (toDelete.length > 0) {
    await db.channel.deleteMany({ where: { id: { in: toDelete } } });
  }

  // Recompute playlist counts.
  const playlists = await db.playlist.findMany({ select: { id: true } });
  for (const p of playlists) {
    const count = await db.channel.count({ where: { sourceId: p.id } });
    await db.playlist.update({ where: { id: p.id }, data: { channelCount: count } });
  }

  return NextResponse.json({
    ok: true,
    removed: toDelete.length,
    remaining: channels.length - toDelete.length,
  });
}
