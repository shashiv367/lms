'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import { meetingService } from '@/services/meeting.service';
import type { Meeting } from '@/types/shared-types';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/layout/SiteHeader';

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    meetingService
      .getHistory()
      .then(({ data }) => {
        if (data.success) setMeetings(data.data);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-sky-50">
      <SiteHeader />
      <div className="mx-auto max-w-4xl p-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Meeting History</h1>
          <Button asChild>
            <Link href="/create-meeting">New Meeting</Link>
          </Button>
        </div>
        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : meetings.length === 0 ? (
          <p className="text-slate-500">No meetings yet.</p>
        ) : (
          <ul className="space-y-3">
            {meetings.map((m) => (
              <li
                key={m.meetingId}
                className="flex items-center justify-between rounded-xl border border-sky-100 bg-white px-4 py-3 shadow-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{m.title}</p>
                  <p className="text-sm text-slate-500">
                    {m.meetingId} · {format(new Date(m.createdAt), 'PPp')}
                  </p>
                </div>
                <span className="rounded-full bg-sky-100 px-2 py-1 text-xs text-sky-800">
                  {m.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
