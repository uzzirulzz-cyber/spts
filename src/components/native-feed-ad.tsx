'use client';

import { useEffect, useRef } from 'react';
import { ExternalLink, Megaphone } from 'lucide-react';
import { useFetch, apiAction } from '@/hooks/use-fetch';
import { cn } from '@/lib/utils';

interface NativeAd {
  id: string;
  headline: string;
  description: string;
  cta: string;
  targetUrl: string;
  imageUrl?: string;
  sponsor: string;
  cpcCents: number;
}

/**
 * Native ad card — blends into channel grids as a sponsored card.
 * Appears between real channel cards to maximize click-through.
 */
export function NativeFeedAd() {
  const { data, refetch } = useFetch<{ ads: NativeAd[] }>('/api/ads/native?limit=1');
  const trackedRef = useRef<string | null>(null);

  const ad = data?.ads?.[0];

  useEffect(() => {
    if (ad && trackedRef.current !== ad.id) {
      trackedRef.current = ad.id;
      apiAction('POST', `/api/ads/${ad.id}/track`, { kind: 'impression' });
    }
  }, [ad]);

  if (!ad) return null;

  async function handleClick() {
    await apiAction('POST', `/api/ads/${ad!.id}/track`, { kind: 'click' });
    window.open(ad!.targetUrl, '_blank', 'noopener,noreferrer');
    refetch();
  }

  return (
    <div
      onClick={handleClick}
      className="group relative w-44 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 border-brand/40 bg-card transition-all hover:border-brand hover:ring-2 hover:ring-brand/30 hover:-translate-y-0.5"
    >
      {/* thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {ad.imageUrl ? (
          <img src={ad.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center brand-bg">
            <Megaphone className="h-8 w-8" />
          </div>
        )}
        {/* Sponsored label */}
        <div className="absolute left-2 top-2 rounded bg-brand px-1.5 py-0.5 text-[9px] font-bold text-brand-foreground">
          SPONSORED
        </div>
      </div>

      {/* info */}
      <div className="p-2.5">
        <h3 className="line-clamp-1 text-sm font-semibold leading-tight">{ad.headline}</h3>
        <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{ad.description}</p>
        <span className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-brand">
          {ad.cta} <ExternalLink className="h-2.5 w-2.5" />
        </span>
      </div>
    </div>
  );
}
