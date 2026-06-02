'use client';

import { useEffect } from 'react';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (!accessToken || user) return;
    authService
      .me()
      .then(({ data }) => {
        if (data.success) setUser(data.data);
      })
      .catch(() => {});
  }, [accessToken, user, setUser]);

  return <>{children}</>;
}
