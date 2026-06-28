'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Power, Loader2, Megaphone, ExternalLink } from 'lucide-react';
import { useFetch, apiAction } from '@/hooks/use-fetch';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AdNetworkPanel } from './ad-network-panel';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import type { AdSlotDTO } from '@/lib/types';
import { formatMoney } from '@/lib/seo';

const PLACEMENTS = ['banner-home', 'banner-category', 'in-stream', 'sidebar', 'sponsored-rail', 'interstitial'];
const TYPES = ['image', 'video', 'text'];

export function AdsTab() {
  const refreshTick = useApp((s) => s.refreshTick);
  const bumpRefresh = useApp((s) => s.bumpRefresh);
  const { data, loading, refetch } = useFetch<{ ads: AdSlotDTO[] }>('/api/ads', [refreshTick]);

  const ads = data?.ads ?? [];
  const totalRevenue = ads.reduce((s, a) => s + a.revenueCents, 0);
  const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0);
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0);

  return (
    <div className="space-y-4">
      {/* summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card><CardContent className="p-4">
          <Megaphone className="h-5 w-5 text-brand" />
          <p className="mt-2 text-xl font-extrabold">{ads.length}</p>
          <p className="text-xs text-muted-foreground">Ad Slots</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="mt-2 text-xl font-extrabold text-emerald-500">{formatMoney(totalRevenue)}</p>
          <p className="text-xs text-muted-foreground">Total Ad Revenue</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="mt-2 text-xl font-extrabold">{totalImpressions.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Impressions</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="mt-2 text-xl font-extrabold">{totalClicks.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Clicks</p>
        </CardContent></Card>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage ad slots, CPM/CPC rates, and placements.</p>
        <AdDialog onSaved={() => { bumpRefresh(); refetch(); }} />
      </div>

      {/* table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px]">Ad</TableHead>
              <TableHead>Placement</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>CPM</TableHead>
              <TableHead>CPC</TableHead>
              <TableHead>Impr.</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>CTR</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={10}><div className="h-8 animate-pulse rounded bg-muted" /></TableCell></TableRow>
              ))
            ) : ads.length === 0 ? (
              <TableRow><TableCell colSpan={10} className="py-10 text-center text-sm text-muted-foreground">No ad slots yet. Create your first ad.</TableCell></TableRow>
            ) : (
              ads.map((ad) => (
                <TableRow key={ad.id} className={!ad.enabled ? 'opacity-50' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-muted"><Megaphone className="h-4 w-4 text-brand" /></div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{ad.headline || ad.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{ad.targetUrl}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{ad.placement}</Badge></TableCell>
                  <TableCell className="text-xs">{ad.type}</TableCell>
                  <TableCell className="text-xs">{formatMoney(ad.cpmCents)}</TableCell>
                  <TableCell className="text-xs">{formatMoney(ad.cpcCents)}</TableCell>
                  <TableCell className="text-xs">{ad.impressions.toLocaleString()}</TableCell>
                  <TableCell className="text-xs">{ad.clicks.toLocaleString()}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{ad.ctr}%</Badge></TableCell>
                  <TableCell className="text-sm font-semibold text-emerald-500">{formatMoney(ad.revenueCents)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <AdDialog ad={ad} onSaved={() => { bumpRefresh(); refetch(); }} />
                      <ToggleAd ad={ad} onToggled={() => { bumpRefresh(); refetch(); }} />
                      <DeleteAd ad={ad} onDeleted={() => { bumpRefresh(); refetch(); }} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Ad network integration */}
      <AdNetworkPanel />
    </div>
  );
}

