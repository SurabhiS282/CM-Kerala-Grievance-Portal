import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getCMOGrievanceDetail,
  getGrievanceHistory,
  getDepartments,
  getOfficers,
  assignGrievance,
  updateGrievanceStatus,
  reviewReport,
  escalateGrievance,
  retryAIAnalysis,
} from '../../services/api';
import { StatusBadge, PriorityBadge, LoadingSpinner } from '../../components/UI';

const STATUS_OPTIONS = ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Reopened'];

export default function CMOGrievanceDetail() {
  const { id } = useParams();
  const [grievance, setGrievance] = useState(null);
  const [history, setHistory] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Assignment form state
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');

  // Status update state
  const [newStatus, setNewStatus] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');

  // CMO Review state
  const [reviewRemarks, setReviewRemarks] = useState('');

  // Escalate state
  const [escalateRemarks, setEscalateRemarks] = useState('');
  const [showEscalateBox, setShowEscalateBox] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  useEffect(() => {
    if (selectedDept) {
      loadOfficers(selectedDept);
    } else {
      setOfficers([]);
      setSelectedOfficer('');
    }
  }, [selectedDept]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      const [detailData, historyData, deptsData] = await Promise.all([
        getCMOGrievanceDetail(id),
        getGrievanceHistory(id),
        getDepartments(),
      ]);

      setGrievance(detailData);
      setHistory(Array.isArray(historyData) ? historyData : (historyData?.history || []));
      setDepartments(Array.isArray(deptsData) ? deptsData : (deptsData?.departments || []));
      setNewStatus(detailData.status || '');
    } catch (err) {
      setError(err.message || 'Failed to load grievance details.');
    } finally {
      setLoading(false);
    }
  };

  const reloadData = async () => {
    try {
      const [detailData, historyData] = await Promise.all([
        getCMOGrievanceDetail(id),
        getGrievanceHistory(id),
      ]);
      setGrievance(detailData);
      setHistory(Array.isArray(historyData) ? historyData : (historyData?.history || []));
      setNewStatus(detailData.status || '');
    } catch (err) {
      setError(err.message || 'Failed to refresh data.');
    }
  };

  const loadOfficers = async (deptId) => {
    try {
      const data = await getOfficers(deptId);
      setOfficers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load officers:', err);
      setOfficers([]);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedDept || !selectedOfficer) {
      setError('Please select both a department and an officer.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccessMsg('');
      const res = await assignGrievance(id, {
        department_id: selectedDept,
        officer_id: selectedOfficer,
        remarks: assignRemarks,
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Failed to assign grievance');
      }
      setSuccessMsg('Grievance assigned successfully.');
      setSelectedDept('');
      setSelectedOfficer('');
      setAssignRemarks('');
      await reloadData();
    } catch (err) {
      setError(err.message || 'Failed to assign grievance.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!newStatus) return;

    try {
      setActionLoading(true);
      setError('');
      setSuccessMsg('');
      const res = await updateGrievanceStatus(id, {
        status: newStatus,
        remarks: statusRemarks,
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Failed to update status');
      }
      setSuccessMsg(`Status updated to ${newStatus}.`);
      setStatusRemarks('');
      await reloadData();
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewReport = async (decision) => {
    try {
      setActionLoading(true);
      setError('');
      setSuccessMsg('');
      const res = await reviewReport(id, {
        decision,
        remarks: reviewRemarks,
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Failed to review report');
      }
      setSuccessMsg(`Report ${decision} successfully.`);
      setReviewRemarks('');
      await reloadData();
    } catch (err) {
      setError(err.message || 'Failed to review report.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccessMsg('');
      const res = await escalateGrievance(id, {
        remarks: escalateRemarks || 'Escalated by CMO',
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Failed to escalate grievance');
      }
      setSuccessMsg('Grievance priority escalated to High.');
      setShowEscalateBox(false);
      setEscalateRemarks('');
      await reloadData();
    } catch (err) {
      setError(err.message || 'Failed to escalate grievance.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetryAI = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccessMsg('');
      const res = await retryAIAnalysis(id);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'AI analysis retry failed');
      }
      setSuccessMsg('AI re-analysis completed.');
      await reloadData();
    } catch (err) {
      setError(err.message || 'Failed to run AI analysis.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !grievance) {
    return (
      <div className="page">
        <div className="alert alert-error">
          <p>{error}</p>
          <div style={{ marginTop: '1rem' }}>
            <Link to="/cmo/grievances" className="btn btn-outline">Back to Grievances</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!grievance) return null;

  const activeAssignment = grievance.assignments?.find((a) => a.is_active);
  const hasAI = grievance.ai_summary || grievance.ai_department_name || grievance.ai_confidence != null;

  return (
    <div className="page">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link to="/cmo/grievances" className="btn btn-outline btn-sm" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
            ← Back to All Grievances
          </Link>
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Grievance #{grievance.reference_number}</h1>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {grievance.priority !== 'High' && (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => setShowEscalateBox(!showEscalateBox)}
              disabled={actionLoading}
            >
              ⚡ Escalate Priority
            </button>
          )}
          <StatusBadge status={grievance.status} />
          <PriorityBadge priority={grievance.priority} />
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}
      {successMsg && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>{successMsg}</div>}

      {/* Escalate Confirmation Box */}
      {showEscalateBox && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: '#ef4444', background: '#fef2f2' }}>
          <h3 style={{ color: '#b91c1c', marginTop: 0, fontSize: '1.1rem' }}>Confirm Escalation to High Priority</h3>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            Escalating will raise the priority of this grievance to High and notify relevant officials.
          </p>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Escalation Reason / Remarks</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Public health hazard, repeated complaints"
              value={escalateRemarks}
              onChange={(e) => setEscalateRemarks(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleEscalate}
              disabled={actionLoading}
            >
              {actionLoading ? 'Escalating...' : 'Confirm Escalation'}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowEscalateBox(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* AI Analysis Panel */}
      <div className="ai-panel" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ margin: 0, color: '#1e40af', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🤖</span> AI Triage & Analysis
          </h3>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleRetryAI}
            disabled={actionLoading}
            style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}
          >
            {actionLoading ? 'Analyzing...' : '🔄 Re-run AI Analysis'}
          </button>
        </div>

        {hasAI ? (
          <div>
            {grievance.ai_summary && (
              <div className="ai-field" style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                <span className="ai-label" style={{ fontWeight: 600, color: '#1e40af', minWidth: '140px' }}>Summary:</span>
                <span className="ai-value" style={{ color: '#1e293b' }}>{grievance.ai_summary}</span>
              </div>
            )}
            {grievance.ai_department_name && (
              <div className="ai-field" style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                <span className="ai-label" style={{ fontWeight: 600, color: '#1e40af', minWidth: '140px' }}>Suggested Dept:</span>
                <span className="ai-value" style={{ fontWeight: 600, color: '#1e293b' }}>{grievance.ai_department_name}</span>
              </div>
            )}
            {grievance.ai_reason && (
              <div className="ai-field" style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                <span className="ai-label" style={{ fontWeight: 600, color: '#1e40af', minWidth: '140px' }}>Reasoning:</span>
                <span className="ai-value" style={{ color: '#334155' }}>{grievance.ai_reason}</span>
              </div>
            )}
            {grievance.ai_confidence != null && (
              <div className="ai-field" style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="ai-label" style={{ fontWeight: 600, color: '#1e40af', minWidth: '140px' }}>AI Confidence:</span>
                <span className="ai-value" style={{ color: '#1e293b', fontWeight: 600 }}>
                  {(grievance.ai_confidence * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-muted">AI analysis is currently unavailable for this grievance.</span>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleRetryAI}
              disabled={actionLoading}
            >
              Run AI Analysis
            </button>
          </div>
        )}
      </div>

      <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Details & History */}
        <div>
          {/* Grievance Details Card */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 className="card-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Grievance Overview</h2>
            <div className="detail-section">
              <div className="detail-row" style={{ display: 'flex', marginBottom: '0.6rem' }}>
                <span className="detail-label" style={{ fontWeight: 600, minWidth: '140px', color: '#475569' }}>Subject:</span>
                <span className="detail-value" style={{ fontWeight: 500 }}>{grievance.subject}</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', marginBottom: '0.6rem' }}>
                <span className="detail-label" style={{ fontWeight: 600, minWidth: '140px', color: '#475569' }}>Category:</span>
                <span className="detail-value">{grievance.category}</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', marginBottom: '0.6rem' }}>
                <span className="detail-label" style={{ fontWeight: 600, minWidth: '140px', color: '#475569' }}>District:</span>
                <span className="detail-value">{grievance.district}</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', marginBottom: '0.6rem' }}>
                <span className="detail-label" style={{ fontWeight: 600, minWidth: '140px', color: '#475569' }}>Current Dept:</span>
                <span className="detail-value">{grievance.assigned_department_name || 'Unassigned'}</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', marginBottom: '0.6rem' }}>
                <span className="detail-label" style={{ fontWeight: 600, minWidth: '140px', color: '#475569' }}>Submitted Date:</span>
                <span className="detail-value">{new Date(grievance.created_at).toLocaleDateString()}</span>
              </div>
              {grievance.due_at && (
                <div className="detail-row" style={{ display: 'flex', marginBottom: '0.6rem' }}>
                  <span className="detail-label" style={{ fontWeight: 600, minWidth: '140px', color: '#475569' }}>SLA Target:</span>
                  <span className="detail-value">{new Date(grievance.due_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="detail-section" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#1e3a8a', marginBottom: '0.5rem' }}>Citizen Statement</h3>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#334155' }}>
                {grievance.description}
              </p>
            </div>
          </div>

          {/* Citizen Contact Card */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Citizen Information</h3>
            <div className="detail-section">
              <div className="detail-row" style={{ display: 'flex', marginBottom: '0.5rem' }}>
                <span className="detail-label" style={{ fontWeight: 600, minWidth: '140px', color: '#475569' }}>Full Name:</span>
                <span className="detail-value">{grievance.citizen_name || 'N/A'}</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', marginBottom: '0.5rem' }}>
                <span className="detail-label" style={{ fontWeight: 600, minWidth: '140px', color: '#475569' }}>Email:</span>
                <span className="detail-value">{grievance.citizen_email || 'N/A'}</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', marginBottom: '0.5rem' }}>
                <span className="detail-label" style={{ fontWeight: 600, minWidth: '140px', color: '#475569' }}>Mobile:</span>
                <span className="detail-value">{grievance.citizen_mobile || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Attachments */}
          {grievance.attachments && grievance.attachments.length > 0 && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                Attachments ({grievance.attachments.length})
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {grievance.attachments.map((att, idx) => (
                  <li key={att.id || idx} style={{ padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>📎</span>
                    <span style={{ fontWeight: 500 }}>{att.file_name || `Document ${idx + 1}`}</span>
                    {att.file_size && (
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                        ({Math.round(att.file_size / 1024)} KB)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* History Timeline */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
              History Timeline & Audit Log
            </h3>
            {history.length === 0 ? (
              <p className="text-muted">No history recorded yet.</p>
            ) : (
              <div className="timeline">
                {history.map((entry, idx) => (
                  <div className="timeline-item" key={entry.id || idx}>
                    <div className="timeline-date">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </div>
                    <div className="timeline-status" style={{ fontWeight: 600, color: '#1e3a8a' }}>
                      {entry.previous_status ? `${entry.previous_status} → ` : ''}{entry.new_status}
                    </div>
                    {entry.remarks && (
                      <div className="timeline-remarks" style={{ marginTop: '0.25rem', color: '#475569' }}>
                        {entry.remarks}
                      </div>
                    )}
                    {entry.changed_by_name && (
                      <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        Action by: {entry.changed_by_name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Actions & Workflow */}
        <div>
          {/* CMO Report Review Panel (if officer submitted report) */}
          {activeAssignment && activeAssignment.cmo_review_status === 'pending' && (
            <div className="review-panel" style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#854d0e', marginTop: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📋</span> Officer Report Pending Review
              </h3>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                Officer <strong>{activeAssignment.officer_name}</strong> has submitted a resolution report.
              </p>

              {activeAssignment.investigation_remarks && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#854d0e' }}>Investigation Findings:</strong>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#451a03' }}>
                    {activeAssignment.investigation_remarks}
                  </p>
                </div>
              )}

              {activeAssignment.action_taken && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#854d0e' }}>Action Taken:</strong>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#451a03' }}>
                    {activeAssignment.action_taken}
                  </p>
                </div>
              )}

              {activeAssignment.resolution_details && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#854d0e' }}>Proposed Resolution:</strong>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#451a03' }}>
                    {activeAssignment.resolution_details}
                  </p>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">CMO Review Remarks</label>
                <textarea
                  className="form-input"
                  rows="2"
                  placeholder="Enter remarks for approval or further action..."
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ background: '#16a34a', borderColor: '#16a34a' }}
                  onClick={() => handleReviewReport('approved')}
                  disabled={actionLoading}
                >
                  ✓ Approve & Mark Resolved
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handleReviewReport('further_action')}
                  disabled={actionLoading}
                >
                  🔄 Request Further Action
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleReviewReport('rejected')}
                  disabled={actionLoading}
                >
                  ✕ Reject Report
                </button>
              </div>
            </div>
          )}

          {/* Assignment Section */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
              Department Assignment
            </h3>

            {activeAssignment ? (
              <div>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>
                    {activeAssignment.department_name}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    Assigned Officer: <strong>{activeAssignment.officer_name}</strong>
                  </div>
                  {activeAssignment.assignment_remarks && (
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0.25rem 0' }}>
                      <em>"{activeAssignment.assignment_remarks}"</em>
                    </p>
                  )}
                  {activeAssignment.assigned_at && (
                    <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                      Assigned on {new Date(activeAssignment.assigned_at).toLocaleDateString()}
                    </div>
                  )}
                  {activeAssignment.cmo_review_status && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <span className="badge badge-blue">
                        Review: {activeAssignment.cmo_review_status}
                      </span>
                    </div>
                  )}
                </div>

                <details style={{ fontSize: '0.875rem' }}>
                  <summary style={{ cursor: 'pointer', color: '#2563eb', fontWeight: 500 }}>
                    Reassign to different department/officer
                  </summary>
                  <form onSubmit={handleAssign} style={{ marginTop: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <select
                        className="form-input"
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Officer</label>
                      <select
                        className="form-input"
                        value={selectedOfficer}
                        onChange={(e) => setSelectedOfficer(e.target.value)}
                        required
                        disabled={!selectedDept}
                      >
                        <option value="">
                          {selectedDept ? 'Select Officer' : 'Select a department first'}
                        </option>
                        {officers.map((o) => (
                          <option key={o.id} value={o.id}>{o.full_name} ({o.email})</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Assignment Instructions</label>
                      <textarea
                        className="form-input"
                        rows="2"
                        placeholder="Instructions for the officer..."
                        value={assignRemarks}
                        onChange={(e) => setAssignRemarks(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-block btn-sm"
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Reassigning...' : 'Confirm Reassignment'}
                    </button>
                  </form>
                </details>
              </div>
            ) : (
              <form onSubmit={handleAssign}>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Assign this grievance to a department and investigating officer:
                </p>

                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select
                    className="form-input"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Investigating Officer *</label>
                  <select
                    className="form-input"
                    value={selectedOfficer}
                    onChange={(e) => setSelectedOfficer(e.target.value)}
                    required
                    disabled={!selectedDept}
                  >
                    <option value="">
                      {selectedDept ? 'Select Officer' : 'Select a department first'}
                    </option>
                    {officers.map((o) => (
                      <option key={o.id} value={o.id}>{o.full_name} ({o.email})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Remarks / Directives</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="Provide specific directions or investigation targets..."
                    value={assignRemarks}
                    onChange={(e) => setAssignRemarks(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Assigning...' : 'Assign to Officer'}
                </button>
              </form>
            )}
          </div>

          {/* Status Update Form */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
              Update Grievance Status
            </h3>
            <form onSubmit={handleStatusUpdate}>
              <div className="form-group">
                <label className="form-label">New Status</label>
                <select
                  className="form-input"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status Update Remarks</label>
                <textarea
                  className="form-input"
                  rows="2"
                  placeholder="Reason for status change..."
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-sm"
                disabled={actionLoading}
              >
                {actionLoading ? 'Updating...' : 'Update Status'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
