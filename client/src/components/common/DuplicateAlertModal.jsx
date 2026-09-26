import React from 'react';
import { AlertTriangle, ExternalLink, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const DuplicateAlertModal = ({
  isOpen,
  duplicates = [],
  onSubmitAnyway,
  onClose,
}) => {
  if (!isOpen || duplicates.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="glass-panel max-w-lg w-full rounded-2xl border border-amber-500/30 p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Potential Duplicate Issue Detected
              </h3>
              <p className="text-xs text-slate-400">
                AI found {duplicates.length} similar active problem(s) in this exact area.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duplicates List */}
        <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
          {duplicates.map((item, idx) => {
            const issue = item.issue;
            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 tracking-wide font-mono">
                    {issue.issueCode}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold uppercase">
                      {item.similarityLevel} Similarity ({Math.round(item.similarityScore * 100)}%)
                    </span>
                    <StatusBadge status={issue.status} size="sm" />
                  </div>
                </div>

                <p className="text-xs font-semibold text-slate-200 line-clamp-1">{issue.title}</p>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {issue.description}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                  <span className="text-slate-500 font-medium">
                    📍 Distance: <strong className="text-slate-300">{item.distanceMeters} meters away</strong>
                  </span>
                  <Link
                    to={`/issues/${issue._id}`}
                    target="_blank"
                    className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    View Existing Report <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Foot Actions */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Review Details First
          </button>
          <button
            type="button"
            onClick={onSubmitAnyway}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/40 transition-all flex items-center justify-center gap-2"
          >
            Submit Anyway (New Report)
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateAlertModal;
