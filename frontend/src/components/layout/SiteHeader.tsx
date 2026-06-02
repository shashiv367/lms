'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/config/constants';
import { useAuthStore } from '@/store/authStore';

export function SiteHeader() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="flex items-center justify-between border-b border-sky-100 bg-white px-8 py-4 shadow-sm">
      <Link href="/" className="text-xl font-bold text-sky-700">
        {APP_NAME}
      </Link>
      <div className="flex items-center gap-3 text-sm">
        {isAuthenticated && user ? (
          <>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-900">
              Signed in as <strong>{user.name}</strong>
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-slate-600 hover:text-sky-700">
              Sign in
            </Link>
            <Button size="sm" asChild>
              <Link href="/register">Register</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
