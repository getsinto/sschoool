'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface TimeoutWarningDialogProps {
  isOpen: boolean;
  onStayLoggedIn: () => void;
  onLogout: () => void;
  timeoutDuration?: number; // in seconds
}

export function TimeoutWarningDialog({
  isOpen,
  onStayLoggedIn,
  onLogout,
  timeoutDuration = 300, // 5 minutes default
}: TimeoutWarningDialogProps) {
  const [countdown, setCountdown] = useState(timeoutDuration);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(timeoutDuration);
      return;
    }

    // Start countdown
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, timeoutDuration, onLogout]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <DialogTitle>Session Timeout Warning</DialogTitle>
          </div>
          <DialogDescription>
            Your session is about to expire due to inactivity.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6">
          <div className="text-6xl font-bold text-primary mb-2">
            {formatTime(countdown)}
          </div>
          <p className="text-sm text-muted-foreground">
            You will be automatically logged out in
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onLogout}
            className="w-full sm:w-auto"
          >
            Logout Now
          </Button>
          <Button
            onClick={onStayLoggedIn}
            className="w-full sm:w-auto"
          >
            Stay Logged In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
