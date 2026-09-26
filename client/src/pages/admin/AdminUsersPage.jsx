import React, { useState, useEffect, useCallback } from 'react';
import { Search, AlertCircle, Edit, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  // Edit User State
  const [editingUserId, setEditingUserId] = useState(null);
  const [editRole, setEditRole] = useState('user');
  const [editDepartment, setEditDepartment] = useState('General Maintenance');
  const [editLoading, setEditLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({ page: page.toString(), limit: '15' });
      if (roleFilter !== 'ALL') query.set('role', roleFilter);
      if (search) query.set('search', search);

      const res = await api.get(`/admin/users?${query.toString()}`);
      if (res.success) {
        setUsers(res.data || []);
        setPagination(res.pagination || { totalPages: 1, total: 0 });
      }
    } catch (err) {
      setError(err.message || 'Failed to load user directory.');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStartEdit = (u) => {
    setEditingUserId(u._id);
    setEditRole(u.role);
    setEditDepartment(u.department || 'General Maintenance');
  };

  const handleSaveEdit = async (uId) => {
    setEditLoading(true);
    try {
      const res = await api.put(`/admin/users/${uId}`, {
        role: editRole,
        department: editDepartment,
      });
      if (res.success) {
        setUsers(users.map((u) => (u._id === uId ? { ...u, role: editRole, department: editDepartment } : u)));
        setEditingUserId(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to update user.');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 transition-colors duration-300">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
          User Directory & RBAC
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Manage Users, Staff & Admins
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Supervise user permissions, assign field departments, and inspect account activity.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, department..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-sky-500"
        >
          <option value="ALL">All Roles</option>
          <option value="user">Citizens (Users)</option>
          <option value="staff">Field Staff</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" text="Loading user directory..." />
      ) : (
        <div className="space-y-4">
          <div className="glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Joined Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                  {users.map((u) => {
                    const isEditing = editingUserId === u._id;
                    return (
                      <tr key={u._id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">{u.name}</div>
                          <div className="text-[11px] text-slate-500">{u.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            <select
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value)}
                              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                            >
                              <option value="user">User</option>
                              <option value="staff">Staff</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                u.role === 'admin'
                                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                                  : u.role === 'staff'
                                  ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
                                  : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
                              }`}
                            >
                              {u.role}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {isEditing && editRole === 'staff' ? (
                            <select
                              value={editDepartment}
                              onChange={(e) => setEditDepartment(e.target.value)}
                              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                            >
                              <option value="Electrical & Lighting">Electrical & Lighting</option>
                              <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                              <option value="Sanitation & Water Works">Sanitation & Water Works</option>
                              <option value="Civil & Facilities">Civil & Facilities</option>
                              <option value="General Maintenance">General Maintenance</option>
                            </select>
                          ) : (
                            <span className="text-slate-600 dark:text-slate-300">{u.department || '—'}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{u.phone || '—'}</td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSaveEdit(u._id)}
                                disabled={editLoading}
                                className="p-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingUserId(null)}
                                className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartEdit(u)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Edit Role"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Page {page} of {pagination.totalPages} ({pagination.total} total accounts)
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

export default AdminUsersPage;
