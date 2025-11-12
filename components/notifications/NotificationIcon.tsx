import { NotificationType, NotificationPriority } from '@/types/notification';
import { getNotificationIcon } from '@/lib/notifications/icons';
import { 
  BookOpen, ClipboardList, FileText, Award, Video, CreditCard, 
  Mail, Megaphone, Settings, Bell, AlertTriangle, AlertCircle, 
  Info, MinusCircle, Circle, CheckCircle, Archive, Eye, Trash2, 
  Check, Reply, Forward
} from 'lucide-react';

interface NotificationIconProps {
  type: NotificationType;
  icon?: string;
  priority?: NotificationPriority;
  className?: string;
  size?: number;
}

const iconComponents = {
  'book-open': BookOpen,
  'clipboard-list': ClipboardList,
  'file-text': FileText,
  'award': Award,
  'video': Video,
  'credit-card': CreditCard,
  'mail': Mail,
  'megaphone': Megaphone,
  'settings': Settings,
  'bell': Bell,
  'alert-triangle': AlertTriangle,
  'alert-circle': AlertCircle,
  'info': Info,
  'minus-circle': MinusCircle,
  'circle': Circle,
  'check-circle': CheckCircle,
  'archive': Archive,
  'eye': Eye,
  'trash-2': Trash2,
  'check': Check,
  'reply': Reply,
  'forward': Forward
};

export default function NotificationIcon({
  type,
  icon,
  priority,
  className = '',
  size = 20
}: NotificationIconProps) {
  const iconName = getNotificationIcon(type, icon);
  const IconComponent = iconComponents[iconName as keyof typeof iconComponents] || Bell;

  const getPriorityColor = () => {
    switch (priority) {
      case 'urgent':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'normal':
        return 'text-blue-500';
      case 'low':
        return 'text-gray-500';
      default:
        return 'text-blue-500';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'course':
        return 'text-blue-500';
      case 'assignment':
        return 'text-purple-500';
      case 'quiz':
        return 'text-indigo-500';
      case 'grade':
        return 'text-green-500';
      case 'live_class':
        return 'text-red-500';
      case 'payment':
        return 'text-yellow-500';
      case 'message':
        return 'text-pink-500';
      case 'announcement':
        return 'text-orange-500';
      case 'system':
        return 'text-gray-500';
      default:
        return 'text-blue-500';
    }
  };

  const colorClass = priority ? getPriorityColor() : getTypeColor();

  return (
    <IconComponent 
      size={size} 
      className={`${colorClass} ${className}`}
    />
  );
}
