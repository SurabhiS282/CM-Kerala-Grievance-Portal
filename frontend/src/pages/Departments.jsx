import { useState, useEffect } from 'react';
import { getDepartments } from '../services/api';
import { LoadingSpinner, EmptyState } from '../components/UI';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const data = await getDepartments();
        setDepartments(Array.isArray(data) ? data : data.departments || []);
      } catch (err) {
        setError(err.message || 'Failed to load departments');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <LoadingSpinner message="Loading departments..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <section className="section">
          <div className="alert alert-error">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="page">
        <section className="section">
          <h1 className="page-title">Government Departments</h1>
          <EmptyState
            title="No Departments Available"
            message="Department information is currently being updated. Please check back later."
          />
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="section">
        <h1 className="page-title">Government Departments</h1>
        <p className="page-subtitle">
          Browse the government departments handling citizen grievances across Kerala.
        </p>
      </section>

      <section className="section">
        <div className="grid grid-3">
          {departments.map((dept) => (
            <div className="card" key={dept.id || dept.code}>
              <div className="card-header">
                <span className="department-code">{dept.code}</span>
              </div>
              <h3 className="card-title">{dept.name}</h3>
              <p className="card-description">
                {dept.description || 'Government department responsible for handling citizen grievances in this sector.'}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
