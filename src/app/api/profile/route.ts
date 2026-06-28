import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, hashPassword, verifyPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/profile — current user's profile + stats
export async function GET() {
  const session = await getSessionUser();
  const user = await db.user.findUnique({
    where: { id: session.id },
    select: {
      id: true, email: true, name: true, role: true, avatar: true,
      createdAt: true,
      _count: { select: { favorites: true, watchHistory: true, channelSubs: true, notifications: true } },
    },
  });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ user });
}

// PATCH /api/profile — update name, avatar, or password
export async function PATCH(req: NextRequest) {
  const session = await getSessionUser();
  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};

  if (typeof body.name === 'string') data.name = body.name.trim();
  if (typeof body.avatar === 'string') data.avatar = body.avatar || null;

  // Change password
  if (body.newPassword) {
    const user = await db.user.findUnique({ where: { id: session.id } });
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    // If user already has a password, verify the old one.
    if (user.password && body.oldPassword) {
      if (!verifyPassword(body.oldPassword, user.password)) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
    }
    if (String(body.newPassword).length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    data.password = hashPassword(body.newPassword);
  }

  const updated = await db.user.update({
    where: { id: session.id },
    data,
    select: { id: true, email: true, name: true, role: true, avatar: true },
  });
  return NextResponse.json({ user: updated });
}
