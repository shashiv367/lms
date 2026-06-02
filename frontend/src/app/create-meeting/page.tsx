'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { meetingService } from '@/services/meeting.service';

export default function CreateMeetingPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !accessToken) {
      router.replace('/login');
    }
  }, [isAuthenticated, accessToken, router]);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const { data } = await meetingService.create({ title: title || undefined });
      if (data.success) {
        const id = data.data.meetingId;
        await navigator.clipboard.writeText(id);
        toast.success(`Meeting created! ID ${id} copied — share to invite others`);
        router.push(`/lobby/${id}`);
      }
    } catch {
      toast.error('Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sky-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-sky-100 bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">New Meeting</h1>
        <p className="text-sm text-slate-500">After creating, share the meeting ID so others can join.</p>
        <div>
          <Label htmlFor="title">Meeting title (optional)</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Team standup"
          />
        </div>
        <Button onClick={handleCreate} disabled={loading} className="w-full">
          {loading ? 'Creating...' : 'Start Now'}
        </Button>
      </div>
    </div>
  );
}
