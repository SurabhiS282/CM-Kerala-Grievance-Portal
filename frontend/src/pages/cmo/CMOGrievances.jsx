import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCMOGrievances } from '../../services/api';
import { StatusBadge, PriorityBadge, LoadingSpinner, EmptyState } from '../../components/UI';

const DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
  'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur',
  'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad',
  'Kannur', 'Kasaragod'
];

const STATUSES = ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Reopened'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export default function CMOGrievances() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    district: '',
    priority: '',
    search: '',
  });

  useEffect(() => {
    fetchGrievances();
  }, [filters]);

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      setError('');
      const activeFilters = {};
      if (filters.status) activeFilters.status = filters.status;
      if (filters.district) activeFilters.district = filters.district;
      if (filters.priority) activeFilters.priority = filters.priority;
      if (filters.search) activeFilters.search = filters.search;

      const data = await getCMOGrievances(activeFilters);
      setGrievances(Array.isArray(data) ? data : (data.grievances || data.data || []));
    } catch (err) {
      setError(err.message || 'Failed to load grievances.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ status: '', district: '', priority: '', search: '' });
  };

  return (
    <div className="page">
      <div className="dashboard">
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Manage Grievances</h1>
            <p className="text-muted">Review, triage, assign and escalate all citizen grievances</p>
          </div>
          <Link to="/cmo/dashboard" className="btn btn-outline">
            ← Back to Dashboard
          </Link>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        {/* Filter Bar */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
          <div className="filter-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <select
                name="status"
                className="form-input"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1', minWidth: '150px' }}>
              <select
                name="district"
                className="form-input"
                value={filters.district}
                onChange={handleFilterChange}
              >
                <option value="">All Districts</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1', minWidth: '150px' }}>
              <select
                name="priority"
                className="form-input"
                value={filters.priority}
                onChange={handleFilterChange}
              >
                <option value="">All Priorities</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: '2', minWidth: '200px' }}>
              <input
                type="text"
                name="search"
                className="form-input"
                placeholder="Search by subject, ref # or keyword..."
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>

            <button type="button" className="btn btn-outline" onClick={clearFilters}>
              Reset Filters
            </button>
          </div>
        </div>

        {/* Grievances List */}
        {loading ? (
          <LoadingSpinner />
        ) : grievances.length === 0 ? (
          <EmptyState message="No grievances found matching the selected filters." />
        ) : (
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ref #</th>
                    <th>Subject</th>
                    <th>District</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Submitted Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {grievances.map((g) => (
                    <tr key={g.id}>
                      <td>
                        <Link to={`/cmo/grievance/${g.id}`} style={{ fontWeight: 600 }}>
                          {g.reference_number}
                        </Link>
                      </td>
                      <td>{g.subject}</td>
                      <td>{g.district}</td>
                      <td><StatusBadge status={g.status} /></td>
                      <td><PriorityBadge priority={g.priority} /></td>
                      <td>{new Date(g.created_at).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/cmo/grievance/${g.id}`} className="btn btn-primary btn-sm">
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
