import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/config/constants';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <main className="mx-auto flex max-w-lg flex-col items-center px-8 py-24 text-center">
        <p className="text-sm font-semibold text-sky-700">404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Page not found
        </h1>
        <p className="mt-3 text-slate-600">
          The page you’re looking for doesn’t exist.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Button asChild>
            <Link href="/">Go to {APP_NAME}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

