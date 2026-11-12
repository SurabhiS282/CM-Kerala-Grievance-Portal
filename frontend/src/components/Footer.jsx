import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div>
            <h3>🏛️ CM Kerala Grievance Portal</h3>
            <p>A digital platform for citizens to submit grievances directly to the Chief Minister's Office and track their resolution.</p>
            <p className="disclaimer">⚠️ This is a recruitment prototype. Not an official Government of Kerala application.</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/how-it-works">How It Works</Link>
            <Link to="/departments">Departments</Link>
          </div>
          <div>
            <h4>Services</h4>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
            <Link to="/track">Track Grievance</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
          <div>
            <h4>Contact</h4>
            <p>📍 CMO Secretariat, Thiruvananthapuram, Kerala</p>
            <p>📞 +91 471 2333812</p>
            <p>✉️ cmo@kerala.gov.in (Demo)</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 CM Kerala Grievance Portal — Recruitment Prototype | Built for WhiteMatrix Assessment</p>
        </div>
      </div>
    </footer>
  );
}

