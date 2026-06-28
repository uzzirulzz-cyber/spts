import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/playlists/[id]/history — import history for a single playlist
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const logs = await db.importLog.findMany({
    where: { playlistId: id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json({
    history: logs.map((l) => ({
      id: l.id,
      status: l.status,
      imported: l.imported,
      duplicates: l.duplicates,
      errors: l.errors,
      message: l.message,
      createdAt: l.createdAt.toISOString(),
    })),
  });
}
