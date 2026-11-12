import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await login(formData.email, formData.password);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Invalid email or password');
      }

      const data = await res.json();
      loginUser(data.access_token, data.user);

      // Navigate based on role
      const role = data.user?.role;
      if (role === 'cmo_admin') {
        navigate('/cmo/dashboard');
      } else if (role === 'officer') {
        navigate('/officer/dashboard');
      } else {
        navigate('/citizen/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <section className="section">
        <div className="auth-container">
          <div className="card auth-card">
            <h1 className="auth-title">Sign In</h1>
            <p className="auth-subtitle">
              Access your account to submit and manage grievances
            </p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="auth-footer" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="auth-link">Create Account</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
