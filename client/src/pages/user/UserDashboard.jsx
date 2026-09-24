import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Clock,
  Hammer,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Layers,
  ArrowRight,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const UserDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserIssues = async () => {
      try {
        setLoading(true);
        const res = await api.get('/issues?myIssues=true&limit=6');
        if (res.success) {
          setIssues(res.data || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load your issues.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserIssues();
  }, []);

  // Compute metrics from issues
  const totalCount = issues.length;
  const openCount = issues.filter((i) =>
    ['REPORTED', 'UNDER_REVIEW', 'APPROVED', 'ASSIGNED'].includes(i.status)
  ).length;
  const inProgressCount = issues.filter((i) =>
    ['ACCEPTED', 'IN_PROGRESS'].includes(i.status)
  ).length;
  const verificationCount = issues.filter((i) => i.status === 'VERIFICATION_PENDING').length;
  const resolvedCount = issues.filter((i) => i.status === 'RESOLVED').length;
  const reopenedCount = issues.filter((i) => i.status === 'REOPENED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Citizen Action Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Hello, {user?.name || 'Citizen'}! 👋
          </h1>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
            Report local civic or campus problems, monitor repair status in real-time, and verify completed maintenance work.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <Link
            to="/report-issue"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-900/40 transition-all hover:scale-[1.02] flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Report New Issue
          </Link>
        </div>
      </div>

      {/* Verification Attention Banner */}
      {verificationCount > 0 && (
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {verificationCount} Issue(s) Awaiting Your Resolution Verification
              </h4>
              <p className="text-xs text-purple-300">
                Staff has completed repairs and uploaded completion proof photos. Please review and confirm.
              </p>
            </div>
          </div>
          <Link
            to="/my-issues?status=VERIFICATION_PENDING"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shrink-0 transition-all"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Reports</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{totalCount}</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Open / Review</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{openCount}</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">In Progress</span>
            <Hammer className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{inProgressCount}</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Verify Proof</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">{verificationCount}</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{resolvedCount}</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Reopened</span>
            <RotateCcw className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-white">{reopenedCount}</p>
        </div>
      </div>

      {/* Recent Reported Issues List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Your Recent Reports</h2>
            <p className="text-xs text-slate-400">Track current status and historical progression</p>
          </div>
          <Link
            to="/my-issues"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            View All My Issues <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" text="Loading your reported issues..." />
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : issues.length === 0 ? (
          <EmptyState
            title="No Issues Reported Yet"
            description="Notice a broken streetlight, pothole, or overflowing garbage bin? Report it right away to alert maintenance staff."
            actionLink="/report-issue"
            actionText="Report Your First Issue"
            actionIcon={PlusCircle}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.map((issue) => (
              <Link
                key={issue._id}
                to={`/issues/${issue._id}`}
                className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/40 flex flex-col justify-between space-y-4 group transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 font-mono tracking-wider">
                      {issue.issueCode}
                    </span>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={issue.priority} size="sm" />
                      <StatusBadge status={issue.status} size="sm" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                      {issue.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {issue.description}
                    </p>
                  </div>

                  {issue.images && issue.images.length > 0 && (
                    <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative">
                      <img
                        src={issue.images[0].url}
                        alt={issue.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-bold text-slate-300 uppercase">
                        {issue.category}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 truncate max-w-[180px]">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
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

export default UserDashboard;
