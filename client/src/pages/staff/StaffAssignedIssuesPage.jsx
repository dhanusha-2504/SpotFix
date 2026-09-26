import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, MapPin } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const StaffAssignedIssuesPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchStaffIssues = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({ limit: '30' });
      if (statusFilter !== 'ALL') query.set('status', statusFilter);
      if (search) query.set('search', search);

      const res = await api.get(`/staff/issues?${query.toString()}`);
      if (res.success) {
        setIssues(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchStaffIssues();
  }, [fetchStaffIssues]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 transition-colors duration-300">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
          Field Task Registry
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Assigned Repair Work
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Review repair specifications, acknowledge dispatch, and upload completion proofs.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assigned tickets..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-sky-500"
        >
          <option value="ALL">All Assigned Statuses</option>
          <option value="ACTIVE">Active (Assigned, Accepted, In Progress, Reopened)</option>
          <option value="ASSIGNED">Pending Acceptance (ASSIGNED)</option>
          <option value="ACCEPTED">Accepted (Queued)</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="VERIFICATION_PENDING">Verification Pending</option>
          <option value="RESOLVED">Resolved & Closed</option>
          <option value="REOPENED">Reopened</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" text="Loading task board..." />
      ) : issues.length === 0 ? (
        <EmptyState
          title="No Matching Tasks Found"
          description="Try selecting another filter or searching with different keywords."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {issues.map((issue) => (
            <Link
              key={issue._id}
              to={`/staff/issues/${issue._id}`}
              className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-sky-500/40 flex flex-col justify-between space-y-4 group transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 font-mono tracking-wider">
                    {issue.issueCode}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <PriorityBadge priority={issue.priority} size="sm" />
                    <StatusBadge status={issue.status} size="sm" />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors line-clamp-1">
                    {issue.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {issue.description}
                  </p>
                </div>

                {issue.images && issue.images.length > 0 && (
                  <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative">
                    <img
                      src={issue.images[0].url}
                      alt={issue.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] font-bold text-white uppercase backdrop-blur-sm">
                      {issue.category}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 truncate max-w-[170px]">
                  <MapPin className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 shrink-0" />
                  {issue.location?.address || 'Pinned on map'}
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  <Calendar className="w-3 h-3" />
                  {new Date(issue.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffAssignedIssuesPage;
