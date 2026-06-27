import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, clearSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST /api/auth/logout — create a fresh anonymous session
export async function POST() {
  const session = await getSessionUser();
  // Create a brand-new anonymous user so the old session is abandoned.
  const newCookie = `anon_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  await db.user.create({ data: { cookie: newCookie, name: 'Guest', role: 'viewer' } });
  // We can't call setSessionCookie here (it's for the current request's cookie),
  // so the client reloads to pick up the new cookie via the session flow.
  await clearSessionCookie().catch(() => {});
  return NextResponse.json({ ok: true });
}
