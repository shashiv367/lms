'use client';

import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/adminStore';

export function AdminTopBar() {
  const router = useRouter();
  const { user, logout } = useAdminStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-sky-100 bg-white px-6">
      <span className="text-sm text-slate-600">Admin Dashboard</span>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-900">{user?.email}</span>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
