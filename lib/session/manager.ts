/**
 * Session Manager Library
 * Handles session timeout, inactivity tracking, and cross-tab synchronization
 */

// Session configuration
const INACTIVITY_WARNING_TIME = 25 * 60 * 1000; // 25 minutes
const INACTIVITY_LOGOUT_TIME = 30 * 60 * 1000; // 30 minutes
const SESSION_CHECK_INTERVAL = 60 * 1000; // 1 minute
const STORAGE_KEY = 'session_activity';

// Activity events to track
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
];

type SessionState = {
  lastActivity: number;
  isWarningShown: boolean;
  isActive: boolean;
};

type SessionCallbacks = {
  onWarning?: () => void;
  onLogout?: () => void;
  onRefresh?: () => void;
};

let sessionState: SessionState = {
  lastActivity: Date.now(),
  isWarningShown: false,
  isActive: true,
};

let callbacks: SessionCallbacks = {};
let activityTimer: NodeJS.Timeout | null = null;
let checkInterval: NodeJS.Timeout | null = null;
let storageListener: ((e: StorageEvent) => void) | null = null;

/**
 * Initialize session tracking
 * Sets up activity listeners and timeout checks
 */
export function initializeSessionTracking(sessionCallbacks: SessionCallbacks = {}): void {
  callbacks = sessionCallbacks;
  
  // Reset session state
  sessionState = {
    lastActivity: Date.now(),
    isWarningShown: false,
    isActive: true,
  };

  // Update storage with initial activity
  updateActivityInStorage();

  // Add activity event listeners
  ACTIVITY_EVENTS.forEach((event) => {
    window.addEventListener(event, handleActivity, { passive: true });
  });

  // Start periodic session checks
  startSessionChecks();

  // Set up cross-tab synchronization
  setupCrossTabSync();

  // Set up visibility change handler
  document.addEventListener('visibilitychange', handleVisibilityChange);
}

/**
 * Clean up session tracking
 * Removes all listeners and timers
 */
export function cleanupSessionTracking(): void {
  // Remove activity listeners
  ACTIVITY_EVENTS.forEach((event) => {
    window.removeEventListener(event, handleActivity);
  });

  // Clear timers
  if (activityTimer) {
    clearTimeout(activityTimer);
    activityTimer = null;
  }

  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }

  // Remove storage listener
  if (storageListener) {
    window.removeEventListener('storage', storageListener);
    storageListener = null;
  }

  // Remove visibility change listener
  document.removeEventListener('visibilitychange', handleVisibilityChange);

  sessionState.isActive = false;
}

/**
 * Handle user activity
 * Resets inactivity timer and updates storage
 */
function handleActivity(): void {
  if (!sessionState.isActive) return;

  const now = Date.now();
  const timeSinceLastActivity = now - sessionState.lastActivity;

  // Only update if significant time has passed (throttle updates)
  if (timeSinceLastActivity > 1000) {
    sessionState.lastActivity = now;
    sessionState.isWarningShown = false;
    updateActivityInStorage();
    resetInactivityTimer();
  }
}

/**
 * Reset the inactivity timer
 * Clears existing timer and starts a new one
 */
export function resetInactivityTimer(): void {
  if (activityTimer) {
    clearTimeout(activityTimer);
  }

  // Set timer for warning
  activityTimer = setTimeout(() => {
    checkSessionTimeout();
  }, INACTIVITY_WARNING_TIME);
}

/**
 * Check session timeout status
 * Shows warning or logs out based on inactivity duration
 */
function checkSessionTimeout(): void {
  const now = Date.now();
  const inactiveTime = now - sessionState.lastActivity;

  if (inactiveTime >= INACTIVITY_LOGOUT_TIME) {
    // Logout time reached
    handleSessionExpiry();
  } else if (inactiveTime >= INACTIVITY_WARNING_TIME && !sessionState.isWarningShown) {
    // Warning time reached
    showTimeoutWarning();
  }
}

/**
 * Show timeout warning dialog
 * Triggers callback to display warning UI
 */
export function showTimeoutWarning(): void {
  if (sessionState.isWarningShown) return;

  sessionState.isWarningShown = true;
  
  if (callbacks.onWarning) {
    callbacks.onWarning();
  }
}

/**
 * Refresh the session
 * Resets timeout and updates activity
 */
export async function refreshSession(): Promise<boolean> {
  try {
    // Call API to refresh session token
    const response = await fetch('/api/session/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Session refresh failed');
    }

    // Reset activity tracking
    sessionState.lastActivity = Date.now();
    sessionState.isWarningShown = false;
    updateActivityInStorage();
    resetInactivityTimer();

    if (callbacks.onRefresh) {
      callbacks.onRefresh();
    }

    return true;
  } catch (error) {
    console.error('Failed to refresh session:', error);
    return false;
  }
}

