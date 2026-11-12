import { Link } from 'react-router-dom';

export default function Home() {
  const steps = [
    { icon: '📝', title: 'Submit', description: 'Register and submit your grievance online with supporting documents' },
    { icon: '🔍', title: 'Review', description: 'CMO reviews and assigns your grievance to the relevant department' },
    { icon: '⚙️', title: 'Action', description: 'Department officer investigates and takes necessary action' },
    { icon: '✅', title: 'Resolved', description: 'Grievance is resolved and you are notified of the outcome' },
  ];

  const stats = [
    { label: 'Total Grievances', value: '1,247' },
    { label: 'Resolved', value: '1,089' },
    { label: 'Departments', value: '10' },
    { label: 'Districts Covered', value: '14' },
  ];

  const departments = [
    { icon: '🏥', name: 'Health & Family Welfare', description: 'Public health services, hospitals, and medical infrastructure' },
    { icon: '🎓', name: 'Education', description: 'Schools, colleges, scholarships, and academic institutions' },
    { icon: '🛣️', name: 'Public Works', description: 'Roads, bridges, buildings, and public infrastructure' },
    { icon: '💡', name: 'Power & Energy', description: 'Electricity supply, billing, and energy infrastructure' },
    { icon: '💧', name: 'Water Resources', description: 'Water supply, irrigation, and water management' },
  ];

  return (
    <div className="page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Chief Minister's Public Grievance Redressal Portal</h1>
          <p className="hero-subtitle">
            Empowering citizens of Kerala to voice their concerns directly to the
            government. A transparent, efficient, and accountable system for resolving
            public grievances.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Register Grievance
            </Link>
            <Link to="/track" className="btn btn-outline btn-lg">
              Track Grievance
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section section-highlighted">
        <h2 className="section-title">Portal Statistics</h2>
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div className="stat-card" key={index}>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">A simple four-step process to address your concerns</p>
        <div className="steps-grid">
          {steps.map((step, index) => (
            <div className="step-card" key={index}>
              <div className="step-icon">{step.icon}</div>
              <div className="step-number">Step {index + 1}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Departments */}
      <section className="section">
        <h2 className="section-title">Featured Departments</h2>
        <p className="section-subtitle">Key government departments handling citizen grievances</p>
        <div className="grid grid-3">
          {departments.map((dept, index) => (
            <div className="card" key={index}>
              <div className="card-icon">{dept.icon}</div>
              <h3 className="card-title">{dept.name}</h3>
              <p className="card-description">{dept.description}</p>
            </div>
          ))}
        </div>
        <div className="section-action" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/departments" className="btn btn-outline">View All Departments</Link>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section section-cta">
        <h2 className="section-title">Submit Your Grievance Today</h2>
        <p className="section-subtitle">
          Your voice matters. Help us build a more responsive and accountable
          government by reporting issues that affect your community.
        </p>
        <div className="hero-actions" style={{ marginTop: '1.5rem' }}>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started
          </Link>
          <Link to="/how-it-works" className="btn btn-outline btn-lg">
            Learn More
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="disclaimer" style={{ marginTop: '2rem', padding: '1rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <p>
          ⚠️ This is a recruitment prototype for WhiteMatrix assessment. Not an
          official Government of Kerala application.
        </p>
      </div>
    </div>
  );
}
