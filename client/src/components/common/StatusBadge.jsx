import React from 'react';
import {
  Clock,
  Search,
  CheckCircle2,
  UserCheck,
  PlayCircle,
  Sparkles,
  ShieldCheck,
  CheckCheck,
  XCircle,
  RotateCcw,
  Ban,
} from 'lucide-react';

const STATUS_CONFIG = {
  REPORTED: { label: 'Reported', colorClass: 'badge-reported', icon: Clock },
  UNDER_REVIEW: { label: 'Under Review', colorClass: 'badge-under_review', icon: Search },
  APPROVED: { label: 'Approved', colorClass: 'badge-approved', icon: CheckCircle2 },
  ASSIGNED: { label: 'Assigned', colorClass: 'badge-assigned', icon: UserCheck },
  ACCEPTED: { label: 'Accepted', colorClass: 'badge-accepted', icon: PlayCircle },
  IN_PROGRESS: { label: 'In Progress', colorClass: 'badge-in_progress', icon: Sparkles },
  COMPLETED: { label: 'Completed', colorClass: 'badge-completed', icon: CheckCheck },
  VERIFICATION_PENDING: { label: 'Verification Pending', colorClass: 'badge-verification_pending', icon: ShieldCheck },
  RESOLVED: { label: 'Resolved', colorClass: 'badge-resolved', icon: CheckCheck },
  REOPENED: { label: 'Reopened', colorClass: 'badge-reopened', icon: RotateCcw },
  REJECTED: { label: 'Rejected', colorClass: 'badge-rejected', icon: XCircle },
  CANCELLED: { label: 'Cancelled', colorClass: 'badge-cancelled', icon: Ban },
};

const StatusBadge = ({ status, showIcon = true, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    colorClass: 'badge-reported',
    icon: Clock,
  };
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium tracking-wide uppercase shadow-sm ${config.colorClass} ${sizeClasses[size] || sizeClasses.md}`}
    >
      {showIcon && <IconComponent className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />}
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
