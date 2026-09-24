import React from 'react';
import { AlertCircle, AlertTriangle, ShieldAlert, ArrowDown } from 'lucide-react';

const PRIO_CONFIG = {
  CRITICAL: { label: 'Critical', colorClass: 'prio-critical', icon: ShieldAlert },
  HIGH: { label: 'High', colorClass: 'prio-high', icon: AlertTriangle },
  MEDIUM: { label: 'Medium', colorClass: 'prio-medium', icon: AlertCircle },
  LOW: { label: 'Low', colorClass: 'prio-low', icon: ArrowDown },
};

const PriorityBadge = ({ priority = 'MEDIUM', showIcon = true, size = 'md' }) => {
  const config = PRIO_CONFIG[priority?.toUpperCase()] || PRIO_CONFIG.MEDIUM;
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
    lg: 'text-sm px-3 py-1 gap-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md uppercase tracking-wider font-semibold ${config.colorClass} ${sizeClasses[size] || sizeClasses.md}`}
    >
      {showIcon && <IconComponent className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />}
      <span>{config.label}</span>
    </span>
  );
};

export default PriorityBadge;
