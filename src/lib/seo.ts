// SEO + Trending Hashtag engine.
// Generates optimized metadata, Open Graph tags, JSON-LD structured data,
// and trending hashtags for each sport/category to maximize discoverability.

import { CATEGORY_TREE } from './categories';

export interface SeoMeta {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogType: 'website' | 'article' | 'video.other';
  twitterCard: 'summary' | 'summary_large_image' | 'player';
  jsonLd: Record<string, unknown>;
  hashtags: string[];
}

/** Core platform-level keywords (used across all pages). */
export const SITE_KEYWORDS = [
  'IPTV', 'sports streaming', 'live sports', 'football stream', 'cricket live',
  'wrestling stream', 'Premier League', 'La Liga', 'Champions League', 'IPL',
  'PSL', 'WWE', 'UFC', 'NBA', 'F1', 'HLS player', 'M3U8', 'free sports TV',
  'live football HD', 'cricket highlights', 'sports TV online',
];

/** Trending hashtag pools per category — designed for max social reach. */
export const HASHTAG_POOLS: Record<string, string[]> = {
  Football: [
    '#Football', '#Soccer', '#LiveFootball', '#PremierLeague', '#EPL', '#UCL',
    '#ChampionsLeague', '#LaLiga', '#SerieA', '#Bundesliga', '#Ligue1', '#MLS',
    '#SaudiProLeague', '#WorldCup', '#FIFA', '#GoalOfTheDay', '#FootballLive',
    '#SoccerStreams', '#LiveSoccer', '#FootballHD', '#Matchday', '#Footy',
    '#TransferNews', '#UCLnight', '#PL',
  ],
  Cricket: [
    '#Cricket', '#LiveCricket', '#IPL', '#PSL', '#BBL', '#CPL', '#ICC',
    '#T20WorldCup', '#CricketWorldCup', '#AsiaCup', '#TestCricket', '#ODI',
    '#T20', '#CricketHighlights', '#CricketLive', '#CricBuzz', '#CricketTwitter',
    '#PakvsInd', '#IndvsAus', '#ENGvAUS', '#CricketFever', '#CricketLove',
    '#TrendingCricket', '#CricketStream', '#LiveMatch',
  ],
  Wrestling: [
    '#WWE', '#Wrestling', '#WWERAW', '#SmackDown', '#WKENXT', '#AEW',
    '#AEWDynamite', '#UFC', '#MMALive', '#WrestleMania', '#RoyalRumble',
    '#SummerSlam', '#WWENetwork', '#AEWonTNT', '#FightNight', '#UFCFightNight',
    '#PPV', '#ProWrestling', '#WrestlingStream', '#WWEBites', '#WrestlingTwitter',
    '#SuplexCity', '#Finisher', '#LiveWrestling',
  ],
  'Other Sports': [
    '#NBA', '#Basketball', '#Tennis', '#ATP', '#WTA', '#GrandSlam', '#MLB',
    '#Baseball', '#F1', '#Formula1', '#MotoGP', '#Boxing', '#MMA', '#Golf',
    '#PGATour', '#Rugby', '#SixNations', '#NHL', '#IceHockey', '#Olympics',
    '#OlympicGames', '#MultiSports', '#SportsLive', '#SportsStream', '#LiveSports',
  ],
};

/** Per-subcategory extra hashtags (merged on top of category pool). */
export const SUBCATEGORY_HASHTAGS: Record<string, string[]> = {
  'Premier League': ['#MCFC', '#LFC', '#AFC', '#CFC', '#MUFC', '#THFC', '#COYS', '#GTFC'],
  'UEFA Champions League': ['#UCL', '#UCLFinal', '#ChampionsLeagueNight'],
  'La Liga': ['#Barca', '#HalaMadrid', '#RealMadrid', '#Atleti'],
  'Serie A': ['#ForzaInter', '#Milan', '#Juve', '#Roma'],
  'Bundesliga': ['#FCB', '#BVB', '#Bayern', '#Schalke'],
  IPL: ['#IPL2026', '#WhistlePodu', '#PlayBold', '#Yellove', '#MI', '#CSK', '#RCB'],
  PSL: ['#PSL2026', '#PeshawarZalmi', '#KarachiKings', '#LahoreQalandars', '#HBLPSL'],
  'ICC Events': ['#ICCCricketWorldCup', '#T20WorldCup2026'],
  'WWE RAW': ['#WWERAW', '#MondayNightRAW', '#RAWisWAR'],
  SmackDown: ['#SmackDown', '#SmackDownLive', '#BlueBrand'],
  WrestleMania: ['#WrestleMania', '#WrestleMania42', '#GrandestStage'],
  UFC: ['#UFC', '#UFCLive', '#UFCFightNight', '#MMA'],
  Basketball: ['#NBA', '#NBAFinals', '#NBALive', '#BallisLife'],
  'Formula 1': ['#F1', '#Formula1', '#GrandPrix', '#ForzaFerrari', '#LandoNorris'],
};

