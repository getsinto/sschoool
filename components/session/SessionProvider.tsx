'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  initializeSessionTracking,
  cleanupSessionTracking,
  refreshSession,
  handleSessionExpiry,
  syncSessionAcrossTabs,
  getTimeUntilLogout,
} from '@/lib/session/manager';
import { TimeoutWarningDialog } from './TimeoutWarningDialog';

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [timeoutDuration, setTimeoutDuration] = useState(300); // 5 minutes
  const router = useRouter();

  const handleWarning = useCallback(() => {
    // Calculate remaining time until logout
    const remainingTime = Math.max(0, Math.floor(getTimeUntilLogout() / 1000));
    setTimeoutDuration(remainingTime);
    setShowWarning(true);
  }, []);

  const handleLogout = useCallback(async () => {
    setShowWarning(false);
    
    try {
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }

    // Sync logout across tabs
    syncSessionAcrossTabs('logout');

    // Handle session expiry
    handleSessionExpiry();
  }, []);

  const handleStayLoggedIn = useCallback(async () => {
    setShowWarning(false);
    
    // Refresh the session
    const success = await refreshSession();
    
    if (!success) {
      // If refresh failed, logout
      handleLogout();
    }
  }, [handleLogout]);

  const handleRefresh = useCallback(() => {
    // Session was refreshed successfully
    console.log('Session refreshed');
  }, []);

  useEffect(() => {
    // Initialize session tracking
    initializeSessionTracking({
      onWarning: handleWarning,
      onLogout: handleLogout,
      onRefresh: handleRefresh,
    });

    // Cleanup on unmount
    return () => {
      cleanupSessionTracking();
    };
  }, [handleWarning, handleLogout, handleRefresh]);

  return (
    <>
      {children}
      <TimeoutWarningDialog
        isOpen={showWarning}
        onStayLoggedIn={handleStayLoggedIn}
        onLogout={handleLogout}
        timeoutDuration={timeoutDuration}
      />
    </>
  );
}
