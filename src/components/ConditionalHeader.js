'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Don't show header on login, register, or root page (which redirects)
  const hideHeader = pathname === '/login' || pathname === '/register' || pathname === '/';
  
  if (hideHeader) {
    return null;
  }
  
  return <Header />;
}

