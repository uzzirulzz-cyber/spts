import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/user';

export const dynamic = 'force-dynamic';

// POST /api/channels/[id]/notify — toggle "notify me when this channel goes live"
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const channel = await db.channel.findUnique({ where: { id } });
  if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 });

  const existing = await db.channelSubscription.findUnique({
    where: { userId_channelId: { userId: user.id, channelId: id } },
  });

  if (existing) {
    await db.channelSubscription.delete({ where: { id: existing.id } });
    return NextResponse.json({ subscribed: false });
  }

  await db.channelSubscription.create({
    data: { userId: user.id, channelId: id },
  });

  // Create a welcome notification confirming the subscription.
  await db.notification.create({
    data: {
      userId: user.id,
      channelId: id,
      title: 'Notifications enabled',
      body: `You'll be notified when ${channel.displayName} goes live.`,
      type: 'system',
    },
  });

  return NextResponse.json({ subscribed: true });
}

// GET /api/channels/[id]/notify — check if user is subscribed
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const sub = await db.channelSubscription.findUnique({
    where: { userId_channelId: { userId: user.id, channelId: id } },
  });
  return NextResponse.json({ subscribed: !!sub });
}
