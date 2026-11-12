import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOfficerStats, getOfficerAssignments } from '../../services/api';
import { StatusBadge, PriorityBadge, LoadingSpinner, EmptyState, StatCard } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsData, assignmentsData] = await Promise.all([
        getOfficerStats(),
        getOfficerAssignments(),
      ]);

      setStats(statsData);
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
    } catch (err) {
      setError(err.message || 'Failed to load officer dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="dashboard">
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Officer Dashboard</h1>
            <p className="text-muted">Welcome, {user?.full_name || 'Investigating Officer'} — Department Assigned Grievances</p>
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={fetchData}>
            🔄 Refresh
          </button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        {/* Stat Cards */}
        <div className="stat-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard title="Total Assigned" value={stats?.total || 0} icon="📋" color="blue" />
          <StatCard title="Pending Review" value={stats?.pending || 0} icon="⏳" color="yellow" />
          <StatCard title="In Progress" value={stats?.in_progress || 0} icon="⚙️" color="orange" />
          <StatCard title="Reports Submitted" value={stats?.reports_submitted || 0} icon="✅" color="green" />
        </div>

        {/* Assignments Table Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="card-title" style={{ margin: 0, fontSize: '1.25rem' }}>
              My Assigned Grievances ({assignments.length})
            </h2>
          </div>

          {assignments.length === 0 ? (
            <EmptyState message="No grievances currently assigned to you." />
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ref #</th>
                    <th>Subject</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Assigned Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <Link to={`/officer/assignment/${a.id}`} style={{ fontWeight: 600 }}>
                          {a.reference_number || 'N/A'}
                        </Link>
                      </td>
                      <td>{a.subject || 'No subject'}</td>
                      <td>{a.category || '—'}</td>
                      <td><StatusBadge status={a.status} /></td>
                      <td><PriorityBadge priority={a.priority} /></td>
                      <td>{a.assigned_at ? new Date(a.assigned_at).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <Link to={`/officer/assignment/${a.id}`} className="btn btn-primary btn-sm">
                          Investigate
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
