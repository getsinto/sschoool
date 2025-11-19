import { useState } from 'react';

interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (props: Toast) => {
    // Simple console log for now - can be enhanced with actual toast UI
    console.log(`[${props.variant || 'default'}] ${props.title}`, props.description);
    
    // In a real implementation, this would trigger a toast notification
    // For now, we'll just use browser alert for critical errors
    if (props.variant === 'destructive') {
      // Could use a toast library here
    }
  };

  return { toast, toasts };
}
