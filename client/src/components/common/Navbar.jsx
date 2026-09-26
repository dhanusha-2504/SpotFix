import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  Bell,
  User as UserIcon,
  LogOut,
  PlusCircle,
  LayoutDashboard,
  Layers,
  Users,
  BarChart3,
  CheckSquare,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SpotFixLogo } from './SpotFixLogo';
import { ThemeToggle } from './ThemeToggle';
import api from '../../services/api';

const Navbar = () => {
  const { user, isAuthenticated, logout, role } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Fetch notifications periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications?limit=5');
        if (res.success) {
          setNotifications(res.data || []);
          setUnreadCount(res.unreadCount || 0);
        }
      } catch {
        // silent fail on polling
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // 20s poll
    return () => clearInterval(interval);
  }, [isAuthenticated, location.pathname]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notifId, link) => {
    try {
      await api.put(`/notifications/${notifId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      setNotifDropdownOpen(false);
      if (link) navigate(link);
    } catch {
      // ignore read error
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link
              to={
                isAuthenticated
                  ? role === 'admin'
                    ? '/admin'
                    : role === 'staff'
                    ? '/staff'
                    : '/dashboard'
                  : '/'
              }
              className="flex items-center gap-3 group transition-transform hover:scale-[1.02]"
            >
              <SpotFixLogo size="sm" showTagline={true} />
            </Link>

            {/* Desktop Navigation Links */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-1">
                {role === 'user' && (
                  <>
                    <Link
                      to="/dashboard"
                      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        isActive('/dashboard')
                          ? 'bg-slate-200 dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/report-issue"
                      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        isActive('/report-issue')
                          ? 'bg-sky-600 text-white font-semibold shadow-md shadow-sky-600/30'
                          : 'text-sky-600 dark:text-sky-400 hover:bg-sky-500/10'
                      }`}
                    >
                      <PlusCircle className="w-4 h-4" />
                      Report Issue
                    </Link>
                    <Link
                      to="/my-issues"
                      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        isActive('/my-issues')
                          ? 'bg-slate-200 dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      My Issues
                    </Link>
                  </>
                )}

                {role === 'admin' && (
                  <>
                    <Link
                      to="/admin"
                      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        isActive('/admin')
                          ? 'bg-slate-200 dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/issues"
                      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        isActive('/admin/issues')
                          ? 'bg-slate-200 dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      All Issues
                    </Link>
                    <Link
                      to="/admin/users"
                      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        isActive('/admin/users')
                          ? 'bg-slate-200 dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      Staff & Users
                    </Link>
                    <Link
                      to="/admin/analytics"
                      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        isActive('/admin/analytics')
                          ? 'bg-slate-200 dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </Link>
                  </>
                )}

                {role === 'staff' && (
                  <>
                    <Link
                      to="/staff"
                      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        isActive('/staff')
                          ? 'bg-slate-200 dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/staff/issues"
                      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        isActive('/staff/issues')
                          ? 'bg-slate-200 dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <CheckSquare className="w-4 h-4" />
                      Assigned Tasks
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Animated AM / PM Sun–Moon Theme Toggle */}
            <ThemeToggle />

            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-lg shadow-sky-900/30 transition-all hover:scale-[1.02]"
                >
                  Register
                </Link>
              </div>
            ) : (
              <>
                {/* Notification Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="relative p-2.5 rounded-xl bg-slate-200/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-slate-800 transition-all"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sky-500 text-[10px] font-bold text-slate-950 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</span>
                        </div>
                        <Link
                          to="/notifications"
                          onClick={() => setNotifDropdownOpen(false)}
                          className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-medium"
                        >
                          View All
                        </Link>
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-200/50 dark:divide-slate-800/50">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-500">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => handleMarkAsRead(n._id, n.link)}
                              className={`p-3.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                                !n.isRead ? 'bg-sky-50 dark:bg-sky-950/20' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">{n.title}</p>
                                {!n.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0 mt-1"></span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-500 mt-1.5 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 hover:bg-slate-300 dark:hover:bg-slate-800 transition-all text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold text-xs">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">
                        {user?.name}
                      </p>
                      <p className="text-[10px] text-sky-600 dark:text-sky-400 uppercase font-semibold tracking-wider">
                        {role}
                      </p>
                    </div>
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 shadow-2xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                        <span className="inline-block mt-1.5 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                          {role} role
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          My Profile
                        </Link>
                        <Link
                          to="/notifications"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                        >
                          <Bell className="w-4 h-4 text-slate-400" />
                          Notifications
                        </Link>
                      </div>

                      <div className="border-t border-slate-200 dark:border-slate-800/80 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
            {role === 'user' && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Dashboard
                </Link>
                <Link
                  to="/report-issue"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-sky-600 dark:text-sky-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  + Report Issue
                </Link>
                <Link
                  to="/my-issues"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  My Reported Issues
                </Link>
              </>
            )}

            {role === 'admin' && (
              <>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Admin Dashboard
                </Link>
                <Link
                  to="/admin/issues"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  All Issues & Workflow
                </Link>
                <Link
                  to="/admin/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  User & Staff Directory
                </Link>
                <Link
                  to="/admin/analytics"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Analytics & SLA Reports
                </Link>
              </>
            )}

            {role === 'staff' && (
              <>
                <Link
                  to="/staff"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Staff Dashboard
                </Link>
                <Link
                  to="/staff/issues"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Assigned Issues & Proofs
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
