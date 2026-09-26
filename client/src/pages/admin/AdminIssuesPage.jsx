import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const CATEGORIES = ['ALL', 'Pothole', 'Streetlight', 'Garbage', 'Water Leakage', 'Drainage', 'Footpath', 'Road Damage', 'Public Facility', 'Other'];
const STATUSES = ['ALL', 'REPORTED', 'UNDER_REVIEW', 'APPROVED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'VERIFICATION_PENDING', 'RESOLVED', 'REOPENED', 'REJECTED'];
const PRIORITIES = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const AdminIssuesPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [sortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy,
      });

      if (search) queryParams.set('search', search);
      if (category && category !== 'ALL') queryParams.set('category', category);
      if (status && status !== 'ALL') queryParams.set('status', status);
      if (priority && priority !== 'ALL') queryParams.set('priority', priority);

      const res = await api.get(`/issues?${queryParams.toString()}`);
      if (res.success) {
        setIssues(res.data || []);
        setPagination(res.pagination || { totalPages: 1, total: 0 });
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch issues.');
    } finally {
      setLoading(false);
    }
  }, [search, category, status, priority, sortBy, page]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
            Administrative Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Civic Issues Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Audit, prioritize, and dispatch maintenance crews for all reported civic tickets.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Panel */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, description, code, location..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.filter((c) => c !== 'ALL').map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Statuses</option>
            {STATUSES.filter((s) => s !== 'ALL').map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Priorities</option>
            {PRIORITIES.filter((p) => p !== 'ALL').map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Issues Table */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading issue registry..." />
      ) : issues.length === 0 ? (
        <EmptyState
          title="No Issues Match Criteria"
          description="Try resetting your filters or search keywords."
          actionText="Clear Filters"
          onActionClick={() => {
            setSearch('');
            setCategory('ALL');
            setStatus('ALL');
            setPriority('ALL');
            setPage(1);
          }}
        />
      ) : (
        <div className="glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Title & Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Reporter</th>
                  <th className="py-3.5 px-4">Assigned Staff</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                {issues.map((issue) => (
                  <tr key={issue._id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-sky-600 dark:text-sky-400">
                      {issue.issueCode}
                    </td>
                    <td className="py-3 px-4 max-w-[220px]">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{issue.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{issue.location?.address}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">{issue.category}</td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={issue.priority} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={issue.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {issue.reportedBy?.name || 'Citizen'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {issue.assignedTo ? (
                        <span className="font-semibold text-sky-600 dark:text-sky-400">
                          {issue.assignedTo.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/issues/${issue._id}`}
                        className="px-3 py-1.5 rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300 hover:bg-sky-600 hover:text-white font-bold transition-all"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Showing page {page} of {pagination.totalPages} ({pagination.total} total tickets)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="p-2 rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminIssuesPage;
