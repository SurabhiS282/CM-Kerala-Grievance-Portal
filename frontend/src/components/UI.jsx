export function StatusBadge({ status }) {
  const colors = {
    'Submitted': 'badge-blue',
    'Under Review': 'badge-orange',
    'In Progress': 'badge-yellow',
    'Resolved': 'badge-green',
    'Reopened': 'badge-red',
  };
  return <span className={`badge ${colors[status] || 'badge-gray'}`}>{status}</span>;
}

export function PriorityBadge({ priority }) {
  const colors = {
    'High': 'badge-red',
    'Medium': 'badge-orange',
    'Low': 'badge-green',
  };
  if (!priority) return <span className="badge badge-gray">—</span>;
  return <span className={`badge ${colors[priority] || 'badge-gray'}`}>{priority}</span>;
}

export function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
}

export function EmptyState({ message = "No data available", icon = "📭" }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <p>{message}</p>
    </div>
  );
}

export function StatCard({ title, value, icon, color = "blue" }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
      </div>
    </div>
  );
}

