import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  ArrowRight,
  MapPin,
  Calendar,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import CityDigitalTwin from '../../components/canvas/CityDigitalTwin';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    pendingCount: 0,
    inProgressCount: 0,
    verificationCount: 0,
    resolvedCount: 0,
    overdueCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/staff/issues?limit=6');
        if (res.success) {
          setIssues(res.data || []);
          setMetrics(res.metrics || {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-300">
      {/* Welcome Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-sky-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
            Field Technician Workspace & Incident Map
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Welcome, {user?.name}! 🛠️
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Department: <strong className="text-slate-900 dark:text-slate-200">{user?.department || 'Field Maintenance'}</strong> • Inspect assignments, log progress, and submit completion proofs.
          </p>
        </div>

        <Link
          to="/staff/issues"
          className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-xl shadow-sky-900/40 transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <CheckSquare className="w-4 h-4" />
          View All Assigned Tasks
        </Link>
      </div>

      {/* Staff KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Assigned</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.total}</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold uppercase">Pending Acceptance</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.pendingCount}</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase">Active In Progress</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.inProgressCount}</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase">In Verification</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.verificationCount}</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold uppercase">Resolved</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.resolvedCount}</p>
        </div>
      </div>

      {/* 3D Smart City Digital Twin Field Visualizer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Field Assignment Incident Map
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Click any beacon to open repair task
          </span>
        </div>
        <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative bg-slate-950">
          <CityDigitalTwin
            mode="interactive"
            issues={issues}
            height="420px"
            showControls={true}
          />
        </div>
      </div>

      {/* Assigned Tasks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Assigned Priority Tasks</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tasks requiring immediate field inspection or resolution</p>
          </div>
          <Link
            to="/staff/issues"
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            View All Tasks <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" text="Loading assigned tasks..." />
        ) : issues.length === 0 ? (
          <EmptyState
            title="No Tasks Currently Assigned"
            description="You are caught up with all maintenance tasks in your department. New assigned jobs will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    </div>
  );
};

export default StaffDashboard;
