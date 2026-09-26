import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Phone,
  UserCheck,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SpotFixLogo } from '../../components/common/SpotFixLogo';

/**
 * Modernized Register / Create Account Page (Light Blue Theme)
 * - Clean, rounded premium authentication card with soft shadows
 * - Form fields: Full Name, E-mail, Password, Confirm Password, Phone (optional), Role selector
 * - Light Blue rounded gradient action button with smooth hover & press states
 * - Visual social authentication row & smooth redirect to /login
 * - Full light & dark theme compatibility
 * - Preserves existing API registration and state handling
 */
const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user',
    department: 'General Maintenance',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        phone: formData.phone.trim(),
        department: formData.department,
      });

      setLoading(false);

      if (res.success) {
        if (res.user?.role === 'admin') navigate('/admin');
        else if (res.user?.role === 'staff') navigate('/staff');
        else navigate('/dashboard');
      } else {
        setError(res.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.message || 'A network error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 relative transition-colors duration-500">
      {/* Soft Ambient Light Blue Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-sky-400/15 via-blue-400/10 to-indigo-400/10 blur-[120px] rounded-full pointer-events-none -z-0" />

      {/* Main Authentication Card */}
      <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xl space-y-6 relative z-10 transition-all duration-300">
        {/* Card Header & Brand */}
        <div className="flex flex-col items-center text-center space-y-2">
          <SpotFixLogo size="sm" showTagline={false} />

          <div className="pt-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Create Account
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              Join SpotFix to report, monitor, and resolve civic infrastructure issues in real time.
            </p>
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Full Name Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Full Name
            </label>
            <div className="relative group">
              <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-sky-500" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm shadow-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
              />
            </div>
          </div>

          {/* 2. E-mail Address Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              E-mail
            </label>
            <div className="relative group">
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-sky-500" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="E-mail"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm shadow-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
              />
            </div>
          </div>

          {/* 3. Password & Confirm Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-sky-500" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm shadow-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-sky-500" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm shadow-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Account Role Switcher */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'user' })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  formData.role === 'user'
                    ? 'bg-sky-500/15 border-sky-500 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Citizen / Student
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'staff' })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  formData.role === 'staff'
                    ? 'bg-sky-500/15 border-sky-500 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Field Staff
              </button>
            </div>
          </div>

          {/* Optional Staff Department Selector */}
          {formData.role === 'staff' && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="Electrical & Lighting">Electrical & Lighting</option>
                <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                <option value="Sanitation & Water Works">Sanitation & Water Works</option>
                <option value="Civil & Facilities">Civil & Facilities</option>
                <option value="General Maintenance">General Maintenance</option>
              </select>
            </div>
          )}

          {/* Register Action Button with Light Blue Gradient & Scale Effects */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-sky-600 hover:from-sky-400 hover:via-blue-400 hover:to-sky-500 active:scale-[0.98] text-white font-bold text-sm shadow-xl shadow-sky-900/25 transition-all duration-200 hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50 mt-3 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Create Account
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Social Authentication Row (Visual UI) */}
        <div className="pt-2">
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            <span className="absolute px-3 bg-[var(--bg-surface)] text-[10px] uppercase font-mono tracking-widest text-slate-400 dark:text-slate-500">
              Or register with
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mt-4">
            {/* Google */}
            <button
              type="button"
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/70 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
              title="Google Sign-In"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.8s.7 5.1 1.9 7.5l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                />
              </svg>
              <span className="text-[11px]">Google</span>
            </button>

            {/* Apple */}
            <button
              type="button"
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/70 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
              title="Apple Sign-In"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.6.69-1.12 1.83-.98 2.92 1.07.08 2.15-.55 2.79-1.32z" />
              </svg>
              <span className="text-[11px]">Apple</span>
            </button>

            {/* GitHub */}
            <button
              type="button"
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/70 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
              title="GitHub Sign-In"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span className="text-[11px]">GitHub</span>
            </button>
          </div>
        </div>

        {/* Login Redirect */}
        <div className="text-center text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-sky-600 dark:text-sky-400 hover:text-sky-500 font-bold hover:underline transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
