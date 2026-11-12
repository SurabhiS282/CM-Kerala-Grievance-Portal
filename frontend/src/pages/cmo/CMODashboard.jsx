import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCMOStats } from '../../services/api';
import { StatusBadge, PriorityBadge, LoadingSpinner, StatCard } from '../../components/UI';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export default function CMODashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getCMOStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
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

  const districtData = stats?.district_wise || [];

  const statusData = [
    { name: 'Pending Review', value: stats?.pending || 0 },
    { name: 'In Progress', value: stats?.in_progress || 0 },
    { name: 'Resolved', value: stats?.resolved || 0 },
    { name: 'Reopened', value: stats?.reopened || 0 },
  ].filter((item) => item.value > 0);

  const recentGrievances = stats?.recent || [];

  return (
    <div className="page">
      <div className="dashboard">
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem' }}>CMO Admin Dashboard</h1>
            <p className="text-muted">Chief Minister's Office Grievance Monitoring & Oversight</p>
          </div>
          <Link to="/cmo/grievances" className="btn btn-primary">
            View All Grievances
          </Link>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        {/* Stat Cards */}
        <div className="stat-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard title="Total Grievances" value={stats?.total || 0} icon="📊" color="blue" />
          <StatCard title="Pending Review" value={stats?.pending || 0} icon="⏳" color="yellow" />
          <StatCard title="In Progress" value={stats?.in_progress || 0} icon="⚙️" color="orange" />
          <StatCard title="Resolved" value={stats?.resolved || 0} icon="✅" color="green" />
          <StatCard title="Overdue" value={stats?.overdue || 0} icon="⚠️" color="red" />
        </div>

        {/* Charts Grid */}
        <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* District Distribution BarChart */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>District-wise Grievances</h3>
            {districtData.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center', padding: '3rem 0' }}>No district data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={districtData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="district" angle={-45} textAnchor="end" interval={0} fontSize={11} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" name="Grievances" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Status Distribution PieChart */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>Status Distribution</h3>
            {statusData.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center', padding: '3rem 0' }}>No status data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="45%"
                    outerRadius={85}
                    innerRadius={40}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Grievances Table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Recent Grievances</h3>
            <Link to="/cmo/grievances" className="btn btn-outline btn-sm">
              View All ({stats?.total || 0})
            </Link>
          </div>

          {recentGrievances.length === 0 ? (
            <p className="text-muted">No recent grievances found.</p>
          ) : (
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
                  </tr>
                </thead>
                <tbody>
                  {recentGrievances.map((g) => (
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
                      <td>{g.created_at ? new Date(g.created_at).toLocaleDateString() : 'N/A'}</td>
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
