'use client';

import { UserPlus, Copy, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface InviteOthersProps {
  meetingId: string;
}

export function InviteOthers({ meetingId }: InviteOthersProps) {
  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/join-meeting`
      : `/join-meeting`;

  const copyId = () => {
    void navigator.clipboard.writeText(meetingId);
    toast.success('Meeting ID copied — share with others');
  };

  const copyLink = () => {
    void navigator.clipboard.writeText(joinUrl);
    toast.success('Join link copied');
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={copyId} title="Copy meeting ID">
        <Copy className="mr-1 h-4 w-4" />
        Invite
      </Button>
      <Button variant="ghost" size="sm" onClick={copyLink} title="Copy join page link">
        <Link2 className="h-4 w-4" />
      </Button>
      <span className="hidden text-xs text-slate-500 sm:inline">
        <UserPlus className="mr-1 inline h-3 w-3" />
        Others join via ID at /join-meeting
      </span>
    </div>
  );
}