/**
 * Handle session expiry
 * Logs out user and cleans up
 */
export function handleSessionExpiry(): void {
  sessionState.isActive = false;
  
  // Clear session data from storage
  clearSessionData();

  if (callbacks.onLogout) {
    callbacks.onLogout();
  }

  // Redirect to login with expiry message
  const currentPath = window.location.pathname;
  window.location.href = `/login?expired=true&redirect=${encodeURIComponent(currentPath)}`;
}

/**
 * Update activity timestamp in localStorage
 * Used for cross-tab synchronization
 */
function updateActivityInStorage(): void {
  try {
    const data = {
      lastActivity: sessionState.lastActivity,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to update activity in storage:', error);
  }
}

/**
 * Get activity timestamp from localStorage
 * Used for cross-tab synchronization
 */
function getActivityFromStorage(): number | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    const parsed = JSON.parse(data);
    return parsed.lastActivity;
  } catch (error) {
    console.error('Failed to get activity from storage:', error);
    return null;
  }
}

/**
 * Set up cross-tab session synchronization
 * Listens for storage events from other tabs
 */
function setupCrossTabSync(): void {
  storageListener = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const data = JSON.parse(event.newValue);
        
        // Update local state with activity from other tab
        if (data.lastActivity > sessionState.lastActivity) {
          sessionState.lastActivity = data.lastActivity;
          sessionState.isWarningShown = false;
          resetInactivityTimer();
        }
      } catch (error) {
        console.error('Failed to sync session across tabs:', error);
      }
    }

    // Handle logout in another tab
    if (event.key === 'session_logout' && event.newValue === 'true') {
      handleSessionExpiry();
    }
  };

  window.addEventListener('storage', storageListener);
}

/**
 * Synchronize session across tabs
 * Broadcasts logout to all tabs
 */
export function syncSessionAcrossTabs(action: 'logout'): void {
  try {
    if (action === 'logout') {
      localStorage.setItem('session_logout', 'true');
      // Clear the flag after a short delay
      setTimeout(() => {
        localStorage.removeItem('session_logout');
      }, 1000);
    }
  } catch (error) {
    console.error('Failed to sync session across tabs:', error);
  }
}

/**
 * Start periodic session checks
 * Checks session validity every minute
 */
function startSessionChecks(): void {
  checkInterval = setInterval(() => {
    checkSessionTimeout();
    verifySessionValidity();
  }, SESSION_CHECK_INTERVAL);
}

/**
 * Verify session validity with server
 * Checks both token expiration and database status
 */
async function verifySessionValidity(): Promise<void> {
  try {
    const response = await fetch('/api/session/verify', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Session is invalid
      handleSessionExpiry();
    }
  } catch (error) {
    // Network error - don't logout, just log
    console.error('Failed to verify session:', error);
  }
}

/**
 * Handle visibility change
 * Checks session when tab becomes visible
 */
function handleVisibilityChange(): void {
  if (document.visibilityState === 'visible') {
    // Tab became visible - check for activity in other tabs
    const storedActivity = getActivityFromStorage();
    if (storedActivity && storedActivity > sessionState.lastActivity) {
      sessionState.lastActivity = storedActivity;
      sessionState.isWarningShown = false;
      resetInactivityTimer();
    }

    // Verify session is still valid
    verifySessionValidity();
  }
}

/**
 * Clear session data
 * Removes all session-related data from storage
 */
function clearSessionData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('session_logout');
    // Clear any other session-related data
    sessionStorage.clear();
  } catch (error) {
    console.error('Failed to clear session data:', error);
  }
}

/**
 * Get time until warning (in milliseconds)
 * Returns negative if warning time has passed
 */
export function getTimeUntilWarning(): number {
  const now = Date.now();
  const inactiveTime = now - sessionState.lastActivity;
  return INACTIVITY_WARNING_TIME - inactiveTime;
}

/**
 * Get time until logout (in milliseconds)
 * Returns negative if logout time has passed
 */
export function getTimeUntilLogout(): number {
  const now = Date.now();
  const inactiveTime = now - sessionState.lastActivity;
  return INACTIVITY_LOGOUT_TIME - inactiveTime;
}

/**
 * Get current session state
 * For debugging and testing
 */
export function getSessionState(): SessionState {
  return { ...sessionState };
}

/**
 * Check if session is active
 */
export function isSessionActive(): boolean {
  return sessionState.isActive;
}
