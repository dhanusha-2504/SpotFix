import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Sparkles,
  Camera,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Compass,
} from 'lucide-react';
import api from '../../services/api';
import LeafletMapPicker from '../../components/common/LeafletMapPicker';
import ImageUploadZone from '../../components/common/ImageUploadZone';
import DuplicateAlertModal from '../../components/common/DuplicateAlertModal';
import CityDigitalTwin from '../../components/canvas/CityDigitalTwin';

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
  const [mapMode, setMapMode] = useState('3d'); // '3d' | 'leaflet'

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
          if (res.data.category && res.data.category !== 'Other') {
            setCategory((currentCat) => currentCat || res.data.category);
          }
        }
      } catch {
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

  // Preview object for the 3D map based on user form input
  const previewIssueMarker = [
    {
      _id: 'current-draft',
      issueId: 'NEW',
      title: title || 'New Reported Issue Location',
      category: category || 'Other',
      status: 'REPORTED',
      priority: userSuggestedPriority,
      address: address || 'Selected Civic Pin',
      latitude,
      longitude,
      x: 0,
      z: 0,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 transition-colors duration-300">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>New Civic Report & 3D City Geotagging</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Report a Local Issue
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Provide accurate details, photo evidence, and location coordinates to dispatch maintenance teams quickly.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-medium flex items-center gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Two-Column Responsive Layout: Left Form & Right 3D Digital Twin Map */}
      <form onSubmit={(e) => handleSubmit(e)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Report Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Problem Details & AI Classification */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <span>1. Problem Details & AI Classification</span>
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Issue Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Streetlight pole dark and flickering near Block C"
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Detailed Description *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the severity, exact position, hazards, or how long this issue has persisted..."
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            {/* AI Helper Banner */}
            {aiLoading && (
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex items-center gap-2.5 text-xs animate-pulse">
                <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
                <span className="text-slate-600 dark:text-slate-400">AI is analyzing issue title and description...</span>
              </div>
            )}
            {!aiLoading && aiSuggestions && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300">AI Recommendation:</span>
                    <span className="text-slate-700 dark:text-slate-300 ml-1.5">
                      Suggested Category <strong>{aiSuggestions.category}</strong> • Recommended Priority{' '}
                      <strong className="text-amber-600 dark:text-amber-300">{aiSuggestions.priority}</strong>
                    </span>
                  </div>
                </div>

                {aiSuggestions.category !== category && (
                  <button
                    type="button"
                    onClick={() => setCategory(aiSuggestions.category)}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm"
                  >
                    Apply AI Category
                  </button>
                )}
              </div>
            )}

            {/* Category Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
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
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                        : 'bg-slate-100 dark:bg-slate-900/80 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
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
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Your Suggested Urgency
                </label>
                <span className="text-[11px] text-slate-500">
                  Verified by municipal admin
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
                          ? 'bg-red-500/20 border-red-500 text-red-600 dark:text-red-400'
                          : prio === 'HIGH'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400'
                          : prio === 'MEDIUM'
                          ? 'bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {prio}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Photo Evidence */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
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
        </div>

        {/* RIGHT COLUMN: Interactive 3D Digital Twin & Location Coordinates */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl sticky top-24">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Compass className="w-4 h-4" />
                <span>3. Location & 3D City Environment</span>
              </h2>

              <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-900 p-1 rounded-xl border border-slate-300 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setMapMode('3d')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    mapMode === '3d'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  3D City
                </button>
                <button
                  type="button"
                  onClick={() => setMapMode('leaflet')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    mapMode === 'leaflet'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  GPS Map
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Street / Area Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g., Near Library Walkway Gate 3"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Nearby Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g., Opposite Science Auditorium"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Interactive View Container */}
            <div className="rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-inner bg-slate-950 relative min-h-[320px]">
              {mapMode === '3d' ? (
                <CityDigitalTwin
                  mode="compact"
                  issues={previewIssueMarker}
                  height="340px"
                  showControls={false}
                />
              ) : (
                <div className="h-[340px]">
                  <LeafletMapPicker
                    latitude={latitude}
                    longitude={longitude}
                    onLocationChange={handleLocationChange}
                    height="100%"
                  />
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
              Coordinates: <span className="font-mono text-emerald-600 dark:text-emerald-400">{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
            </p>

            {/* Submit Actions */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-900 hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-900/40 transition-all hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Issue Report
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
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
