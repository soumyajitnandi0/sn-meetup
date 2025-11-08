'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PageLoadingSkeleton } from '@/components/LoadingSkeleton';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/projects');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return <PageLoadingSkeleton />;
}
