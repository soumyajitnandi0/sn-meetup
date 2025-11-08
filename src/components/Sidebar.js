'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NotificationBell from './notifications/NotificationBell';
import UserMenu from './UserMenu';
import { 
  FolderIcon, 
  HomeIcon,
  Cog6ToothIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Projects', href: '/projects', icon: FolderIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white/60 backdrop-blur-lg border-r border-gray-200/50 shadow-sm flex flex-col z-30">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200/50">
        <Link href="/projects">
          <h1 className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors">
            Task Manager
          </h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-base">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section - User & Notifications */}
      <div className="p-4 border-t border-gray-200/50 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Notifications</span>
          <NotificationBell />
        </div>
        <UserMenu />
      </div>
    </aside>
  );
}
