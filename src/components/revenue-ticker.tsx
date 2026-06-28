'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Eye, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TickerData {
  todayCents: number;
  totalCents: number;
  pageViewsToday: number;
  rpmCents: number;
}

function formatMoney(cents: number): string {
  if (cents === 0) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

/**
 * Live revenue ticker — shows today's earnings in the topbar.
 * Updates every 30 seconds. Only visible to admin users.
 */
export function RevenueTicker({ isAdmin }: { isAdmin: boolean }) {
  const [data, setData] = useState<TickerData | null>(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    function load() {
      fetch('/api/revenue/ticker')
        .then((r) => r.json())
        .then((d: TickerData) => {
          setData(d);
          setPulse(true);
          setTimeout(() => setPulse(false), 1000);
        })
        .catch(() => {});
    }
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [isAdmin]);

  if (!isAdmin || !data) return null;

  return (
    <div className="hidden items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 lg:flex">
      <div className={cn('flex items-center gap-1.5 transition-transform', pulse && 'scale-110')}>
        <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
        <div>
          <p className="text-xs font-bold leading-none text-emerald-600 dark:text-emerald-400">
            {formatMoney(data.todayCents)}
          </p>
          <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Today</p>
        </div>
      </div>
      <div className="h-6 w-px bg-border" />
      <div className="flex items-center gap-1.5">
        <Eye className="h-3.5 w-3.5 text-brand" />
        <div>
          <p className="text-xs font-bold leading-none">{data.pageViewsToday.toLocaleString()}</p>
          <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Views</p>
        </div>
      </div>
      <div className="h-6 w-px bg-border" />
      <div className="flex items-center gap-1.5">
        <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
        <div>
          <p className="text-xs font-bold leading-none text-amber-600 dark:text-amber-400">
            {formatMoney(data.rpmCents)}
          </p>
          <p className="text-[9px] uppercase tracking-wide text-muted-foreground">RPM</p>
        </div>
      </div>
    </div>
  );
}
