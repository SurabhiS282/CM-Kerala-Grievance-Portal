import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyGrievances } from '../../services/api';
import { StatusBadge, PriorityBadge, LoadingSpinner, EmptyState, StatCard } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMyGrievances();
      setGrievances(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      setError(err.message || 'Failed to load grievances. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: grievances.length,
    pending: grievances.filter((g) => ['Submitted', 'Under Review'].includes(g.status)).length,
    resolved: grievances.filter((g) => g.status === 'Resolved').length,
    reopened: grievances.filter((g) => g.status === 'Reopened').length,
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
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Welcome, {user?.full_name || 'Citizen'}</h1>
            <p className="text-muted">Manage and track your submitted grievances</p>
          </div>
          <Link to="/citizen/submit" className="btn btn-primary">
            Submit New Grievance
          </Link>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <div className="stat-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard title="Total Grievances" value={stats.total} icon="📋" color="blue" />
          <StatCard title="Pending Review" value={stats.pending} icon="⏳" color="yellow" />
          <StatCard title="Resolved" value={stats.resolved} icon="✅" color="green" />
          <StatCard title="Reopened" value={stats.reopened} icon="🔄" color="red" />
        </div>

        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>My Grievances</h2>
          {grievances.length === 0 ? (
            <EmptyState message="No grievances submitted yet. Click 'Submit New Grievance' above to report an issue." />
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ref #</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Submitted Date</th>
                  </tr>
                </thead>
                <tbody>
                  {grievances.map((g) => (
                    <tr key={g.id}>
                      <td>
                        <Link to={`/citizen/grievance/${g.id}`} style={{ fontWeight: 600 }}>
                          {g.reference_number}
                        </Link>
                      </td>
                      <td>{g.subject}</td>
                      <td>
                        <StatusBadge status={g.status} />
                      </td>
                      <td>
                        <PriorityBadge priority={g.priority} />
                      </td>
                      <td>{new Date(g.created_at).toLocaleDateString()}</td>
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
