'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Video, Users, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/meetings', label: 'Meetings', icon: Video },
  { href: '/dashboard/users', label: 'Users', icon: Users },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-56 flex-col border-r border-sky-100 bg-white p-4 shadow-sm">
      <p className="mb-8 text-lg font-bold text-sky-700">Meetings Admin</p>
      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-sky-50 hover:text-sky-800'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
