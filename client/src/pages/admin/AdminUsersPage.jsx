import React, { useState, useEffect } from 'react';
import { Search, UserCheck, Shield, User, AlertCircle, Edit, Check, X } from 'lucide-react';
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

  const fetchUsers = async () => {
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
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, search, page]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          User Directory & RBAC
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Manage Users, Staff & Admins
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Supervise user permissions, assign field departments, and inspect account activity.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, department..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">All Roles</option>
          <option value="user">Citizens (user)</option>
          <option value="staff">Field Staff (staff)</option>
          <option value="admin">Administrators (admin)</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" text="Loading user database..." />
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Department / Group</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => {
                  const isEditing = editingUserId === u._id;
                  return (
                    <tr key={u._id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span>{u.name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3.5 px-4 text-slate-400">{u.phone || '—'}</td>
                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white"
                          >
                            <option value="user">user</option>
                            <option value="staff">staff</option>
                            <option value="admin">admin</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : u.role === 'staff'
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {u.role}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {isEditing && editRole === 'staff' ? (
                          <input
                            type="text"
                            value={editDepartment}
                            onChange={(e) => setEditDepartment(e.target.value)}
                            className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white"
                          />
                        ) : (
                          u.department || '—'
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSaveEdit(u._id)}
                              disabled={editLoading}
                              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
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
      )}
    </div>
  );
};

export default AdminUsersPage;
