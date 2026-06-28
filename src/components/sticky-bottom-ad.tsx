'use client';

import { useEffect, useState, useRef } from 'react';
import { X, Megaphone, ExternalLink } from 'lucide-react';
import { useFetch, apiAction } from '@/hooks/use-fetch';
import type { AdSlotDTO } from '@/lib/types';
import { cn } from '@/lib/utils';

/**
 * Sticky bottom ad bar — stays fixed at the bottom of the viewport.
 * Generates high-visibility impressions on every page view.
 * Dismissible (hides for the session via sessionStorage).
 */
export function StickyBottomAd() {
  const [dismissed, setDismissed] = useState(false);
  const [show, setShow] = useState(false);
  const trackedRef = useRef<string | null>(null);
  const { data, refetch } = useFetch<{ ad: AdSlotDTO | null }>('/api/ads/serve?placement=sidebar');

  useEffect(() => {
    // Only show after 3 seconds (don't interrupt initial page load).
    const t = setTimeout(() => {
      const sessionDismissed = sessionStorage.getItem('pb_sticky_ad_dismissed');
      if (!sessionDismissed) setShow(true);
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  // Track impression once.
  useEffect(() => {
    if (show && data?.ad && trackedRef.current !== data.ad.id) {
      trackedRef.current = data.ad.id;
      apiAction('POST', `/api/ads/${data.ad.id}/track`, { kind: 'impression' });
    }
  }, [show, data]);

  if (dismissed || !show || !data?.ad) return null;
  const ad = data.ad;

  function dismiss() {
    setDismissed(true);
    sessionStorage.setItem('pb_sticky_ad_dismissed', '1');
  }

  async function handleClick() {
    await apiAction('POST', `/api/ads/${ad.id}/track`, { kind: 'click' });
    window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
    dismiss();
    refetch();
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 shadow-lg backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
        {/* Sponsor label */}
        <div className="hidden shrink-0 items-center gap-1.5 rounded bg-muted px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-muted-foreground sm:flex">
          <Megaphone className="h-3 w-3" /> Ad
        </div>

        {/* Ad content */}
        <button onClick={handleClick} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          {ad.imageUrl ? (
            <img src={ad.imageUrl} alt="" className="hidden h-8 w-8 shrink-0 rounded object-cover sm:block" />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded brand-bg">
              <Megaphone className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{ad.headline || ad.name}</p>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">{ad.description}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-lg brand-bg px-3 py-1.5 text-xs font-semibold">
            {ad.cta} <ExternalLink className="h-3 w-3" />
          </span>
        </button>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          aria-label="Close ad"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
