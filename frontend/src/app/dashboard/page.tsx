'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { meetingService } from '@/services/meeting.service';
import type { Meeting } from '@/types/shared-types';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [joinMeetingId, setJoinMeetingId] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

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

  const handleJoin = async () => {
    const meetingId = joinMeetingId.trim().toUpperCase();
    if (!meetingId) {
      toast.error('Please enter a meeting ID');
      return;
    }

    setJoinLoading(true);
    try {
      const { data } = await meetingService.join(meetingId);
      if (data.success) {
        toast.success('Joining meeting...');
        setIsJoinOpen(false);
        setJoinMeetingId('');
        router.push(`/room/${meetingId}`);
      } else {
        toast.error('Meeting not found');
      }
    } catch {
      toast.error('Meeting not found');
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50">
      <SiteHeader />
      <div className="mx-auto max-w-4xl p-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Meeting History</h1>
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link href="/create-meeting">New Meeting</Link>
            </Button>
            <Button onClick={() => setIsJoinOpen(true)}>Join Meeting</Button>
          </div>
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

      {isJoinOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Join Meeting"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsJoinOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-sky-100 bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900">Join Meeting</h2>
            <div className="mt-4 space-y-2">
              <Label htmlFor="joinMeetingId" className="text-slate-700">
                Meeting ID
              </Label>
              <Input
                id="joinMeetingId"
                value={joinMeetingId}
                onChange={(e) => setJoinMeetingId(e.target.value)}
                placeholder="Enter Meeting ID"
                autoFocus
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsJoinOpen(false);
                  setJoinMeetingId('');
                }}
                disabled={joinLoading}
              >
                Cancel
              </Button>
              <Button onClick={() => void handleJoin()} disabled={joinLoading}>
                {joinLoading ? 'Joining…' : 'Join Meeting'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
