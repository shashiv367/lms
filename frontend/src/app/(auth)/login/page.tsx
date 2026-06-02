import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { APP_NAME } from '@/config/constants';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <SiteHeader />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-sky-100 bg-white p-8 shadow-lg shadow-sky-100/50">
          <h1 className="text-2xl font-bold text-slate-900">Sign in to {APP_NAME}</h1>
          <p className="mt-2 text-sm text-slate-500">Welcome back. Enter your credentials.</p>
          <div className="mt-6">
            <LoginForm />
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">
            No account?{' '}
            <Link href="/register" className="font-medium text-sky-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
