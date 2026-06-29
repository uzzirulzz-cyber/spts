'use client';

import { useState } from 'react';
import { Hash, Copy, Check, TrendingUp, Sparkles } from 'lucide-react';
import { useFetch } from '@/hooks/use-fetch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  category?: string;
  subcategory?: string | null;
}

interface HashtagData {
  category: string;
  subcategory?: string;
  hashtags: string[];
  caption: string;
}

/**
 * Trending hashtags widget — shows the best hashtags for the current category
 * to help content rank on social media. Copy-to-clipboard for the full set.
 */
export function HashtagsWidget({ category, subcategory }: Props) {
  const params = new URLSearchParams({ limit: '15' });
  if (category) params.set('category', category);
  if (subcategory) params.set('subcategory', subcategory);
  const { data, loading } = useFetch<HashtagData | { pools: unknown; trending: string[] }>(`/api/hashtags?${params.toString()}`);

  const hashtags = data && 'hashtags' in data ? data.hashtags : (data as { trending?: string[] })?.trending ?? [];
  const caption = data && 'caption' in data ? data.caption : `Watch live sports on Stream2Arena! ${hashtags.slice(0, 6).join(' ')}`;
  const [copied, setCopied] = useState(false);

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      toast.success('Hashtags copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Clipboard not available');
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-6 w-20 animate-pulse rounded bg-muted" />)}
        </div>
      </div>
    );
  }

  if (hashtags.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand" />
          <h3 className="text-sm font-bold">Trending Hashtags</h3>
          {category && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{category}</span>}
        </div>
        <Button size="sm" variant="ghost" onClick={copyAll} className="gap-1 text-xs">
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          Copy
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {hashtags.map((tag) => (
          <span
            key={tag}
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium transition-colors hover:border-brand hover:bg-brand/10',
            )}
          >
            <Hash className="h-2.5 w-2.5 text-muted-foreground" />
            {tag.replace('#', '')}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted/40 p-2.5">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
        <p className="text-xs text-muted-foreground">
          Use these hashtags in your social posts to rank on top trending and boost discoverability.
        </p>
      </div>
    </div>
  );
}
