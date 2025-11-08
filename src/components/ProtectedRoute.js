'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PageLoadingSkeleton } from './LoadingSkeleton';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <PageLoadingSkeleton />;
  }

  if (!user) {
    return <PageLoadingSkeleton />;
  }

  return children;
}

