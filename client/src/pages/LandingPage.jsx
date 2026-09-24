import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  MapPin,
  Camera,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  Users,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated, user, role, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemoLogin = async (email, password, targetRoute) => {
    const res = await login(email, password);
    if (res.success) {
      navigate(targetRoute);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none -z-0" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none -z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider shadow-sm animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              Smart Municipal & Campus Issue Resolution
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Spot it. Track it.{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
                Fix it.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              <strong className="text-white">SPOTFIX</strong> is a full-stack smart issue reporting platform with role-based governance, AI duplicate detection, geospatial pin-point mapping, and photo verification audit trails.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {isAuthenticated ? (
                <Link
                  to={role === 'admin' ? '/admin' : role === 'staff' ? '/staff' : '/dashboard'}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-900/40 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  Enter Your Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/report-issue"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-900/40 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    Report an Issue Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-sm transition-all"
                  >
                    Sign In / Access Portal
                  </Link>
                </>
              )}
            </div>

            {/* Quick Demo Access Bar */}
            <div className="pt-8 border-t border-slate-800/80 mt-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                ⚡ 1-Click Demo Logins for Instant Testing
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <button
                  onClick={() => handleQuickDemoLogin('admin@spotfix.local', 'Admin@1234', '/admin')}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-all"
                >
                  👑 Login as Admin
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('staff.electrical@spotfix.local', 'Staff@1234', '/staff')}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-sky-500/30 text-xs font-medium text-sky-400 hover:bg-sky-500/10 transition-all"
                >
                  🛠️ Login as Electrical Staff
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('staff.roads@spotfix.local', 'Staff@1234', '/staff')}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-amber-500/30 text-xs font-medium text-amber-400 hover:bg-amber-500/10 transition-all"
                >
                  🛠️ Login as Roads Staff
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('citizen.rahul@spotfix.local', 'User@1234', '/dashboard')}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-purple-500/30 text-xs font-medium text-purple-400 hover:bg-purple-500/10 transition-all"
                >
                  👤 Login as Citizen (Rahul)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Engineered for Real-World Municipal Governance
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Beyond simple CRUD — structured state-machine transitions, SLA adherence, and tamper-resistant audit logs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl glass-card border border-slate-800 hover:border-emerald-500/40">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">AI Smart Assistant</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatic category classification, urgency priority suggestions, and explainable NLP duplicate detection within geospatial radiuses.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card border border-slate-800 hover:border-emerald-500/40">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Pin-Point Geospatial Maps</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Integrated OpenStreetMap & Leaflet mapping with single-tap GPS pinpointing, vicinity duplicate clustering, and field crew navigation.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card border border-slate-800 hover:border-emerald-500/40">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Before & After Photo Proof</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Staff must submit real-time completion evidence before marking tasks complete. Citizens verify resolution or reopen with feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9-Stage Workflow Blueprint */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Controlled 9-Stage Workflow Lifecycle
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Strict backend state machine prevents illegal transitions and ensures accountability.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
            {[
              { num: '01', title: 'REPORTED', desc: 'Citizen submits photo + GPS' },
              { num: '02', title: 'REVIEW', desc: 'Admin reviews validity' },
              { num: '03', title: 'APPROVED', desc: 'Priority formalized' },
              { num: '04', title: 'ASSIGNED', desc: 'Dispatched to staff' },
              { num: '05', title: 'ACCEPTED', desc: 'Staff claims task' },
              { num: '06', title: 'IN PROGRESS', desc: 'Field repair active' },
              { num: '07', title: 'COMPLETED', desc: 'Proof photo uploaded' },
              { num: '08', title: 'VERIFY', desc: 'Citizen review gate' },
              { num: '09', title: 'RESOLVED', desc: 'Official case closed' },
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-between"
              >
                <span className="text-[10px] font-mono font-bold text-emerald-400">{step.num}</span>
                <p className="text-xs font-bold text-slate-200 my-1">{step.title}</p>
                <p className="text-[10px] text-slate-400 leading-tight">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
