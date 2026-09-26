import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const CATEGORIES = [
  'ALL',
  'Pothole',
  'Streetlight',
  'Garbage',
  'Water Leakage',
  'Drainage',
  'Footpath',
  'Road Damage',
  'Public Facility',
  'Other',
];

const STATUSES = [
  'ALL',
  'REPORTED',
  'UNDER_REVIEW',
  'APPROVED',
  'ASSIGNED',
  'ACCEPTED',
  'IN_PROGRESS',
  'COMPLETED',
  'VERIFICATION_PENDING',
  'RESOLVED',
  'REOPENED',
  'REJECTED',
];

const MyIssuesPage = () => {
  const [searchParams] = useSearchParams();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
  const [status, setStatus] = useState(searchParams.get('status') || 'ALL');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          myIssues: 'true',
          page: page.toString(),
          limit: '9',
          sortBy,
        });

        if (search) queryParams.set('search', search);
        if (category && category !== 'ALL') queryParams.set('category', category);
        if (status && status !== 'ALL') queryParams.set('status', status);

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
    };

    fetchIssues();
  }, [search, category, status, sortBy, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 transition-colors duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            My Reported Issues
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Track and manage all issues submitted by your account.
          </p>
        </div>

        <Link
          to="/report-issue"
          className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-900/30 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Report Issue
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, ID, address..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.filter((c) => c !== 'ALL').map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Statuses</option>
              {STATUSES.filter((s) => s !== 'ALL').map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-sky-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Highest Priority</option>
              <option value="status">Status Order</option>
            </select>
          </div>
        </div>
      </div>

      {/* Issue Content Area */}
      {loading ? (
        <LoadingSpinner size="lg" text="Fetching your reported issues..." />
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : issues.length === 0 ? (
        <EmptyState
          title="No Issues Match Your Filters"
          description="Try clearing your search query or selecting 'All' in category and status filters."
          onActionClick={() => {
            setSearch('');
            setCategory('ALL');
            setStatus('ALL');
            setSortBy('newest');
            setPage(1);
          }}
          actionText="Reset All Filters"
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {issues.map((issue) => (
              <Link
                key={issue._id}
                to={`/issues/${issue._id}`}
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

                  {issue.images && issue.images.length > 0 ? (
                    <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative">
                      <img
                        src={issue.images[0].url}
                        alt={issue.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] font-bold text-white uppercase backdrop-blur-sm">
                        {issue.category}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-20 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 flex items-center justify-center text-xs text-slate-500">
                      Category: {issue.category}
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

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Page {page} of {pagination.totalPages} ({pagination.total} total reports)
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

export default MyIssuesPage;
