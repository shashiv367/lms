'use client';

import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/store/uiStore';

export function ParticipantsButton() {
  const toggleParticipants = useUiStore((s) => s.toggleParticipants);
  return (
    <Button variant="secondary" size="icon" onClick={toggleParticipants}>
      <Users className="h-5 w-5" />
    </Button>
  );
}
