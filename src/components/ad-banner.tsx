'use client';

import { useEffect, useState, useRef } from 'react';
import { ExternalLink, X, Megaphone } from 'lucide-react';
import { useFetch, apiAction } from '@/hooks/use-fetch';
import type { AdSlotDTO } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Props {
  placement: string;
  className?: string;
  /** compact = sidebar sized; full = leaderboard */
  variant?: 'compact' | 'full';
}

/**
 * Ad banner that serves an ad from /api/ads/serve, records an impression on
 * view, and a click on click. Falls back gracefully when no ad is available.
 */
export function AdBanner({ placement, className, variant = 'full' }: Props) {
  const { data, refetch } = useFetch<{ ad: AdSlotDTO | null }>(`/api/ads/serve?placement=${placement}`);
  const trackedRef = useRef<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const ad = data?.ad ?? null;

  // Record an impression once when the ad becomes visible.
  useEffect(() => {
    if (ad && trackedRef.current !== ad.id) {
      trackedRef.current = ad.id;
      apiAction('POST', `/api/ads/${ad.id}/track`, { kind: 'impression' }).then(() => refetch());
    }
  }, [ad, refetch]);

  if (dismissed || !ad) return null;

  async function handleClick() {
    if (!ad) return;
    await apiAction('POST', `/api/ads/${ad.id}/track`, { kind: 'click' });
    window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
    refetch();
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-gradient-to-r from-muted/80 to-muted/40',
        variant === 'full' ? 'px-4 py-3' : 'p-3',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {ad.imageUrl ? (
           
          <img src={ad.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg brand-bg">
            <Megaphone className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-bold">{ad.headline || ad.name}</p>
            <span className="hidden shrink-0 rounded bg-muted px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-muted-foreground sm:inline">
              Sponsored
            </span>
          </div>
          {ad.description && (
            <p className="line-clamp-1 text-xs text-muted-foreground">{ad.description}</p>
          )}
        </div>
        <button
          onClick={handleClick}
          className="shrink-0 rounded-lg brand-bg px-3 py-1.5 text-xs font-semibold transition-transform hover:scale-105"
        >
          {ad.cta} <ExternalLink className="ml-1 inline h-3 w-3" />
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
          aria-label="Dismiss ad"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
