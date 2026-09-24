import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Sparkles,
  MapPin,
  Camera,
  AlertTriangle,
  ArrowRight,
  Loader2,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import api from '../../services/api';
import LeafletMapPicker from '../../components/common/LeafletMapPicker';
import ImageUploadZone from '../../components/common/ImageUploadZone';
import DuplicateAlertModal from '../../components/common/DuplicateAlertModal';

const CATEGORIES = [
  'Pothole',
  'Streetlight',
  'Garbage',
  'Water Leakage',
  'Drainage',
  'Footpath',
  'Road Damage',
  'Public Facility',
  'Other',
];

const ReportIssuePage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [userSuggestedPriority, setUserSuggestedPriority] = useState('MEDIUM');
  const [latitude, setLatitude] = useState(12.9716);
  const [longitude, setLongitude] = useState(77.5946);
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [images, setImages] = useState([]);

  // AI states
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Duplicate states
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [detectedDuplicates, setDetectedDuplicates] = useState([]);
  const [isDuplicateConfirmed, setIsDuplicateConfirmed] = useState(false);

  // Form submission states
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Debounced AI category & priority suggestion
  useEffect(() => {
    if (!title && !description) {
      setAiSuggestions(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setAiLoading(true);
        const res = await api.post('/ai/suggest', { title, description });
        if (res.success && res.data) {
          setAiSuggestions(res.data);
          // If user hasn't selected category manually, pre-fill with AI suggestion
          if (!category && res.data.category && res.data.category !== 'Other') {
            setCategory(res.data.category);
          }
        }
      } catch (err) {
        // silent fail on AI helper
      } finally {
        setAiLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [title, description]);

  const handleLocationChange = (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSubmit = async (e, forceSubmit = false) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Please provide a descriptive title for the issue.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please describe the issue in detail.');
      return;
    }
    if (!category) {
      setErrorMessage('Please choose a category.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Check for duplicates if not already confirmed
      if (!isDuplicateConfirmed && !forceSubmit) {
        const dupRes = await api.post('/ai/check-duplicates', {
          title,
          description,
          category,
          latitude,
          longitude,
        });

        if (dupRes.success && dupRes.data && dupRes.data.length > 0) {
          setDetectedDuplicates(dupRes.data);
          setDuplicateModalOpen(true);
          setSubmitting(false);
          return;
        }
      }

      // 2. Submit the issue
      const payload = {
        title,
        description,
        category,
        userSuggestedPriority,
        latitude,
        longitude,
        address: address || `Coordinates: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        landmark,
        images,
        isDuplicateConfirmed: true,
      };

      const res = await api.post('/issues', payload);

      if (res.success && res.data) {
        navigate(`/issues/${res.data._id}`, {
          state: { newReportSuccess: true },
        });
      } else {
        setErrorMessage(res.message || 'Failed to submit issue.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicateSubmitAnyway = () => {
    setDuplicateModalOpen(false);
    setIsDuplicateConfirmed(true);
    handleSubmit(null, true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>New Civic Report</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Report a Local Issue</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Provide accurate details, photo evidence, and location coordinates to dispatch maintenance teams quickly.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm font-medium flex items-center gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-8">
        {/* Section 1: Issue Overview */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <span>1. Problem Details & AI Classification</span>
          </h2>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Issue Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Streetlight pole dark and flickering near Block C"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Detailed Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the severity, exact position, hazards, or how long this issue has persisted..."
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* AI Helper Banner */}
          {aiSuggestions && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div>
                  <span className="font-semibold text-emerald-300">AI Recommendation:</span>
                  <span className="text-slate-300 ml-1.5">
                    Suggested Category <strong>{aiSuggestions.category}</strong> • Recommended Priority{' '}
                    <strong className="text-amber-300">{aiSuggestions.priority}</strong>
                  </span>
                </div>
              </div>

              {aiSuggestions.category !== category && (
                <button
                  type="button"
                  onClick={() => setCategory(aiSuggestions.category)}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Apply AI Category
                </button>
              )}
            </div>
          )}

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                    category === cat
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Suggested Priority */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Your Suggested Urgency
              </label>
              <span className="text-[11px] text-slate-500">
                Official priority is verified by municipal admin
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((prio) => (
                <button
                  type="button"
                  key={prio}
                  onClick={() => setUserSuggestedPriority(prio)}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold uppercase transition-all ${
                    userSuggestedPriority === prio
                      ? prio === 'CRITICAL'
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : prio === 'HIGH'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : prio === 'MEDIUM'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                        : 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {prio}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Photo Evidence */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span>2. Visual Proof (Before Photo)</span>
          </h2>
          <ImageUploadZone
            images={images}
            onChange={setImages}
            maxImages={3}
            type="BEFORE"
            label="Upload Issue Photos"
            helpText="Attach up to 3 high-resolution photos showing the issue clearly"
          />
        </div>

        {/* Section 3: Interactive Location Pinning */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>3. Exact Geographic Location</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Street / Area Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., Near Library Walkway Gate 3"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Nearby Landmark (Optional)
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g., Opposite Science Auditorium"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <LeafletMapPicker
              latitude={latitude}
              longitude={longitude}
              onLocationChange={handleLocationChange}
              height="280px"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-sm transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-900/40 transition-all hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Report...
              </>
            ) : (
              <>
                Submit Issue Report
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Duplicate Alert Modal */}
      <DuplicateAlertModal
        isOpen={duplicateModalOpen}
        duplicates={detectedDuplicates}
        onSubmitAnyway={handleDuplicateSubmitAnyway}
        onClose={() => setDuplicateModalOpen(false)}
      />
    </div>
  );
};

export default ReportIssuePage;
