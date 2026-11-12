import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'citizen') return '/citizen/dashboard';
    if (user.role === 'cmo_admin') return '/cmo/dashboard';
    if (user.role === 'officer') return '/officer/dashboard';
    return '/';
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🏛️</span>
          <div>
            <div className="logo-title">CM Kerala</div>
            <div className="logo-subtitle">Grievance Portal</div>
          </div>
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/how-it-works">How It Works</Link>
          <Link to="/departments">Departments</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <Link to={getDashboardLink()} className="btn btn-outline btn-sm">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn btn-sm">
                Logout
              </button>
              <span className="nav-user">{user.full_name}</span>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

