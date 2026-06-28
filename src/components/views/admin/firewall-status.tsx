'use client';

import { Shield, ShieldCheck, Activity, RefreshCw, Loader2, Zap, Database, Globe } from 'lucide-react';
import { useFetch, apiAction } from '@/hooks/use-fetch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useState } from 'react';

interface FirewallStats {
  status: string;
  cacheSize: number;
  maxCacheSize: number;
  cacheTtlSeconds: number;
  userAgents: number;
  rateLimit: number;
  rateWindowSeconds: number;
  activeConnections: number;
  features: string[];
}

export function FirewallStatus() {
  const { data, refetch } = useFetch<FirewallStats>('/api/admin/firewall');
  const [monitoring, setMonitoring] = useState(false);

  async function runHealthMonitor() {
    setMonitoring(true);
    toast.info('Running health monitor (probing 50 channels)…');
    const res = await apiAction('POST', '/api/admin/health-monitor');
    setMonitoring(false);
    if (res.ok) {
      const r = res.data as { tested: number; recovered: number; stillBroken: number; newlyBroken: number };
      toast.success(`Health monitor: ${r.recovered} recovered, ${r.stillBroken} still broken`);
      refetch();
    } else {
      toast.error(res.error || 'Health monitor failed');
    }
  }

  if (!data) {
    return <div className="h-32 animate-pulse rounded-xl bg-muted" />;
  }

  return (
    <Card className="border-emerald-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-emerald-500" /> Stream Firewall Protection
          <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">ACTIVE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-muted/60 p-3">
            <Database className="h-4 w-4 text-brand" />
            <p className="mt-1 text-lg font-bold">{data.cacheSize}/{data.maxCacheSize}</p>
            <p className="text-[10px] text-muted-foreground">Cached Manifests</p>
          </div>
          <div className="rounded-lg bg-muted/60 p-3">
            <Globe className="h-4 w-4 text-violet-500" />
            <p className="mt-1 text-lg font-bold">{data.userAgents}</p>
            <p className="text-[10px] text-muted-foreground">Rotating UAs</p>
          </div>
          <div className="rounded-lg bg-muted/60 p-3">
            <Activity className="h-4 w-4 text-amber-500" />
            <p className="mt-1 text-lg font-bold">{data.activeConnections}</p>
            <p className="text-[10px] text-muted-foreground">Active IPs</p>
          </div>
          <div className="rounded-lg bg-muted/60 p-3">
            <Zap className="h-4 w-4 text-rose-500" />
            <p className="mt-1 text-lg font-bold">{data.rateLimit}/{data.rateWindowSeconds}s</p>
            <p className="text-[10px] text-muted-foreground">Rate Limit</p>
          </div>
        </div>

        {/* Features list */}
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Protection Layers</p>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {data.features.map((f, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Shield className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Health monitor button */}
        <Button onClick={runHealthMonitor} disabled={monitoring} variant="outline" className="w-full gap-2">
          {monitoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Run Health Monitor (auto-recover offline channels)
        </Button>
      </CardContent>
    </Card>
  );
}
