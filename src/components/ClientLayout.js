'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Iridescence from './Iridescence';
import Sidebar from './Sidebar';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't show sidebar on login/register pages
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');
  const showSidebar = mounted && !isAuthPage;

  return (
    <>
      {/* Global Animated Background */}
      <div className="fixed inset-0 z-0">
        <Iridescence 
          color={[0.5, 0.7, 1.0]}
          speed={0.5}
          amplitude={0.15}
          mouseReact={true}
        />
      </div>
      
      {/* Layout with Sidebar */}
      <div className="relative z-10 min-h-screen flex">
        {showSidebar && <Sidebar />}
        <main className={`flex-1 ${showSidebar ? 'ml-64' : ''}`}>
          {children}
        </main>
      </div>
    </>
  );
}
