import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  AlertTriangle,
  Users,
  BarChart3,
  ArrowRight,
  Compass,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CityDigitalTwin from '../../components/canvas/CityDigitalTwin';
import { useTheme } from '../../context/ThemeContext';

const AdminDashboard = () => {
  const { isDark } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTwin, setShowTwin] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load admin dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="xl" text="Compiling municipal digital twin analytics..." />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-rose-500">
        <p>{error || 'Failed to fetch dashboard data.'}</p>
      </div>
    );
  }

  const { summary, categoryStats, priorityStats, staffWorkload, recentIssues } = stats;

  const categoryChartData = (categoryStats || []).map((c) => ({
    name: c._id || 'Other',
    count: c.count,
  }));

  const priorityChartData = (priorityStats || []).map((p) => ({
    name: p._id,
    count: p.count,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
            Administrative Operations & Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Municipal Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Real-time infrastructure 3D city oversight, SLA tracking, and staff field deployment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTwin(!showTwin)}
            className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Compass className="w-4 h-4 text-sky-500" />
            {showTwin ? 'Hide 3D City' : 'Show 3D City'}
          </button>
          <Link
            to="/admin/issues"
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-900/30 transition-all flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            Manage All Issues
          </Link>
          <Link
            to="/admin/analytics"
            className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:text-sky-600 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Link>
        </div>
      </div>

      {/* 3D Smart City Visual Overview for Admin */}
      {showTwin && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Live Geospatial 3D City Model
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Interactive municipal field visualizer
            </span>
          </div>
          <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative bg-slate-950">
            <CityDigitalTwin
              mode="interactive"
              issues={recentIssues || []}
              height="440px"
              showControls={true}
            />
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Issues</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary.totalIssues}</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold uppercase">Open Queue</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary.openIssues}</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold uppercase">In Progress</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary.inProgressIssues}</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold uppercase">Pending Verification</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary.verificationPendingIssues}</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold uppercase">Resolved</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary.resolvedIssues}</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold uppercase">Reopened</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary.reopenedIssues}</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-red-400/40 bg-red-50 dark:bg-red-950/20 space-y-1">
          <span className="text-[11px] text-red-600 dark:text-red-400 font-semibold uppercase flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Overdue SLA
          </span>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.overdueIssues}</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Issues by Category
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Volume distribution</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke="#64748b" textAnchor="end" angle={-25} interval={0} height={40} fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                    color: isDark ? '#ffffff' : '#000000',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown Pie Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Issues by Priority Tier
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Severity split</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {priorityChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name === 'CRITICAL'
                          ? '#ef4444'
                          : entry.name === 'HIGH'
                          ? '#f59e0b'
                          : entry.name === 'MEDIUM'
                          ? '#3b82f6'
                          : '#10b981'
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                    color: isDark ? '#ffffff' : '#000000',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Staff Workload & Performance Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Field Staff Workload & Task Distribution</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Active assignments per department team</p>
          </div>
          <Link
            to="/admin/users?role=staff"
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            Manage Staff <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assigned (Pending)</th>
                <th className="py-3 px-4">In Progress</th>
                <th className="py-3 px-4">Completed / Verified</th>
                <th className="py-3 px-4">Total Load</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {staffWorkload && staffWorkload.length > 0 ? (
                staffWorkload.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {s.name}
                      <span className="block text-[10px] text-slate-500 font-normal">{s.email}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{s.department}</td>
                    <td className="py-3 px-4 font-bold text-sky-600 dark:text-sky-400">{s.assigned}</td>
                    <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">{s.inProgress}</td>
                    <td className="py-3 px-4 font-bold text-sky-600 dark:text-sky-400">{s.completed}</td>
                    <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">{s.total}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-500">
                    No staff members registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Issues Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            Latest Reported Issues
          </h3>
          <Link
            to="/admin/issues"
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            View All Issues <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reporter</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {recentIssues && recentIssues.length > 0 ? (
                recentIssues.map((issue) => (
                  <tr key={issue._id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-sky-600 dark:text-sky-400">
                      {issue.issueCode}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                      {issue.title}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{issue.category}</td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={issue.priority} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={issue.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{issue.reportedBy?.name || 'Citizen'}</td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/admin/issues/${issue._id}`}
                        className="text-sky-600 dark:text-sky-400 hover:underline font-semibold"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-slate-500">
                    No recent issues logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
