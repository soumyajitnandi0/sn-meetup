'use client';

import Iridescence from './Iridescence';
import ConditionalHeader from './ConditionalHeader';

export default function ClientLayout({ children }) {
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
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <ConditionalHeader />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </>
  );
}
