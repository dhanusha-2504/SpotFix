import React from 'react';
import { Inbox, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no records matching your criteria at this moment.',
  actionLink,
  actionText,
  actionIcon: ActionIcon = PlusCircle,
  onActionClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center glass-card rounded-2xl border border-dashed border-slate-800 my-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-slate-700/50 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
        <Icon className="w-8 h-8 opacity-80" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-1.5">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">{description}</p>
      {actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-900/30 hover:scale-[1.02]"
        >
          {ActionIcon && <ActionIcon className="w-4 h-4" />}
          {actionText}
        </Link>
      )}
      {onActionClick && (
        <button
          onClick={onActionClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-900/30 hover:scale-[1.02]"
        >
          {ActionIcon && <ActionIcon className="w-4 h-4" />}
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
