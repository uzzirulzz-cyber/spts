'use client';

import {
  Trophy, Target, Swords, Film, Music, MonitorPlay, Radio, Play,
  Search, Bell, Heart, Crown, ArrowRight, Check, Tv, Users, Zap,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function LandingView() {
  const setView = useApp((s) => s.setView);
  const openAuth = useApp((s) => s.openAuth);

  const sports = [
    { name: 'Football', icon: Trophy, color: 'text-emerald-500', desc: 'Premier League, Champions League, La Liga & more', view: 'football' as const },
    { name: 'Cricket', icon: Target, color: 'text-amber-500', desc: 'IPL, PSL, BBL, ICC Events, Test & T20', view: 'cricket' as const },
    { name: 'Wrestling', icon: Swords, color: 'text-rose-500', desc: 'WWE RAW, SmackDown, NXT, AEW, UFC', view: 'wrestling' as const },
    { name: 'Other Sports', icon: Tv, color: 'text-violet-500', desc: 'NBA, F1, Tennis, Boxing, MMA, Golf & more', view: 'other-sports' as const },
  ];

  const entertainment = [
    { name: 'Movies', icon: Film, color: 'text-rose-500', desc: 'Hollywood, Bollywood, Action, Comedy, Horror & Anime', view: 'movies' as const },
    { name: 'Music', icon: Music, color: 'text-purple-500', desc: 'Pop, Rock, Hip Hop, Classical, Electronic & World', view: 'music' as const },
    { name: 'Web Series', icon: MonitorPlay, color: 'text-cyan-500', desc: 'Drama, Thriller, Reality TV, Documentaries & News', view: 'web-series' as const },
  ];

  const features = [
    { icon: Radio, title: 'Live Streaming', desc: 'Watch 14,000+ channels live in HD with HLS adaptive playback' },
    { icon: Search, title: 'Smart Search', desc: 'Find channels by name, league, team, country, language or category' },
    { icon: Bell, title: 'Live Notifications', desc: 'Get notified when your favorite channels go live' },
    { icon: Heart, title: 'Favorites & History', desc: 'Save channels, resume playback, sync across devices' },
    { icon: Crown, title: '100% Free', desc: 'No subscription fee, no paywall, unlimited streaming' },
    { icon: Zap, title: 'Multi-M3U Engine', desc: 'Auto-merges 3 playlists, removes duplicates, refreshes every 6h' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="PlayBeat Arena" className="h-9 w-9 rounded-lg object-contain" />
            <span className="text-lg font-extrabold tracking-tight">PlayBeat Arena</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => openAuth('login')} className="hidden sm:flex">Log in</Button>
            <Button size="sm" onClick={() => openAuth('signup')} className="gap-1.5">Sign up free <ArrowRight className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand/10 via-background to-background" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
          <div className="flex flex-col items-center text-center">
            <img src="/logo.png" alt="PlayBeat Arena" className="mb-6 h-24 w-24 rounded-2xl object-contain shadow-2xl sm:h-32 sm:w-32" />
            <Badge className="mb-4 brand-bg gap-1">
              <Crown className="h-3 w-3" /> 100% Free · No Subscription · 14,000+ Live Channels
            </Badge>
            <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Watch <span className="gradient-text">Live Sports, Movies, Music</span> & Web Series — All Free
            </h1>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              PlayBeat Arena merges multiple M3U playlists into one polished streaming experience.
              Auto-categorized into Football, Cricket, Wrestling, Movies, Music and more.
              Full HD, HLS adaptive playback, no signup required.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" onClick={() => setView('home')} className="gap-2 text-base">
                <Play className="h-5 w-5 fill-current" /> Enter Platform
              </Button>
              <Button size="lg" variant="outline" onClick={() => setView('live')} className="gap-2 text-base">
                <Radio className="h-5 w-5 text-red-500" /> Watch Live Now
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-emerald-500" /> No credit card</span>
              <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-emerald-500" /> No ads on premium content</span>
              <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-emerald-500" /> Works on all devices</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Sports Categories</h2>
          <p className="mt-2 text-muted-foreground">Intelligently auto-categorized from your M3U playlists</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sports.map((s) => (
            <button
              key={s.name}
              onClick={() => setView(s.view)}
              className="group rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-brand hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">{s.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
                Browse <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Entertainment Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Movies, Music & Web Series</h2>
          <p className="mt-2 text-muted-foreground">Related content auto-pulled from your playlists</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {entertainment.map((s) => (
            <button
              key={s.name}
              onClick={() => setView(s.view)}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 text-left transition-all hover:border-brand hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="absolute -right-4 -top-4 opacity-5">
                <s.icon className="h-32 w-32" />
              </div>
              <div className="relative">
                <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${s.color}`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">{s.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
                  Explore <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Everything You Need to Stream</h2>
            <p className="mt-2 text-muted-foreground">Built-in monetization, SEO, notifications & more</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg brand-bg">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-brand/40 bg-gradient-to-br from-brand/15 via-card to-card p-8 text-center sm:p-16">
          <div className="absolute -right-8 -top-8 opacity-10">
            <img src="/logo.png" alt="" className="h-48 w-48 object-contain" />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ready to Start Watching?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Join PlayBeat Arena — 100% free, no subscription, 14,000+ live channels.
              Create an account to save favorites, get notifications & sync across devices.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" onClick={() => setView('home')} className="gap-2 text-base">
                <Play className="h-5 w-5 fill-current" /> Start Watching Free
              </Button>
              <Button size="lg" variant="outline" onClick={() => openAuth('signup')} className="gap-2 text-base">
                Create Account <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="PlayBeat Arena" className="h-5 w-5 rounded object-contain" />
            <span className="font-semibold text-foreground">PlayBeat Arena</span>
            <span>· Multi-M3U Sports & Entertainment Streaming</span>
          </div>
          <p>© 2025 PlayBeat Arena · All channels free · No subscription</p>
        </div>
      </footer>
    </div>
  );
}
