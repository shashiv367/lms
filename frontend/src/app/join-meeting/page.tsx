'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { meetingService } from '@/services/meeting.service';

export default function JoinMeetingPage() {
  const router = useRouter();
  const [meetingId, setMeetingId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!meetingId.trim()) return;
    setLoading(true);
    try {
      const { data } = await meetingService.getById(meetingId.trim().toUpperCase());
      if (data.success) {
        router.push(`/lobby/${data.data.meetingId}`);
      }
    } catch {
      toast.error('Meeting not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-sky-100 bg-white p-8 shadow-lg shadow-sky-100/50">
        <h1 className="text-2xl font-bold text-slate-900">Join Meeting</h1>
        <div>
          <Label htmlFor="code">Meeting ID</Label>
          <Input
            id="code"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value.toUpperCase())}
            placeholder="ABC12345"
            maxLength={8}
          />
        </div>
        <Button onClick={handleJoin} disabled={loading} className="w-full">
          {loading ? 'Checking...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
