import React from 'react';
import {
  FileText,
  Search,
  CheckCircle,
  UserCheck,
  Play,
  Hammer,
  CheckCheck,
  ShieldCheck,
  Award,
  AlertCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react';

const MAIN_STAGES = [
  { key: 'REPORTED', label: 'Reported', icon: FileText },
  { key: 'UNDER_REVIEW', label: 'Review', icon: Search },
  { key: 'APPROVED', label: 'Approved', icon: CheckCircle },
  { key: 'ASSIGNED', label: 'Assigned', icon: UserCheck },
  { key: 'ACCEPTED', label: 'Accepted', icon: Play },
  { key: 'IN_PROGRESS', label: 'In Progress', icon: Hammer },
  { key: 'COMPLETED', label: 'Completed', icon: CheckCheck },
  { key: 'VERIFICATION_PENDING', label: 'Verification', icon: ShieldCheck },
  { key: 'RESOLVED', label: 'Resolved', icon: Award },
];

const STAGE_ORDER = {
  REPORTED: 1,
  UNDER_REVIEW: 2,
  APPROVED: 3,
  ASSIGNED: 4,
  ACCEPTED: 5,
  IN_PROGRESS: 6,
  COMPLETED: 7,
  VERIFICATION_PENDING: 8,
  RESOLVED: 9,
};

const TimelineVisualizer = ({ currentStatus = 'REPORTED' }) => {
  const isSpecialState = ['REJECTED', 'REOPENED', 'CANCELLED'].includes(currentStatus);
  const currentStepNum = STAGE_ORDER[currentStatus] || 1;

  return (
    <div className="w-full py-6 px-4 glass-card rounded-2xl border border-slate-800 my-4 overflow-x-auto">
      {/* Special status alert if REOPENED or REJECTED */}
      {isSpecialState && (
        <div className="mb-6 p-3 rounded-xl flex items-center gap-3 text-sm font-medium border bg-opacity-20 animate-fade-in
          ${currentStatus === 'REOPENED' ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' :
            currentStatus === 'REJECTED' ? 'bg-red-950/40 border-red-500/40 text-red-300' :
            'bg-slate-900 border-slate-700 text-slate-400'}"
        >
          {currentStatus === 'REOPENED' && <RotateCcw className="w-5 h-5 text-rose-400 animate-spin" />}
          {currentStatus === 'REJECTED' && <XCircle className="w-5 h-5 text-red-400" />}
          {currentStatus === 'CANCELLED' && <AlertCircle className="w-5 h-5 text-slate-400" />}
          <div>
            <span className="font-bold uppercase tracking-wider">{currentStatus}: </span>
            <span>
              {currentStatus === 'REOPENED' && 'Citizen reopened this issue for further repair.'}
              {currentStatus === 'REJECTED' && 'This issue was reviewed and rejected by an administrator.'}
              {currentStatus === 'CANCELLED' && 'This issue was cancelled by the reporter.'}
            </span>
          </div>
        </div>
      )}

      {/* Main Timeline Rail */}
      <div className="min-w-[700px] flex items-center justify-between relative">
        {/* Background connector line */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-slate-800 -z-0 rounded-full" />
        
        {/* Active progress connector line */}
        <div
          className="absolute top-1/2 left-4 -translate-y-1/2 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 -z-0 rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(100, Math.max(0, ((currentStepNum - 1) / (MAIN_STAGES.length - 1)) * 100))}%`,
          }}
        />

        {MAIN_STAGES.map((stage, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStepNum || currentStatus === 'RESOLVED';
          const isCurrent = currentStatus === stage.key;
          const Icon = stage.icon;

          return (
            <div key={stage.key} className="flex flex-col items-center group relative z-10">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isCurrent
                    ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20 shadow-lg shadow-emerald-500/40 scale-110'
                    : isCompleted
                    ? 'bg-emerald-600/90 text-white shadow-md shadow-emerald-900/40'
                    : 'bg-slate-900 text-slate-500 border border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight mt-2 text-center whitespace-nowrap transition-colors ${
                  isCurrent
                    ? 'text-emerald-400 font-bold'
                    : isCompleted
                    ? 'text-slate-300'
                    : 'text-slate-500'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineVisualizer;
