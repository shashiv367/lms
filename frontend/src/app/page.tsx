 'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/config/constants';
import { useAuthStore } from '@/store/authStore';

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <SiteHeader />
      <main className="mx-auto flex max-w-lg flex-col items-center px-8 py-24 text-center">
        <h1 className="text-4xl font-bold text-slate-900">{APP_NAME}</h1>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            onClick={() => router.push(isAuthenticated ? '/dashboard' : '/login')}
          >
            Get started
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/join-meeting">Join meeting</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
