import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// POST /api/channels/bulk — bulk update channels
// Body: { ids: string[], action: 'enable' | 'disable' | 'feature' | 'unfeature' |
//         'trend' | 'untrend' | 'live' | 'unlive' | 'delete' | 'recategory',
//         category?: string, subcategory?: string }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body.ids) ? body.ids : [];
  const action = String(body.action ?? '');

  if (ids.length === 0) {
    return NextResponse.json({ error: 'ids is required' }, { status: 400 });
  }
  if (ids.length > 500) {
    return NextResponse.json({ error: 'Max 500 channels per bulk operation' }, { status: 400 });
  }

  let updated = 0;

  switch (action) {
    case 'enable':
      updated = (await db.channel.updateMany({ where: { id: { in: ids } }, data: { enabled: true } })).count;
      break;
    case 'disable':
      updated = (await db.channel.updateMany({ where: { id: { in: ids } }, data: { enabled: false } })).count;
      break;
    case 'feature':
      updated = (await db.channel.updateMany({ where: { id: { in: ids } }, data: { featured: true } })).count;
      break;
    case 'unfeature':
      updated = (await db.channel.updateMany({ where: { id: { in: ids } }, data: { featured: false } })).count;
      break;
    case 'trend':
      updated = (await db.channel.updateMany({ where: { id: { in: ids } }, data: { trending: true } })).count;
      break;
    case 'untrend':
      updated = (await db.channel.updateMany({ where: { id: { in: ids } }, data: { trending: false } })).count;
      break;
    case 'live':
      updated = (await db.channel.updateMany({ where: { id: { in: ids } }, data: { liveNow: true } })).count;
      break;
    case 'unlive':
      updated = (await db.channel.updateMany({ where: { id: { in: ids } }, data: { liveNow: false } })).count;
      break;
    case 'recategory':
      if (!body.category) return NextResponse.json({ error: 'category required for recategory' }, { status: 400 });
      updated = (await db.channel.updateMany({
        where: { id: { in: ids } },
        data: { category: String(body.category), subcategory: body.subcategory ?? null, categoryMode: 'manual' },
      })).count;
      break;
    case 'delete':
      updated = (await db.channel.deleteMany({ where: { id: { in: ids } } })).count;
      break;
    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }

  return NextResponse.json({ ok: true, action, updated });
}
