'use client';

import Link from 'next/link';
import NotificationBell from './notifications/NotificationBell';
import UserMenu from './UserMenu';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/projects">
              <h1 className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors">
                Task Manager
              </h1>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/projects"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Projects
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
