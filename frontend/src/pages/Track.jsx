import { useState } from 'react';
import { trackGrievance } from '../services/api';
import { StatusBadge, LoadingSpinner } from '../components/UI';

export default function Track() {
  const [refNumber, setRefNumber] = useState('');
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = refNumber.trim();
    if (!trimmed) {
      setError('Please enter a reference number');
      return;
    }

    setError('');
    setGrievance(null);

    try {
      setLoading(true);
      const res = await trackGrievance(trimmed);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('No grievance found with this reference number. Please check and try again.');
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to track grievance. Please try again.');
      }
      const data = await res.json();
      setGrievance(data.grievance || data);
    } catch (err) {
      setError(err.message || 'Failed to track grievance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="page">
      <section className="section">
        <h1 className="page-title">Track Your Grievance</h1>
        <p className="page-subtitle">
          Enter your grievance reference number to check the current status and
          history of your complaint.
        </p>
      </section>

      {/* Search Form */}
      <section className="section">
        <div className="track-form-container">
          <form onSubmit={handleSubmit} className="track-form">
            <div className="form-group">
              <label htmlFor="refNumber" className="form-label">
                Reference Number
              </label>
              <div className="input-group">
                <input
                  type="text"
                  id="refNumber"
                  className="form-input"
                  placeholder="e.g., GRV-KL-2025-001234"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Track'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Loading */}
      {loading && <LoadingSpinner message="Searching for your grievance..." />}

      {/* Error */}
      {error && (
        <section className="section">
          <div className="alert alert-error">{error}</div>
        </section>
      )}

      {/* Result */}
      {grievance && (
        <section className="section">
          <div className="card">
            <div className="track-result-header">
              <h2 className="card-title">Grievance Details</h2>
              <StatusBadge status={grievance.status} />
            </div>

            <div className="track-details-grid">
              <div className="track-detail">
                <span className="track-detail-label">Reference Number</span>
                <span className="track-detail-value">
                  {grievance.reference_number || grievance.refNumber}
                </span>
              </div>
              <div className="track-detail">
                <span className="track-detail-label">Subject</span>
                <span className="track-detail-value">{grievance.subject}</span>
              </div>
              <div className="track-detail">
                <span className="track-detail-label">Category</span>
                <span className="track-detail-value">{grievance.category}</span>
              </div>
              <div className="track-detail">
                <span className="track-detail-label">District</span>
                <span className="track-detail-value">{grievance.district}</span>
              </div>
              <div className="track-detail">
                <span className="track-detail-label">Department</span>
                <span className="track-detail-value">
                  {grievance.department?.name || grievance.department || 'Pending Assignment'}
                </span>
              </div>
              <div className="track-detail">
                <span className="track-detail-label">Submitted On</span>
                <span className="track-detail-value">
                  {formatDate(grievance.created_at || grievance.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* History Timeline */}
          {grievance.history && grievance.history.length > 0 && (
            <div className="card">
              <h3 className="card-title">Status History</h3>
              <div className="timeline">
                {grievance.history.map((entry, index) => (
                  <div className="timeline-item" key={index}>
                    <div className="timeline-marker">
                      <span className="timeline-dot" />
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <StatusBadge status={entry.status} />
                        <span className="timeline-date">
                          {formatDate(entry.created_at || entry.date)}
                        </span>
                      </div>
                      <p className="timeline-description">
                        {entry.remarks || entry.comment || entry.description}
                      </p>
                      {entry.action_by && (
                        <span className="timeline-actor">By: {entry.action_by}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
