import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getOfficerAssignment,
  updateAssignment,
  submitOfficerReport,
} from '../../services/api';
import { StatusBadge, PriorityBadge, LoadingSpinner } from '../../components/UI';

export default function OfficerAssignmentDetail() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Investigation Update Form
  const [investigationRemarks, setInvestigationRemarks] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  // Submit Report Form
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getOfficerAssignment(id);
      setAssignment(data);
      setInvestigationRemarks(data.investigation_remarks || '');
      setActionTaken(data.action_taken || '');
      setResolutionDetails(data.resolution_details || '');
    } catch (err) {
      setError(err.message || 'Failed to load assignment details.');
    } finally {
      setLoading(false);
    }
  };

  const handleInvestigationUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      setError('');
      setSuccessMsg('');

      const res = await updateAssignment(id, {
        investigation_remarks: investigationRemarks,
        action_taken: actionTaken,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Failed to save investigation update');
      }

      setSuccessMsg('Investigation progress saved successfully.');
      const updated = await getOfficerAssignment(id);
      setAssignment(updated);
    } catch (err) {
      setError(err.message || 'Failed to update investigation.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!resolutionDetails.trim()) {
      setError('Please provide resolution details before submitting the final report.');
      return;
    }

    try {
      setReportLoading(true);
      setError('');
      setSuccessMsg('');

      const formData = new FormData();
      formData.append('resolution_details', resolutionDetails.trim());
      if (actionTaken.trim()) {
        formData.append('action_taken', actionTaken.trim());
      }
      if (reportFile) {
        formData.append('file', reportFile);
      }

      const res = await submitOfficerReport(id, formData);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Failed to submit report');
      }

      setSuccessMsg('Resolution report submitted successfully for CMO review.');
      setReportFile(null);
      const updated = await getOfficerAssignment(id);
      setAssignment(updated);
    } catch (err) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="page">
        <div className="alert alert-error">
          <p>{error}</p>
          <div style={{ marginTop: '1rem' }}>
            <Link to="/officer/dashboard" className="btn btn-outline">Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) return null;

  return (
    <div className="page">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link to="/officer/dashboard" className="btn btn-outline btn-sm" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
            ← Back to Officer Dashboard
          </Link>
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Grievance #{assignment.reference_number}</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <StatusBadge status={assignment.status} />
          <PriorityBadge priority={assignment.priority} />
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}
      {successMsg && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>{successMsg}</div>}

      {/* CMO Review Status Banner */}
      {assignment.cmo_review_status && (
        <div
          className="card"
          style={{
            marginBottom: '1.5rem',
            background: assignment.cmo_review_status === 'approved' ? '#f0fdf4' : assignment.cmo_review_status === 'pending' ? '#eff6ff' : '#fef2f2',
            borderColor: assignment.cmo_review_status === 'approved' ? '#bbf7d0' : assignment.cmo_review_status === 'pending' ? '#bfdbfe' : '#fecaca',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <strong style={{ fontSize: '1rem', color: assignment.cmo_review_status === 'approved' ? '#166534' : assignment.cmo_review_status === 'pending' ? '#1e40af' : '#991b1b' }}>
                CMO Review Status: {assignment.cmo_review_status.toUpperCase()}
              </strong>
              {assignment.cmo_remarks && (
                <p style={{ margin: '0.5rem 0 0', color: '#334155', fontSize: '0.9rem' }}>
                  <strong>CMO Directives:</strong> {assignment.cmo_remarks}
                </p>
              )}
            </div>
            {assignment.reviewed_at && (
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                Reviewed on {new Date(assignment.reviewed_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem' }}>
        {/* Left Column: Grievance info & Citizen Details */}
        <div>
          {/* Grievance Summary Card */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 className="card-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Grievance Overview</h2>
            <div className="detail-section">
              <div className="detail-row" style={{ display: 'flex', marginBottom: '0.5rem' }}>
                <span className="detail-label" style={{ fontWeight: 600, minWidth: '120px', color: '#475569' }}>Subject:</span>
                <span className="detail-value" style={{ fontWeight: 500 }}>{assignment.subject}</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', marginBottom: '0.5rem' }}>
                <span className="detail-label" style={{ fontWeight: 600, minWidth: '120px', color: '#475569' }}>Category:</span>
                <span className="detail-value">{assignment.category}</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', marginBottom: '0.5rem' }}>
                <span className="detail-label" style={{ fontWeight: 600, minWidth: '120px', color: '#475569' }}>District:</span>
                <span className="detail-value">{assignment.district}</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', marginBottom: '0.5rem' }}>
                <span className="detail-label" style={{ fontWeight: 600, minWidth: '120px', color: '#475569' }}>Department:</span>
                <span className="detail-value">{assignment.department_name}</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', marginBottom: '0.5rem' }}>
                <span className="detail-label" style={{ fontWeight: 600, minWidth: '120px', color: '#475569' }}>Assigned Date:</span>
                <span className="detail-value">
                  {assignment.assigned_at ? new Date(assignment.assigned_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            <div className="detail-section" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#1e3a8a', marginBottom: '0.5rem' }}>Description</h3>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#334155' }}>
                {assignment.description}
              </p>
            </div>
          </div>

          {/* Citizen Details Card */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Complainant Details</h3>
            <div className="detail-section">
              <div className="detail-row" style={{ display: 'flex', marginBottom: '0.5rem' }}>
                <span className="detail-label" style={{ fontWeight: 600, minWidth: '120px', color: '#475569' }}>Citizen:</span>
                <span className="detail-value">{assignment.citizen_name || 'N/A'}</span>
              </div>
              {assignment.citizen_email && (
                <div className="detail-row" style={{ display: 'flex', marginBottom: '0.5rem' }}>
                  <span className="detail-label" style={{ fontWeight: 600, minWidth: '120px', color: '#475569' }}>Email:</span>
                  <span className="detail-value">{assignment.citizen_email}</span>
                </div>
              )}
            </div>
          </div>

          {/* CMO Directives Card */}
          {assignment.assignment_remarks && (
            <div className="card" style={{ marginBottom: '1.5rem', background: '#f8fafc' }}>
              <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#1e40af' }}>
                CMO Directives / Instructions
              </h3>
              <p style={{ margin: 0, color: '#334155', fontStyle: 'italic', lineHeight: 1.5 }}>
                "{assignment.assignment_remarks}"
              </p>
            </div>
          )}

          {/* Attachments */}
          {assignment.attachments && assignment.attachments.length > 0 && (
            <div className="card">
              <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                Citizen Attachments ({assignment.attachments.length})
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {assignment.attachments.map((att, idx) => (
                  <li key={att.id || idx} style={{ padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>📎</span>
                    <span style={{ fontWeight: 500 }}>{att.file_name || `Attachment ${idx + 1}`}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Investigation Form & Report Form */}
        <div>
          {/* Form 1: Investigation Update */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 className="card-title" style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>
              1. Investigation Progress & Action Taken
            </h3>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              Record ongoing field findings or actions taken. Saving updates grievance status to <strong>In Progress</strong>.
            </p>

            <form onSubmit={handleInvestigationUpdate}>
              <div className="form-group">
                <label className="form-label">Investigation Remarks / Field Notes</label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="Record verification notes, site inspection observations, or communication with citizen..."
                  value={investigationRemarks}
                  onChange={(e) => setInvestigationRemarks(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Interim Action Taken</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Describe initial actions taken (e.g., notice issued, inspection scheduled, contractor assigned)..."
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-outline btn-block"
                disabled={updateLoading}
              >
                {updateLoading ? 'Saving Progress...' : '💾 Save Investigation Progress'}
              </button>
            </form>
          </div>

          {/* Form 2: Submit Final Resolution Report */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: '#166534' }}>
              2. Submit Final Resolution Report to CMO
            </h3>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              Once investigation is complete and remedial measures have been implemented, submit your final report for CMO approval.
            </p>

            <form onSubmit={handleSubmitReport}>
              <div className="form-group">
                <label className="form-label">Resolution Details *</label>
                <textarea
                  className="form-input"
                  rows="5"
                  placeholder="Detailed description of the resolution achieved, corrective measures implemented, and outcome for the citizen..."
                  value={resolutionDetails}
                  onChange={(e) => setResolutionDetails(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Resolution Proof / Completion Document (Optional)</label>
                <input
                  type="file"
                  className="form-input"
                  onChange={(e) => setReportFile(e.target.files[0] || null)}
                  accept="image/*,.pdf,.doc,.docx"
                />
                <small className="text-muted" style={{ display: 'block', marginTop: '0.25rem' }}>
                  Attach inspection photos, completion certificate, or official resolution order.
                </small>
              </div>

              {assignment.submitted_at && (
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <span className="text-muted">Last report submitted on: </span>
                  <strong>{new Date(assignment.submitted_at).toLocaleDateString()}</strong>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={reportLoading}
              >
                {reportLoading ? 'Submitting Report...' : '✓ Submit Final Report for CMO Review'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
