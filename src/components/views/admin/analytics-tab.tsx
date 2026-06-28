'use client';

import { useFetch } from '@/hooks/use-fetch';
import { useApp } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FirewallStatus } from './firewall-status';
import { Tv, Radio, AlertTriangle, Heart, Eye, Activity, Server, Flame, Star, Users, Gauge, AlertCircle, ListChecks, Timer } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import type { AnalyticsDTO } from '@/lib/types';

const PIE_COLORS = ['#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#3b82f6', '#ec4899'];

export function AnalyticsTab() {
  const refreshTick = useApp((s) => s.refreshTick);
  const { data, loading } = useFetch<AnalyticsDTO>('/api/analytics', [refreshTick]);

  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  const onlinePct = data.totalChannels > 0 ? Math.round((data.onlineChannels / data.totalChannels) * 100) : 0;

  const cards = [
    { label: 'Total Channels', value: data.totalChannels, icon: Tv, accent: 'text-brand' },
    { label: 'Online', value: data.onlineChannels, icon: Radio, accent: 'text-emerald-500' },
    { label: 'Offline', value: data.offlineChannels, icon: AlertTriangle, accent: 'text-red-500' },
    { label: 'Disabled', value: data.disabledChannels, icon: Server, accent: 'text-muted-foreground' },
    { label: 'Live Now', value: data.liveNowChannels, icon: Activity, accent: 'text-red-500' },
    { label: 'Active Streams', value: data.activeStreams, icon: Gauge, accent: 'text-cyan-500' },
    { label: 'Featured', value: data.featuredChannels, icon: Star, accent: 'text-amber-500' },
    { label: 'Trending', value: data.trendingChannels, icon: Flame, accent: 'text-orange-500' },
    { label: 'Total Views', value: data.totalViews, icon: Eye, accent: 'text-brand' },
    { label: 'Total Users', value: data.totalUsers, icon: Users, accent: 'text-violet-500' },
    { label: 'Favorites', value: data.totalFavorites, icon: Heart, accent: 'text-red-500' },
    { label: 'Stream Errors', value: data.streamErrors, icon: AlertCircle, accent: 'text-red-500' },
    { label: 'Import Runs', value: data.importRuns, icon: ListChecks, accent: 'text-emerald-500' },
    { label: 'Playlists', value: data.totalPlaylists, icon: Server, accent: 'text-violet-500' },
  ];

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <c.icon className={`h-5 w-5 ${c.accent}`} />
              </div>
              <p className="mt-2 text-2xl font-extrabold">{c.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* category distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Channels by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byCategory} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip
                    contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {data.byCategory.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* online vs offline pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stream Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Online', value: data.onlineChannels || 1 },
                        { name: 'Offline', value: data.offlineChannels },
                        { name: 'Unknown', value: Math.max(0, data.totalChannels - data.onlineChannels - data.offlineChannels) },
                      ]}
                      dataKey="value"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#f43f5e" />
                      <Cell fill="#71717a" />
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-emerald-500" /> Online ({onlinePct}%)</div>
                <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-red-500" /> Offline</div>
                <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-zinc-500" /> Unknown</div>
                <p className="pt-2 text-xs text-muted-foreground">
                  Run stream probes from the Channels tab to update health.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* playlist health */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Playlist Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.playlistHealth.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-40 shrink-0 truncate text-sm font-medium">{p.name}</div>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${p.health > 70 ? 'bg-emerald-500' : p.health > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${p.health}%` }}
                  />
                </div>
                <Badge variant="secondary" className="w-12 justify-center">{p.health}%</Badge>
                <span className="hidden w-32 shrink-0 text-right text-xs text-muted-foreground sm:block">
                  {p.onlineCount}/{p.channelCount} online
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* top channels + recent activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Viewed Channels</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topChannels.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No views recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {data.topChannels.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">{i + 1}</span>
                    {c.logo && (
                       
                      <img src={c.logo} alt="" className="h-7 w-7 rounded object-contain" />
                    )}
                    <span className="flex-1 truncate text-sm font-medium">{c.name}</span>
                    <span className="text-sm text-muted-foreground">{c.viewCount} views</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Buffer statistics + recent import activity */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Timer className="h-4 w-4" /> Buffer Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-muted/60 p-3">
                  <p className="text-lg font-extrabold text-brand">{data.bufferStats.avgMs}ms</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg</p>
                </div>
                <div className="rounded-lg bg-muted/60 p-3">
                  <p className="text-lg font-extrabold text-amber-500">{data.bufferStats.p95Ms}ms</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">P95</p>
                </div>
                <div className="rounded-lg bg-muted/60 p-3">
                  <p className="text-lg font-extrabold">{data.bufferStats.samples}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Samples</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Derived from recent playlist refresh durations as a proxy for stream operation latency.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4" /> Recent Import Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {data.recentLogs.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No import runs yet.</p>
              ) : (
                <div className="max-h-56 space-y-2 overflow-y-auto scroll-thin">
                  {data.recentLogs.map((l) => (
                    <div key={l.id} className="flex items-center gap-3 rounded-lg border border-border p-2">
                      <Badge variant={l.status === 'success' ? 'default' : l.status === 'error' ? 'destructive' : 'secondary'} className="text-[9px]">
                        {l.status}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{l.playlist}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(l.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="text-right text-[10px] text-muted-foreground">
                        <span className="font-semibold text-foreground">{l.imported}</span> in
                        <br />
                        <span className="text-red-500">{l.errors} err</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stream Firewall Status */}
      <FirewallStatus />
    </div>
  );
}
