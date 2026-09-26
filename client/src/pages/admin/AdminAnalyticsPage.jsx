import React, { useState, useEffect } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';

const AdminAnalyticsPage = () => {
  const { isDark } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="xl" text="Analyzing resolution trends & SLA compliance..." />
      </div>
    );
  }

  const { summary, issuesOverTime } = stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-300">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
          Analytics & Performance Intelligence
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          SLA Compliance & Resolution Insights
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Monitor municipal resolution velocity, team workloads, and recurring problem zones.
        </p>
      </div>

      {/* SLA Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Average Resolution Time</span>
            <Clock className="w-5 h-5 text-sky-500 dark:text-sky-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {summary.avgResolutionHours} <span className="text-base text-slate-500 dark:text-slate-400 font-medium">Hours</span>
          </p>
          <p className="text-[11px] text-sky-600 dark:text-sky-400">Within the 48-hour municipal SLA target</p>
        </div>

        <div className="p-6 rounded-3xl glass-card border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Resolution Success Rate</span>
            <CheckCircle2 className="w-5 h-5 text-sky- dark:text-sky-" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {summary.totalIssues > 0 ? Math.round((summary.resolvedIssues / summary.totalIssues) * 100) : 0}%
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Total resolved vs total reported tickets</p>
        </div>

        <div className="p-6 rounded-3xl glass-card border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-950/20 space-y-2">
          <div className="flex items-center justify-between text-red-600 dark:text-red-400">
            <span className="text-xs font-bold uppercase tracking-wider">Overdue Issues</span>
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-3xl font-extrabold text-red-600 dark:text-red-400">{summary.overdueIssues}</p>
          <p className="text-[11px] text-red-600 dark:text-red-300">Requires immediate supervisor escalation</p>
        </div>
      </div>

      {/* 7-Day Inflow Trend Line Chart */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            Issue Submission Trend (Last 7 Days)
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Daily ticket inflow</span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={issuesOverTime || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
              <XAxis dataKey="_id" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#cbd5e1',
                  color: isDark ? '#ffffff' : '#000000',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