/** Build a hashtag set for a category + optional subcategory (deduped, capped). */
export function getHashtags(category: string, subcategory?: string | null, limit = 20): string[] {
  const pool = [...(HASHTAG_POOLS[category] ?? HASHTAG_POOLS['Other Sports'])];
  if (subcategory && SUBCATEGORY_HASHTAGS[subcategory]) {
    pool.unshift(...SUBCATEGORY_HASHTAGS[subcategory]);
  }
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of pool) {
    const t = tag.toLowerCase();
    if (!seen.has(t)) {
      seen.add(t);
      out.push(tag);
    }
    if (out.length >= limit) break;
  }
  return out;
}

const SITE_NAME = 'Stream2Arena';
const SITE_URL = 'https://stream2arena.example.com';

/** Build SEO metadata for the home page. */
export function homeSeo(): SeoMeta {
  return {
    title: 'Stream2Arena — Live IPTV Sports Streaming | Football, Cricket, WWE, UFC',
    description:
      'Watch live sports streaming free in HD. Football (Premier League, Champions League, La Liga), Cricket (IPL, PSL, ICC), WWE, UFC, NBA, F1 and more. Multi-M3U IPTV platform with adaptive HLS playback.',
    keywords: SITE_KEYWORDS,
    canonical: SITE_URL,
    ogTitle: 'Stream2Arena — Live Sports Streaming in HD',
    ogDescription:
      'Stream football, cricket, wrestling & more live in HD. Auto-categorized, ad-free premium tier available.',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    hashtags: [
      '#LiveSports', '#IPTV', '#SportsStreaming', '#FreeSportsTV', '#FootballLive',
      '#CricketLive', '#WWE', '#UFC', '#HDStream', '#WatchLive',
    ],
  };
}

/** Build SEO metadata for a category page. */
export function categorySeo(category: string, subcategory?: string | null): SeoMeta {
  const cat = CATEGORY_TREE.find((c) => c.name === category);
  const title = subcategory
    ? `${subcategory} Live Stream — ${category} HD | ${SITE_NAME}`
    : `${category} Live Stream — Watch ${category} Online in HD | ${SITE_NAME}`;
  const desc = subcategory
    ? `Watch ${subcategory} live in HD. ${category} streams, highlights & replays. Free IPTV sports streaming with no signup required.`
    : `Watch ${category} live online. ${cat?.subcategories.map((s) => s.name).slice(0, 6).join(', ')} and more. Free HD sports streaming.`;
  return {
    title,
    description: desc,
    keywords: [...(cat?.fallbackKeywords ?? []), ...SITE_KEYWORDS.slice(0, 10)],
    canonical: `${SITE_URL}/?cat=${encodeURIComponent(category.toLowerCase())}`,
    ogTitle: title,
    ogDescription: desc,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description: desc,
      url: `${SITE_URL}/?cat=${encodeURIComponent(category.toLowerCase())}`,
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    },
    hashtags: getHashtags(category, subcategory),
  };
}

/** Build SEO metadata for a channel page (used by the player overlay). */
export function channelSeo(opts: { name: string; category: string; subcategory?: string | null; country?: string | null }): SeoMeta {
  const { name, category, subcategory, country } = opts;
  const title = `Watch ${name} Live Stream — ${category} HD | ${SITE_NAME}`;
  const desc = `Watch ${name} live in HD${subcategory ? ` (${subcategory})` : ''}${country ? ` from ${country}` : ''}. Free ${category} streaming with adaptive bitrate, fullscreen & picture-in-picture.`;
  return {
    title,
    description: desc,
    keywords: [name, category, ...(subcategory ? [subcategory] : []), 'live stream', 'watch online', 'HD', ...SITE_KEYWORDS.slice(0, 8)],
    canonical: `${SITE_URL}/?ch=${encodeURIComponent(name)}`,
    ogTitle: `Watch ${name} Live`,
    ogDescription: desc,
    ogType: 'video.other',
    twitterCard: 'player',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'TVChannel',
      name,
      broadcastServiceTier: 'free',
      genre: category,
      ...(country ? { areaServed: country } : {}),
    },
    hashtags: getHashtags(category, subcategory),
  };
}

/** Format currency from cents. */
export function formatMoney(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}
