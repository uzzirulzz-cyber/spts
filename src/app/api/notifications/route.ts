import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/user';

export const dynamic = 'force-dynamic';

// GET /api/notifications — list current user's notifications
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get('unread') === 'true';
  const user = await getCurrentUser();

  const where: Record<string, unknown> = { userId: user.id };
  if (unreadOnly) where.read = false;

  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({
      where,
      include: { channel: { select: { id: true, name: true, logo: true, liveNow: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    db.notification.count({ where: { userId: user.id, read: false } }),
  ]);

  return NextResponse.json({
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
      channel: n.channel ? { id: n.channel.id, name: n.channel.name, logo: n.channel.logo, liveNow: n.channel.liveNow } : null,
    })),
    unreadCount,
  });
}

// PATCH /api/notifications — mark all (or specific) as read
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const user = await getCurrentUser();

  if (body.markAllRead) {
    await db.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.id) {
    await db.notification.update({
      where: { id: body.id },
      data: { read: true },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Provide markAllRead or id' }, { status: 400 });
}
