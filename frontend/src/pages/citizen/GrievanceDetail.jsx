import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGrievanceDetail, getGrievanceHistory, submitFeedback, reopenGrievance } from '../../services/api';
import { StatusBadge, PriorityBadge, LoadingSpinner } from '../../components/UI';

export default function GrievanceDetail() {
  const { id } = useParams();
  const [grievance, setGrievance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Feedback state
  const [rating, setRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  // Reopen state
  const [reopenLoading, setReopenLoading] = useState(false);
  const [reopenError, setReopenError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [detailRes, historyData] = await Promise.all([
        getGrievanceDetail(id),
        getGrievanceHistory(id),
      ]);

      if (!detailRes.ok) {
        const errJson = await detailRes.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Failed to load grievance details');
      }

      const detail = await detailRes.json();
      setGrievance(detail);
      setHistory(Array.isArray(historyData) ? historyData : (historyData?.history || []));
    } catch (err) {
      setError(err.message || 'Failed to load grievance details.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    setFeedbackError('');
    setFeedbackSuccess('');

    if (rating === 0) {
      setFeedbackError('Please select a star rating from 1 to 5.');
      return;
    }

    try {
      setFeedbackLoading(true);
      const res = await submitFeedback(id, { rating, comments: feedbackComment });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Failed to submit feedback.');
      }
      setFeedbackSuccess('Thank you! Your feedback has been recorded.');
      fetchData();
    } catch (err) {
      setFeedbackError(err.message || 'Failed to submit feedback.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleReopen = async () => {
    if (!window.confirm('Are you sure you want to reopen this grievance? It will be sent back to the CMO for further investigation.')) {
      return;
    }

    try {
      setReopenLoading(true);
      setReopenError('');
      const res = await reopenGrievance(id);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Failed to reopen grievance.');
      }
      fetchData();
    } catch (err) {
      setReopenError(err.message || 'Failed to reopen grievance.');
    } finally {
      setReopenLoading(false);
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
        <section className="section">
          <div className="alert alert-error">
            <p>{error}</p>
            <div style={{ marginTop: '1rem' }}>
              <Link to="/citizen/dashboard" className="btn btn-outline">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!grievance) {
    return (
      <div className="page">
        <section className="section">
          <div className="alert alert-error">
            <p>Grievance not found.</p>
            <div style={{ marginTop: '1rem' }}>
              <Link to="/citizen/dashboard" className="btn btn-outline">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const hasFeedback = grievance.feedback_rating != null;

  return (
    <div className="page">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <Link to="/citizen/dashboard" className="btn btn-outline btn-sm" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
            ← Back to My Grievances
          </Link>
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Grievance Details</h1>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}
      {reopenError && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{reopenError}</div>}

      <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Grievance info and History */}
        <div>
          {/* Grievance Overview Card */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Reference Number</span>
                <h2 style={{ margin: '0.25rem 0 0', fontSize: '1.4rem', color: '#1e3a8a' }}>
                  {grievance.reference_number}
                </h2>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <StatusBadge status={grievance.status} />
                <PriorityBadge priority={grievance.priority} />
              </div>
            </div>

            <div className="detail-section" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <div className="detail-row" style={{ display: 'flex', marginBottom: '0.75rem' }}>
                <span className="detail-label" style={{ fontWeight: 600, minWidth: '140px', color: '#475569' }}>Subject:</span>
                <span className="detail-value" style={{ fontWeight: 500 }}>{grievance.subject}</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', marginBottom: '0.75rem' }}>
                <span className="detail-label" style={{ fontWeight: 600, minWidth: '140px', color: '#475569' }}>Category:</span>
                <span className="detail-value">{grievance.category}</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', marginBottom: '0.75rem' }}>
                <span className="detail-label" style={{ fontWeight: 600, minWidth: '140px', color: '#475569' }}>District:</span>
                <span className="detail-value">{grievance.district}</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', marginBottom: '0.75rem' }}>
                <span className="detail-label" style={{ fontWeight: 600, minWidth: '140px', color: '#475569' }}>Department:</span>
                <span className="detail-value">
                  {grievance.assigned_department_name || grievance.department?.name || grievance.department || 'Under CMO Review'}
                </span>
              </div>
              <div className="detail-row" style={{ display: 'flex', marginBottom: '0.75rem' }}>
                <span className="detail-label" style={{ fontWeight: 600, minWidth: '140px', color: '#475569' }}>Submitted Date:</span>
                <span className="detail-value">{new Date(grievance.created_at).toLocaleDateString()}</span>
              </div>
              {grievance.due_at && (
                <div className="detail-row" style={{ display: 'flex', marginBottom: '0.75rem' }}>
                  <span className="detail-label" style={{ fontWeight: 600, minWidth: '140px', color: '#475569' }}>Target Resolution:</span>
                  <span className="detail-value">{new Date(grievance.due_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="detail-section" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#1e3a8a', marginBottom: '0.5rem' }}>Detailed Description</h3>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#334155' }}>
                {grievance.description}
              </p>
            </div>
          </div>

          {/* Attachments */}
          {grievance.attachments && grievance.attachments.length > 0 && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 className="card-title" style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>
                Attachments ({grievance.attachments.length})
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {grievance.attachments.map((att, idx) => (
                  <li key={att.id || idx} style={{ padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>📎</span>
                    <span style={{ fontWeight: 500 }}>{att.file_name || att.name || `Document ${idx + 1}`}</span>
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
            <h3 className="card-title" style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
              Status History & Audit Trail
            </h3>
            {history.length === 0 ? (
              <p className="text-muted">No status updates recorded yet.</p>
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
                        Updated by: {entry.changed_by_name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Actions / Feedback */}
        <div>
          {/* Resolution & Feedback Section */}
          {grievance.status === 'Resolved' && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                Resolution & Feedback
              </h3>

              {hasFeedback ? (
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>
                    Your Submitted Feedback
                  </div>
                  <div style={{ fontSize: '1.5rem', color: '#f59e0b', marginBottom: '0.5rem' }}>
                    {'★'.repeat(grievance.feedback_rating)}{'☆'.repeat(5 - grievance.feedback_rating)}
                  </div>
                  {grievance.feedback_comments && (
                    <p style={{ color: '#475569', fontSize: '0.9rem', fontStyle: 'italic' }}>
                      "{grievance.feedback_comments}"
                    </p>
                  )}
                  {grievance.feedback_at && (
                    <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                      Submitted on {new Date(grievance.feedback_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ) : feedbackSuccess ? (
                <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
                  {feedbackSuccess}
                </div>
              ) : (
                <form onSubmit={handleFeedback} style={{ marginBottom: '1.5rem' }}>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                    Please rate your satisfaction with how this grievance was resolved:
                  </p>

                  {feedbackError && <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}>{feedbackError}</div>}

                  <div className="form-group">
                    <label className="form-label">Satisfaction Rating *</label>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '1.75rem', cursor: 'pointer' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          onClick={() => setRating(star)}
                          style={{ color: star <= rating ? '#f59e0b' : '#cbd5e1', transition: 'color 0.2s' }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="feedbackComment" className="form-label">Comments (Optional)</label>
                    <textarea
                      id="feedbackComment"
                      className="form-input"
                      rows="3"
                      placeholder="Share your experience or feedback..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={feedbackLoading}
                  >
                    {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </form>
              )}

              {/* Reopen Button */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', color: '#dc2626' }}>
                  Not satisfied with resolution?
                </h4>
                <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                  If the problem is unresolved, you can request to reopen this grievance.
                </p>
                <button
                  type="button"
                  className="btn btn-danger btn-block"
                  onClick={handleReopen}
                  disabled={reopenLoading}
                >
                  {reopenLoading ? 'Reopening Grievance...' : 'Reopen Grievance'}
                </button>
              </div>
            </div>
          )}

          {/* Grievance Quick Summary */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              Portal Assistance
            </h3>
            <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
              Need urgent escalation or have additional documentation? You can contact the CMO Grievance Cell at <strong>+91 471 2333 812</strong> quoting reference <strong>{grievance.reference_number}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
