import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowLeft,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Send,
  MessageSquare,
  AlertTriangle,
  Camera,
  Play,
  Hammer,
  ShieldCheck,
  Check,
  Loader2,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import TimelineVisualizer from '../../components/common/TimelineVisualizer';
import LeafletMapPicker from '../../components/common/LeafletMapPicker';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ImageUploadZone from '../../components/common/ImageUploadZone';

const IssueDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [issue, setIssue] = useState(null);
  const [history, setHistory] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  // AI Summary State
  const [aiSummary, setAiSummary] = useState('');
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);

  // Modals & Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [reopenImages, setReopenImages] = useState([]);

  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionImages, setCompletionImages] = useState([]);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  const fetchIssueDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/issues/${id}`);
      if (res.success && res.data) {
        setIssue(res.data.issue);
        setHistory(res.data.history || []);
        setComments(res.data.comments || []);
        setSelectedPriority(res.data.issue.priority);
      }
    } catch (err) {
      setError(err.message || 'Failed to load issue details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIssueDetails();
  }, [fetchIssueDetails]);

  // Load staff list for admin assignment modal
  useEffect(() => {
    if (role === 'admin') {
      api.get('/admin/staff').then((res) => {
        if (res.success) setStaffList(res.data || []);
      });
    }
  }, [role]);

  // Handle Comment Post
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setCommentLoading(true);
    try {
      const res = await api.post(`/issues/${id}/comments`, {
        text: commentText,
        isInternal: isInternalComment,
      });

      if (res.success && res.data) {
        setComments([...comments, res.data]);
        setCommentText('');
        setIsInternalComment(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to post comment.');
    } finally {
      setCommentLoading(false);
    }
  };

  // AI Summary Generator
  const handleGenerateSummary = async () => {
    setAiSummaryLoading(true);
    try {
      const res = await api.get(`/ai/summary/${id}`);
      if (res.success && res.data) {
        setAiSummary(res.data.summary);
      }
    } catch (err) {
      alert(err.message || 'Failed to generate AI summary.');
    } finally {
      setAiSummaryLoading(false);
    }
  };

  // Citizen / Admin Verify Resolution
  const handleVerifyResolution = async () => {
    if (!window.confirm('Are you sure you want to verify and close this issue?')) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/issues/${id}/verify`, {
        feedback: 'Resolution confirmed by citizen.',
      });
      if (res.success) {
        await fetchIssueDetails();
      }
    } catch (err) {
      alert(err.message || 'Verification failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Reopen Issue
  const handleReopenIssue = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) {
      alert('Please provide a reason for reopening.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post(`/issues/${id}/reopen`, {
        reason: reopenReason,
        reopenImage: reopenImages.length > 0 ? reopenImages[0].url : '',
      });
      if (res.success) {
        setReopenModalOpen(false);
        setReopenReason('');
        setReopenImages([]);
        await fetchIssueDetails();
      }
    } catch (err) {
      alert(err.message || 'Failed to reopen issue.');
    } finally {
      setActionLoading(false);
    }
  };

  // Staff: Accept Assignment
  const handleAcceptAssignment = async () => {
    setActionLoading(true);
    try {
      const res = await api.put(`/staff/issues/${id}/accept`);
      if (res.success) await fetchIssueDetails();
    } catch (err) {
      alert(err.message || 'Failed to accept task.');
    } finally {
      setActionLoading(false);
    }
  };

  // Staff: Start Work
  const handleStartWork = async () => {
    setActionLoading(true);
    try {
      const res = await api.put(`/staff/issues/${id}/start`);
      if (res.success) await fetchIssueDetails();
    } catch (err) {
      alert(err.message || 'Failed to mark work started.');
    } finally {
      setActionLoading(false);
    }
  };

  // Staff: Complete Work
  const handleCompleteWork = async (e) => {
    e.preventDefault();
    if (completionImages.length === 0) {
      alert('Proof photo is required to mark work as completed.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.put(`/staff/issues/${id}/complete`, {
        completionNotes,
        completionImage: completionImages[0].url,
      });
      if (res.success) {
        setCompleteModalOpen(false);
        setCompletionNotes('');
        setCompletionImages([]);
        await fetchIssueDetails();
      }
    } catch (err) {
      alert(err.message || 'Failed to complete work.');
    } finally {
      setActionLoading(false);
    }
  };

  // Admin: Review Issue (Approve / Reject)
  const handleAdminReview = async (decision) => {
    const reason = prompt(`Optional remarks for ${decision}:`);
    setActionLoading(true);
    try {
      const res = await api.put(`/admin/issues/${id}/review`, {
        decision,
        priority: selectedPriority || issue.priority,
        adminComment: reason || '',
      });
      if (res.success) await fetchIssueDetails();
    } catch (err) {
      alert(err.message || 'Admin review failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Admin: Assign Staff
  const handleAssignStaffSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) {
      alert('Please select a staff member.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.put(`/issues/${id}/assign`, {
        staffId: selectedStaffId,
        notes: assignmentNotes,
        priority: selectedPriority || issue.priority,
      });
      if (res.success) {
        setAssignModalOpen(false);
        await fetchIssueDetails();
      }
    } catch (err) {
      alert(err.message || 'Failed to assign staff.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading issue details & lifecycle timeline..." />
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Issue Not Found</h2>
        <p className="text-sm text-slate-400">{error || 'This issue may have been removed or does not exist.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isReporter = user?.id === issue.reportedBy?._id || user?._id === issue.reportedBy?._id;
  const isAssignedStaff = user?.id === issue.assignedTo?._id || user?._id === issue.assignedTo?._id;
  const isSlaOverdue =
    issue.slaDeadline &&
    new Date(issue.slaDeadline) < new Date() &&
    !['RESOLVED', 'REJECTED', 'CANCELLED'].includes(issue.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb / Return */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-sky-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </button>

        <div className="flex items-center gap-2">
          {isSlaOverdue && (
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              SLA Overdue
            </span>
          )}
          <PriorityBadge priority={issue.priority} size="md" />
          <StatusBadge status={issue.status} size="md" />
        </div>
      </div>

      {/* Main Issue Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">
            {issue.issueCode}
          </span>
          <span>•</span>
          <span className="text-slate-300 font-semibold">{issue.category}</span>
          <span>•</span>
          <span>Reported {new Date(issue.createdAt).toLocaleString()}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
          {issue.title}
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed max-w-4xl whitespace-pre-line">
          {issue.description}
        </p>

        {/* Stakeholder Details Bar */}
        <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Reported By</p>
              <p className="font-semibold text-white">{issue.reportedBy?.name || 'Anonymous'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Assigned Staff</p>
              <p className="font-semibold text-white">
                {issue.assignedTo ? `${issue.assignedTo.name} (${issue.assignedTo.department})` : 'Unassigned'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Target Resolution SLA</p>
              <p className="font-semibold text-white">
                {issue.slaDeadline ? new Date(issue.slaDeadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Standard 48 Hours'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Workflow Timeline */}
      <TimelineVisualizer currentStatus={issue.status} />

      {/* Action Banners for Citizen / Staff / Admin */}
      {/* 1. Citizen Verification Action */}
      {issue.status === 'VERIFICATION_PENDING' && (isReporter || role === 'admin') && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/40 space-y-4 shadow-xl animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Action Required: Verify Resolution Proof
              </h3>
              <p className="text-xs text-purple-200">
                Staff marked this repair as finished. Please inspect the after/resolution photo below and confirm or reopen.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleVerifyResolution}
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-900/40 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Verify & Confirm Resolution
            </button>
            <button
              onClick={() => setReopenModalOpen(true)}
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-900/40 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Problem Still Exists (Reopen)
            </button>
          </div>
        </div>
      )}

      {/* 2. Staff Action Bar */}
      {(isAssignedStaff || role === 'admin') && (
        <div className="glass-panel p-5 rounded-3xl border border-sky-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
              <Hammer className="w-4 h-4" />
              <span>Staff Maintenance Controls</span>
            </div>
            <span className="text-[11px] text-slate-400">Current Phase: {issue.status}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {['ASSIGNED', 'REOPENED'].includes(issue.status) && (
              <button
                onClick={handleAcceptAssignment}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md"
              >
                <Play className="w-3.5 h-3.5" />
                Accept Task Assignment
              </button>
            )}

            {['ACCEPTED'].includes(issue.status) && (
              <button
                onClick={handleStartWork}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md"
              >
                <Hammer className="w-3.5 h-3.5" />
                Start Active Repair Work
              </button>
            )}

            {['IN_PROGRESS', 'ACCEPTED'].includes(issue.status) && (
              <button
                onClick={() => setCompleteModalOpen(true)}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md"
              >
                <Check className="w-3.5 h-3.5" />
                Upload Proof & Complete Work
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Admin Governance Bar */}
      {role === 'admin' && (
        <div className="glass-panel p-5 rounded-3xl border border-sky-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Supervisory Actions</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {['REPORTED', 'UNDER_REVIEW'].includes(issue.status) && (
              <>
                <button
                  onClick={() => handleAdminReview('APPROVE')}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve Issue
                </button>
                <button
                  onClick={() => handleAdminReview('REJECT')}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Reject Issue
                </button>
              </>
            )}

            <button
              onClick={() => setAssignModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-sky-500 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <User className="w-3.5 h-3.5 text-sky-400" />
              {issue.assignedTo ? 'Reassign Staff' : 'Assign Field Staff'}
            </button>
          </div>
        </div>
      )}

      {/* Grid: Photos + Location Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Photo Evidence Gallery */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span>Photo Evidence Archive</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              {issue.images?.length || 0} photo(s) attached
            </span>
          </div>

          {issue.images && issue.images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {issue.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-video shadow-md"
                >
                  <img
                    src={img.url}
                    alt={img.caption || `Photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-90 p-3 flex flex-col justify-end">
                    <span
                      className={`self-start text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        img.type === 'AFTER'
                          ? 'bg-sky-500 text-slate-950'
                          : img.type === 'PROGRESS'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      {img.type} EVIDENCE
                    </span>
                    <p className="text-xs text-white font-medium mt-1 truncate">{img.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              No photo evidence attached to this report.
            </div>
          )}
        </div>

        {/* Location & Coordinates Map */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Location Coordinates</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {issue.location?.latitude?.toFixed(4)}, {issue.location?.longitude?.toFixed(4)}
            </span>
          </div>

          <LeafletMapPicker
            latitude={issue.location?.latitude}
            longitude={issue.location?.longitude}
            address={issue.location?.address}
            readOnly={true}
            height="260px"
          />
        </div>
      </div>

      {/* AI History Summarizer */}
      <div className="glass-panel p-6 rounded-3xl border border-sky-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
            <Sparkles className="w-4 h-4" />
            <span>AI Lifecycle Summarizer</span>
          </div>
          <button
            type="button"
            onClick={handleGenerateSummary}
            disabled={aiSummaryLoading}
            className="px-3 py-1 rounded-lg bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            {aiSummaryLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {aiSummary ? 'Refresh AI Digest' : 'Generate Summary Digest'}
          </button>
        </div>

        {aiSummary ? (
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 animate-in fade-in">
            {aiSummary}
          </p>
        ) : (
          <p className="text-xs text-slate-500 italic">
            Click "Generate Summary Digest" to get an instant natural-language narrative of this issue's progression.
          </p>
        )}
      </div>

      {/* Bottom Grid: Audit History Trail + Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audit Trail History */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Audit History & Milestones</span>
          </h3>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {history.length === 0 ? (
              <p className="text-xs text-slate-500">No history events recorded yet.</p>
            ) : (
              history.map((h, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs border-l-2 border-slate-800 pl-3 pb-3 relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-400 -left-[18px] top-1 absolute" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {h.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(h.timestamp || h.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-400">{h.comment || 'Status progressed'}</p>
                    <span className="text-[10px] text-slate-500 font-medium">
                      By {h.performedBy?.name || 'System'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Discussion / Comments */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <span>Discussion & Updates</span>
              </h3>
              <span className="text-[11px] text-slate-400">{comments.length} message(s)</span>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-500">No comments posted yet.</p>
              ) : (
                comments.map((c, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl text-xs space-y-1 ${
                      c.isInternal
                        ? 'bg-amber-950/30 border border-amber-500/30'
                        : 'bg-slate-900 border border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{c.user?.name}</span>
                        {c.isInternal && (
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                            Internal Staff Note
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{c.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="space-y-2 pt-3 border-t border-slate-800">
            {['admin', 'staff'].includes(role) && (
              <label className="flex items-center gap-2 text-xs text-amber-400 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternalComment}
                  onChange={(e) => setIsInternalComment(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>Internal staff note (hidden from citizen)</span>
              </label>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment or progress note..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={commentLoading || !commentText.trim()}
                className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-40 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal 1: Reopen Issue Modal */}
      {reopenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel max-w-md w-full rounded-2xl border border-rose-500/40 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-400" />
              <span>Reopen Issue {issue.issueCode}</span>
            </h3>
            <p className="text-xs text-slate-400">
              Please explain clearly why the issue is not satisfactorily resolved so maintenance crew can re-inspect.
            </p>

            <form onSubmit={handleReopenIssue} className="space-y-4">
              <textarea
                required
                rows={3}
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="e.g., Streetlight was replaced but cable is still sparking..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-rose-500"
              />

              <ImageUploadZone
                images={reopenImages}
                onChange={setReopenImages}
                maxImages={1}
                type="BEFORE"
                label="Reopen Proof Photo (Optional)"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReopenModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                >
                  Submit Reopen Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Staff Complete Work Modal */}
      {completeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel max-w-md w-full rounded-2xl border border-sky-500/40 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Check className="w-5 h-5 text-sky-400" />
              <span>Complete Repair Work: {issue.issueCode}</span>
            </h3>
            <p className="text-xs text-slate-400">
              A high-resolution photo proof of the completed work is mandatory before moving to verification.
            </p>

            <form onSubmit={handleCompleteWork} className="space-y-4">
              <textarea
                rows={2}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Add brief completion notes (e.g. Patching complete, asphalt cured)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
              />

              <ImageUploadZone
                images={completionImages}
                onChange={setCompletionImages}
                maxImages={1}
                type="AFTER"
                label="Resolution Proof Photo *"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCompleteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || completionImages.length === 0}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold disabled:opacity-40"
                >
                  Submit Completion Proof
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Admin Staff Assignment Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel max-w-md w-full rounded-2xl border border-sky-500/40 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-sky-400" />
              <span>Assign Staff to {issue.issueCode}</span>
            </h3>

            <form onSubmit={handleAssignStaffSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Select Field Staff Member *
                </label>
                <select
                  required
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="">-- Choose registered staff --</option>
                  {staffList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.department}) - {s.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Official Priority
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Assignment Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  placeholder="Special instructions for the repair crew..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !selectedStaffId}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold disabled:opacity-40"
                >
                  Dispatch Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueDetailsPage;
