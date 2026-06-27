import type { MetadataRoute } from 'next';

// GET /manifest.webmanifest — PWA manifest
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PlayBeat Arena — Live Sports Streaming',
    short_name: 'PlayBeat Arena',
    description: 'Multi-M3U IPTV Sports Streaming Platform — Football, Cricket, WWE, UFC & more in HD.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#10b981',
    orientation: 'any',
    categories: ['sports', 'entertainment', 'video'],
    icons: [
      { src: '/logo.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
    shortcuts: [
      { name: 'Live Now', url: '/?view=live', description: 'Channels streaming live now' },
      { name: 'Football', url: '/?view=football', description: 'Live football streams' },
      { name: 'Cricket', url: '/?view=cricket', description: 'Live cricket streams' },
      { name: 'Wrestling', url: '/?view=wrestling', description: 'WWE, UFC & wrestling' },
    ],
  };
}
