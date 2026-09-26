import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Camera,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronDown,
  Layers,
  Zap,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SpotFixCityExperience from '../components/canvas/SpotFixCityExperience';
import api from '../services/api';

const SCENES_META = [
  { id: 'scene-city', label: '01 City', title: 'Smart Infrastructure' },
  { id: 'scene-problem', label: '02 Problem', title: 'The Civic Challenge' },
  { id: 'scene-report', label: '03 Report', title: 'Instant AI Reporting' },
  { id: 'scene-track', label: '04 Track', title: 'Transparent Tracking' },
  { id: 'scene-fix', label: '05 Fix', title: 'Verified Resolution' },
  { id: 'scene-smart-city', label: '06 Vision', title: 'Smart City Together' },
];

const LandingPage = () => {
  const { isAuthenticated, role, login } = useAuth();
  const navigate = useNavigate();

  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [liveIssues, setLiveIssues] = useState([]);

  const containerRef = useRef(null);

  // Fetch recent public issues to sync with markers if authenticated
  useEffect(() => {
    const fetchRecentIssues = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await api.get('/issues?limit=8');
        if (res.success && res.data) {
          setLiveIssues(res.data);
        }
      } catch {
        // silent fallback
      }
    };
    fetchRecentIssues();
  }, [isAuthenticated]);

  // Global scroll listener for 3D Camera keyframe interpolation & active scene detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;

      const progress = Math.max(0, Math.min(1, scrollY / totalHeight));
      setScrollProgress(progress);

      // Determine active scene (0 to 5)
      const sceneIndex = Math.min(5, Math.floor(progress * 6 + 0.15));
      setActiveSceneIndex(sceneIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToScene = (index) => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = (index / 5) * totalHeight;
    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });
  };

  const handleQuickDemoLogin = async (email, password, targetRoute) => {
    const res = await login(email, password);
    if (res.success) {
      navigate(targetRoute);
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-500">
      {/* ========================================================================= */}
      {/* 1. FIXED 3D SMART CITY BACKGROUND CANVAS                                 */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 z-0 pointer-events-none sm:pointer-events-auto">
        <SpotFixCityExperience
          scrollProgress={scrollProgress}
          activeScene={activeSceneIndex}
          onSelectHotspot={scrollToScene}
        />
      </div>

      {/* Background Soft Vignette Overlays for Maximum Foreground Text Readability */}
      <div className="fixed inset-0 pointer-events-none z-[1] bg-gradient-to-b from-[var(--bg-primary)]/40 via-transparent to-[var(--bg-primary)]/80" />
      <div className="fixed inset-0 pointer-events-none z-[1] bg-radial-gradient from-transparent via-transparent to-[var(--bg-primary)]/50" />

      {/* ========================================================================= */}
      {/* 2. FLOATING SIDE SCENE NAVIGATION HUD (KAGE-INSPIRED)                     */}
      {/* ========================================================================= */}
      <aside className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-3.5 p-3 rounded-2xl glass-panel shadow-2xl backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="text-[9px] uppercase tracking-widest font-mono text-slate-600 dark:text-slate-300 px-2 py-0.5 border-b border-slate-200 dark:border-slate-800">
          City Story
        </div>
        {SCENES_META.map((scene, idx) => {
          const isActive = activeSceneIndex === idx;
          return (
            <button
              key={scene.id}
              onClick={() => scrollToScene(idx)}
              className={`group flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-mono transition-all text-left ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <span className="font-bold">{scene.label}</span>
              <span className="text-[10px] text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white hidden xl:inline transition-colors">
                {scene.title}
              </span>
              <span
                className={`w-2 h-2 rounded-full transition-all ${
                  isActive
                    ? 'bg-emerald-500 ring-4 ring-emerald-500/20 scale-110'
                    : 'bg-slate-400 dark:bg-slate-600 group-hover:bg-slate-500'
                }`}
              />
            </button>
          );
        })}
      </aside>

      {/* ========================================================================= */}
      {/* 3. SCROLL-DRIVEN 6 NARRATIVE STORYTELLING SECTIONS                        */}
      {/* ========================================================================= */}
      <div className="relative z-10">
        {/* ----------------------------------------------------------------------- */}
        {/* SCENE 1: THE CITY (INTRODUCTION)                                        */}
        {/* ----------------------------------------------------------------------- */}
        <section id="scene-city" className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 pt-16 pb-20 max-w-7xl mx-auto">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              Smart Civic Infrastructure Platform
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
              Spot it. Track it.{' '}
              <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-500 bg-clip-text text-transparent">
                Fix it.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-800 dark:text-slate-100 max-w-2xl leading-relaxed font-normal">
              <strong className="text-slate-900 dark:text-white font-bold">SpotFix</strong> is a next-generation civic governance ecosystem connecting citizens with municipal departments to rapidly report, track, and resolve neighborhood infrastructure hazards in real time.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              {isAuthenticated ? (
                <Link
                  to={role === 'admin' ? '/admin' : role === 'staff' ? '/staff' : '/dashboard'}
                  className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-900/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  Go to Dashboard ({role})
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/report-issue"
                    className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-900/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    Report an Issue
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-3.5 rounded-xl glass-panel hover:bg-slate-200/80 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-bold text-sm transition-all text-center"
                  >
                    Sign In to Portal
                  </Link>
                </>
              )}
            </div>

            {/* Quick Demo Access Bar */}
            <div className="pt-6 border-t border-slate-200/70 dark:border-slate-800/70">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-2.5">
                ⚡ 1-Click Demo Logins for Instant Testing:
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleQuickDemoLogin('admin@spotfix.local', 'Admin@1234', '/admin')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-900/80 border border-emerald-500/40 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                >
                  👑 Admin
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('staff.roads@spotfix.local', 'Staff@1234', '/staff')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-900/80 border border-amber-500/40 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 transition-all"
                >
                  🛠️ Roads Staff
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('staff.electrical@spotfix.local', 'Staff@1234', '/staff')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-900/80 border border-sky-500/40 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:bg-sky-500/10 transition-all"
                >
                  ⚡ Electrical Staff
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('citizen.rahul@spotfix.local', 'User@1234', '/dashboard')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-900/80 border border-purple-500/40 text-xs font-semibold text-purple-700 dark:text-purple-400 hover:bg-purple-500/10 transition-all"
                >
                  👤 Citizen (Rahul)
                </button>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="pt-4 flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300 animate-bounce">
              <ChevronDown className="w-4 h-4" />
              <span>Scroll to explore the SpotFix journey</span>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------------- */}
        {/* SCENE 2: THE PROBLEM (DEFECTS IN URBAN ENVIRONMENT)                     */}
        {/* ----------------------------------------------------------------------- */}
        <section id="scene-problem" className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-20 max-w-7xl mx-auto">
          <div className="max-w-2xl ml-auto space-y-6 text-right sm:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <AlertTriangle className="w-3.5 h-3.5" />
              Phase 01 // The Civic Challenge
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Problems exist around us, but many go unnoticed.
            </h2>

            <p className="text-base sm:text-lg text-slate-800 dark:text-slate-100 leading-relaxed font-normal">
              Deep asphalt potholes, dark unlit streetlights, overflowing waste bins, and broken drainage pipes compromise commuter safety, public health, and city livability.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 rounded-xl glass-card border border-rose-500/20 text-left">
                <div className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  Potholes & Road Cracks
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200">
                  Vehicle damage and severe accident hazards on high-speed urban thoroughfares.
                </p>
              </div>

              <div className="p-4 rounded-xl glass-card border border-amber-500/20 text-left">
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Streetlight Outages
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200">
                  Unlit sidewalks and pedestrian crossings reducing nighttime security and visibility.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------------- */}
        {/* SCENE 3: THE REPORT (INSTANT AI GEOTAGGED REPORTING)                    */}
        {/* ----------------------------------------------------------------------- */}
        <section id="scene-report" className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-20 max-w-7xl mx-auto">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Camera className="w-3.5 h-3.5" />
              Phase 02 // Instant AI Reporting
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Citizen → Report → Location
            </h2>

            <p className="text-base sm:text-lg text-slate-800 dark:text-slate-100 leading-relaxed font-normal">
              Snap a photo in under 10 seconds. SpotFix’s integrated on-device AI classifies defect categories, suggests urgency priorities, and attaches precision GPS telemetry automatically.
            </p>

            <div className="p-5 rounded-2xl glass-card border border-sky-500/30 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">AI ANALYSIS HUD</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  98.4% Confidence
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 uppercase font-semibold block">Detected Category</span>
                  <span className="font-bold text-slate-900 dark:text-white">Road Pothole (PTH-204)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 uppercase font-semibold block">Duplicate Shield</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Zero duplicate match</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 uppercase font-semibold block">Suggested Priority</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">HIGH (Safety Risk)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 uppercase font-semibold block">Geotag Anchor</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">12.9716° N, 77.5946° E</span>
                </div>
              </div>
            </div>

            <div>
              <Link
                to="/report-issue"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-900/30 transition-all hover:scale-105"
              >
                Try the AI Reporter Now
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------------- */}
        {/* SCENE 4: THE TRACK (TRANSPARENT SLA & MULTI-ISSUE DISPATCH)              */}
        {/* ----------------------------------------------------------------------- */}
        <section id="scene-track" className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-20 max-w-7xl mx-auto">
          <div className="max-w-2xl ml-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Clock className="w-3.5 h-3.5" />
              Phase 03 // Transparent Governance
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Transparent Real-Time Tracking
            </h2>

            <p className="text-base sm:text-lg text-slate-800 dark:text-slate-100 leading-relaxed font-normal">
              No lost complaints or administrative black boxes. Every ticket moves through an immutable 9-stage state machine with SLA countdowns, staff assignment notifications, and live status logs.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-xl glass-card text-center">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">94.8%</span>
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-1">SLA Adherence</p>
              </div>
              <div className="p-4 rounded-xl glass-card text-center">
                <span className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">18.4h</span>
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-1">Avg Resolution</p>
              </div>
              <div className="p-4 rounded-xl glass-card text-center">
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">100%</span>
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-1">Audit Trail</p>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------------- */}
        {/* SCENE 5: THE FIX (VERIFIED RESOLUTION & BEFORE/AFTER AUDIT)             */}
        {/* ----------------------------------------------------------------------- */}
        <section id="scene-fix" className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-20 max-w-7xl mx-auto">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Phase 04 // Verified Completion
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Before & After Photo Verification
            </h2>

            <p className="text-base sm:text-lg text-slate-800 dark:text-slate-100 leading-relaxed font-normal">
              Field crews cannot close tasks without uploading on-site geotagged proof. Citizens receive immediate notification to review the repaired state or reopen with one tap if unsatisfactory.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl glass-card border-l-4 border-rose-500">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  BEFORE REPAIR
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">Deep Asphalt Crater Defect</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">Reported by Citizen at 08:30 AM</p>
              </div>

              <div className="p-4 rounded-xl glass-card border-l-4 border-emerald-500">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  AFTER REPAIR
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">Smooth Sealed Road Surface</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">Verified by Field Staff at 04:15 PM</p>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------------- */}
        {/* SCENE 6: SMART CITY (THE FINAL VISION & ECOSYSTEM)                      */}
        {/* ----------------------------------------------------------------------- */}
        <section id="scene-smart-city" className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-24 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <ShieldCheck className="w-4 h-4" />
              The SpotFix Vision
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Citizens + Authorities + Technology
            </h2>

            <p className="text-base sm:text-lg text-slate-800 dark:text-slate-100 max-w-2xl mx-auto leading-relaxed font-normal">
              A collaborative platform designed to build safer, cleaner, and resilient cities. Join SpotFix today to make a tangible impact in your neighborhood.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-2xl shadow-emerald-900/40 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                Get Started as a Citizen
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm transition-all"
              >
                Access Municipal Portal
              </Link>
            </div>
          </div>

          {/* 9-Stage Workflow Blueprint Reference Grid */}
          <div className="mt-20 pt-12 border-t border-slate-200/80 dark:border-slate-800/80">
            <div className="text-center max-w-xl mx-auto mb-8">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Controlled 9-Stage Municipal Lifecycle
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
                Enforced by backend state machines to guarantee transparent accountability.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
              {[
                { num: '01', title: 'REPORTED', desc: 'Citizen photo + GPS' },
                { num: '02', title: 'REVIEW', desc: 'Admin validity check' },
                { num: '03', title: 'APPROVED', desc: 'Priority formalized' },
                { num: '04', title: 'ASSIGNED', desc: 'Dispatched to staff' },
                { num: '05', title: 'ACCEPTED', desc: 'Staff accepts job' },
                { num: '06', title: 'IN PROGRESS', desc: 'Field repair active' },
                { num: '07', title: 'COMPLETED', desc: 'Proof photo uploaded' },
                { num: '08', title: 'VERIFY', desc: 'Citizen review gate' },
                { num: '09', title: 'RESOLVED', desc: 'Case sealed & logged' },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl glass-panel text-center flex flex-col items-center justify-between border border-slate-200/60 dark:border-slate-800/60"
                >
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">{step.num}</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 my-1">{step.title}</p>
                  <p className="text-[10px] text-slate-700 dark:text-slate-300 leading-tight font-medium">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
