'use client';

import { useState } from 'react';
import { Check, Crown, Loader2, Zap, Users, Sparkles } from 'lucide-react';
import { useFetch, apiAction } from '@/hooks/use-fetch';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { SubscriptionPlanDTO } from '@/lib/types';

const TIER_ICON: Record<string, React.ReactNode> = {
  free: <Sparkles className="h-5 w-5" />,
  premium: <Zap className="h-5 w-5" />,
  premium_plus: <Crown className="h-5 w-5" />,
  family: <Users className="h-5 w-5" />,
};

const TIER_COLOR: Record<string, string> = {
  free: 'text-muted-foreground',
  premium: 'text-brand',
  premium_plus: 'text-amber-500',
  family: 'text-violet-500',
};

function formatPrice(cents: number, currency: string, interval: string): string {
  if (cents === 0) return 'Free';
  return `$${(cents / 100).toFixed(2)} / ${interval}`;
}

export function PricingCards() {
  const { data, loading } = useFetch<{ plans: SubscriptionPlanDTO[] }>('/api/subscriptions/plans');
  const [subscribing, setSubscribing] = useState<string | null>(null);

  async function subscribe(planId: string, tier: string, priceCents: number) {
    setSubscribing(planId);
    const res = await apiAction('POST', '/api/subscriptions/subscribe', { planId });
    setSubscribing(null);
    if (res.ok) {
      if (priceCents === 0) toast.success('You are now on the Free plan');
      else toast.success(`Subscribed to ${tier}! Payment processed.`);
    } else {
      toast.error(res.error || 'Subscription failed');
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-72 animate-pulse rounded-xl bg-muted" />)}
      </div>
    );
  }

  const plans = data?.plans ?? [];
  if (plans.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={cn(
            'relative flex flex-col transition-all',
            plan.popular ? 'border-brand ring-2 ring-brand/30 shadow-lg' : 'hover:border-brand/50',
          )}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="brand-bg">Most Popular</Badge>
            </div>
          )}
          <CardContent className="flex flex-1 flex-col p-5">
            <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted', TIER_COLOR[plan.tier])}>
              {TIER_ICON[plan.tier] ?? <Crown className="h-5 w-5" />}
            </div>
            <h3 className="text-lg font-extrabold">{plan.name}</h3>
            <p className={cn('mt-1 text-2xl font-extrabold', plan.popular ? 'text-brand' : '')}>
              {formatPrice(plan.priceCents, plan.currency, plan.interval)}
            </p>
            <ul className="mt-4 flex-1 space-y-2">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className={cn('mt-0.5 h-4 w-4 shrink-0', TIER_COLOR[plan.tier])} />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Button
              className="mt-5 w-full"
              variant={plan.popular ? 'default' : 'outline'}
              onClick={() => subscribe(plan.id, plan.name, plan.priceCents)}
              disabled={subscribing === plan.id}
            >
              {subscribing === plan.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : plan.priceCents === 0 ? (
                'Get Started'
              ) : (
                `Subscribe $${(plan.priceCents / 100).toFixed(0)}`
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
