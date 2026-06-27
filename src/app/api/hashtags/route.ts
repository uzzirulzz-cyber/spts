import { NextRequest, NextResponse } from 'next/server';
import { getHashtags, HASHTAG_POOLS } from '@/lib/seo';

export const dynamic = 'force-dynamic';

// GET /api/hashtags?category=Football&subcategory=Premier League
// Returns trending hashtags for SEO/social sharing.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const subcategory = searchParams.get('subcategory') || undefined;
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);

  if (!category) {
    // Return the full pool map when no category is specified.
    return NextResponse.json({
      pools: HASHTAG_POOLS,
      trending: ['#LiveSports', '#IPTV', '#SportsStreaming', '#FootballLive', '#CricketLive', '#WWE', '#UFC', '#HDStream'],
    });
  }

  const hashtags = getHashtags(category, subcategory, limit);
  // Also return a ready-to-paste social caption.
  const caption = `Watch ${subcategory ? `${subcategory} — ` : ''}${category} live in HD on SportStream! ${hashtags.slice(0, 8).join(' ')}`;
  return NextResponse.json({ category, subcategory, hashtags, caption });
}
