'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '@/lib/store';
import { apiAction } from '@/hooks/use-fetch';

// Load the admin shell client-side only (it uses browser APIs).
const AdminApp = dynamic(() => import('@/components/admin-app').then((m) => m.AdminApp), { ssr: false });

export default function AdminPage() {
  const bumpRefresh = useApp((s) => s.bumpRefresh);

  useEffect(() => {
    apiAction('POST', '/api/seed').catch(() => {});
    bumpRefresh();
  }, [bumpRefresh]);

  return <AdminApp />;
}
