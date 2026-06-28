'use client';

import { useState, useEffect } from 'react';
import { Wifi, Save, Loader2, Check, ExternalLink } from 'lucide-react';
import { apiAction } from '@/hooks/use-fetch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AdNetworkData {
  settings: {
    network: string;
    publisherId: string;
    autoAds: boolean;
    stickyBottom: boolean;
    inFeed: boolean;
    preRoll: boolean;
  };
  networks: { key: string; name: string; note: string }[];
}

export function AdNetworkPanel() {
  const [data, setData] = useState<AdNetworkData | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/ad-network').then((r) => r.json()).then((d: AdNetworkData) => {
      setData(d);
      setForm({
        network: d.settings.network,
        publisherId: d.settings.publisherId,
        autoAds: d.settings.autoAds,
        stickyBottom: d.settings.stickyBottom,
        inFeed: d.settings.inFeed,
        preRoll: d.settings.preRoll,
      });
    }).catch(() => {});
  }, []);

  async function save() {
    setSaving(true);
    const res = await apiAction('POST', '/api/admin/ad-network', form);
    setSaving(false);
    if (res.ok) toast.success('Ad network settings saved');
    else toast.error(res.error || 'Failed');
  }

  if (!data) {
    return <div className="h-40 animate-pulse rounded-xl bg-muted" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Wifi className="h-4 w-4" /> Ad Network Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network selector */}
        <div className="space-y-2">
          <Label>Ad Network</Label>
          <Select value={String(form.network)} onValueChange={(v) => setForm({ ...form, network: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {data.networks.map((n) => <SelectItem key={n.key} value={n.key}>{n.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {data.networks.find((n) => n.key === form.network)?.note}
          </p>
        </div>

        {/* Publisher ID */}
        <div className="space-y-2">
          <Label>Publisher ID / Client ID</Label>
          <Input
            value={String(form.publisherId || '')}
            onChange={(e) => setForm({ ...form, publisherId: e.target.value })}
            placeholder="ca-pub-XXXXXXXXXXXXXXXX"
          />
          <p className="text-xs text-muted-foreground">
            Enter your ad network publisher ID to activate real ads. Leave empty to use built-in demo ads.
          </p>
        </div>

        {/* Feature toggles */}
        <div className="grid grid-cols-2 gap-3">
          <ToggleRow label="Auto Ads" desc="Auto-insert ads by Google" checked={!!form.autoAds} onChange={(v) => setForm({ ...form, autoAds: v })} />
          <ToggleRow label="Sticky Bottom Ad" desc="Fixed bottom ad bar" checked={!!form.stickyBottom} onChange={(v) => setForm({ ...form, stickyBottom: v })} />
          <ToggleRow label="In-Feed Native Ads" desc="Ads between channel cards" checked={!!form.inFeed} onChange={(v) => setForm({ ...form, inFeed: v })} />
          <ToggleRow label="Video Pre-Roll" desc="Ad before stream plays" checked={!!form.preRoll} onChange={(v) => setForm({ ...form, preRoll: v })} />
        </div>

        {/* Revenue potential */}
        <div className="rounded-lg bg-emerald-500/10 p-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">Revenue Potential</Badge>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
            <div><p className="font-bold text-emerald-500">+$2-5</p><p className="text-muted-foreground">Display RPM</p></div>
            <div><p className="font-bold text-amber-500">+$8-15</p><p className="text-muted-foreground">Video RPM</p></div>
            <div><p className="font-bold text-violet-500">+$1-3</p><p className="text-muted-foreground">Affiliate RPM</p></div>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Enabling all features can increase RPM to $11-23 per 1,000 page views.
          </p>
        </div>

        <Button onClick={save} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
      <div>
        <p className="text-xs font-semibold">{label}</p>
        <p className="text-[10px] text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
