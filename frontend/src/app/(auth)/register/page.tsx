import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { APP_NAME } from '@/config/constants';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <SiteHeader />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-sky-100 bg-white p-8 shadow-lg shadow-sky-100/50">
          <h1 className="text-2xl font-bold text-slate-900">Join {APP_NAME}</h1>
          <p className="mt-2 text-sm text-slate-500">
            Create your account to host and join meetings.
          </p>
          <div className="mt-6">
            <RegisterForm />
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-sky-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
