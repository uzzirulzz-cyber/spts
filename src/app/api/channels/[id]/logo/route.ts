import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 20;

// POST /api/channels/[id]/logo — upload a channel logo file.
// Accepts multipart/form-data with a "logo" field.
// Stored in /public/uploads/ (Cloudinary replacement in the sandbox).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const channel = await db.channel.findUnique({ where: { id } });
  if (!channel) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get('logo');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'logo file is required' }, { status: 400 });
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'Logo must be under 2MB' }, { status: 400 });
  }
  const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif'];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'Only PNG/JPEG/WebP/SVG/GIF allowed' }, { status: 400 });
  }

  const ext = file.type.split('/')[1] === 'svg+xml' ? 'svg' : file.type.split('/')[1];
  const filename = `ch-${id}.${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  const logoUrl = `/uploads/${filename}`;
  await db.channel.update({ where: { id }, data: { logo: logoUrl } });

  return NextResponse.json({ ok: true, logo: logoUrl });
}