function AdDialog({ ad, onSaved }: { ad?: AdSlotDTO; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(ad?.name ?? '');
  const [placement, setPlacement] = useState(ad?.placement ?? 'banner-home');
  const [type, setType] = useState(ad?.type ?? 'image');
  const [imageUrl, setImageUrl] = useState(ad?.imageUrl ?? '');
  const [videoUrl, setVideoUrl] = useState(ad?.videoUrl ?? '');
  const [targetUrl, setTargetUrl] = useState(ad?.targetUrl ?? '');
  const [headline, setHeadline] = useState(ad?.headline ?? '');
  const [description, setDescription] = useState(ad?.description ?? '');
  const [cta, setCta] = useState(ad?.cta ?? 'Learn More');
  const [cpmCents, setCpmCents] = useState(ad?.cpmCents ?? 250);
  const [cpcCents, setCpcCents] = useState(ad?.cpcCents ?? 0);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const payload = {
      name, placement, type,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      targetUrl, headline: headline || null, description: description || null,
      cta, cpmCents: Number(cpmCents), cpcCents: Number(cpcCents),
    };
    const res = ad
      ? await apiAction('PATCH', `/api/ads/${ad.id}`, payload)
      : await apiAction('POST', '/api/ads', payload);
    setSaving(false);
    if (res.ok) {
      toast.success(ad ? 'Ad updated' : 'Ad created');
      setOpen(false);
      onSaved();
    } else toast.error(res.error || 'Failed');
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {ad ? (
          <Button size="icon" variant="ghost" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
        ) : (
          <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> New Ad</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{ad ? 'Edit Ad' : 'Create Ad Slot'}</DialogTitle></DialogHeader>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto py-2 pr-1 scroll-thin">
          <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Home Leaderboard" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Placement</Label>
              <Select value={placement} onValueChange={setPlacement}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PLACEMENTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><Label>Target URL</Label><Input value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="https://..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Image URL (optional)</Label><Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." /></div>
            <div className="space-y-2"><Label>Video URL (optional)</Label><Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." /></div>
          </div>
          <div className="space-y-2"><Label>Headline</Label><Input value={headline} onChange={(e) => setHeadline(e.target.value)} /></div>
          <div className="space-y-2"><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2"><Label>CTA</Label><Input value={cta} onChange={(e) => setCta(e.target.value)} /></div>
            <div className="space-y-2"><Label>CPM (cents)</Label><Input type="number" value={cpmCents} onChange={(e) => setCpmCents(Number(e.target.value))} /></div>
            <div className="space-y-2"><Label>CPC (cents)</Label><Input type="number" value={cpcCents} onChange={(e) => setCpcCents(Number(e.target.value))} /></div>
          </div>
          <p className="text-xs text-muted-foreground">CPM = revenue per 1000 impressions. CPC = revenue per click. Both accrue automatically.</p>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={save} disabled={saving || !name || !targetUrl}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ToggleAd({ ad, onToggled }: { ad: AdSlotDTO; onToggled: () => void }) {
  async function toggle() {
    const res = await apiAction('PATCH', `/api/ads/${ad.id}`, { enabled: !ad.enabled });
    if (res.ok) { toast.success(ad.enabled ? 'Ad disabled' : 'Ad enabled'); onToggled(); }
    else toast.error(res.error || 'Failed');
  }
  return (
    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={toggle} title={ad.enabled ? 'Disable' : 'Enable'}>
      <Power className={`h-3.5 w-3.5 ${ad.enabled ? 'text-emerald-500' : 'text-muted-foreground'}`} />
    </Button>
  );
}

function DeleteAd({ ad, onDeleted }: { ad: AdSlotDTO; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);
  async function del() {
    setDeleting(true);
    const res = await apiAction('DELETE', `/api/ads/${ad.id}`);
    setDeleting(false);
    if (res.ok) { toast.success('Ad deleted'); onDeleted(); }
    else toast.error(res.error || 'Failed');
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700"><Trash2 className="h-3.5 w-3.5" /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{ad.headline || ad.name}”?</AlertDialogTitle>
          <AlertDialogDescription>The ad slot will be permanently removed.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={del} disabled={deleting} className="bg-red-600 hover:bg-red-700">
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
