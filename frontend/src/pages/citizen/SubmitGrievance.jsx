import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitGrievance } from '../../services/api';

const DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
  'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur',
  'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad',
  'Kannur', 'Kasaragod'
];

const CATEGORIES = [
  'Road Maintenance', 'Water Supply', 'Healthcare', 'Education',
  'Electricity', 'Sanitation', 'Public Transport', 'Law & Order',
  'Housing', 'Agriculture', 'Other'
];

export default function SubmitGrievance() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    district: '',
    category: '',
    subject: '',
    description: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const copyReference = () => {
    if (success) {
      navigator.clipboard.writeText(success);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.district || !formData.category || !formData.subject.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('district', formData.district);
      data.append('category', formData.category);
      data.append('subject', formData.subject.trim());
      data.append('description', formData.description.trim());
      if (file) {
        data.append('file', file);
      }

      const res = await submitGrievance(data);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to submit grievance');
      }

      const result = await res.json();
      setSuccess(result.reference_number || 'Registered');
    } catch (err) {
      setError(err.message || 'Failed to submit grievance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      district: '',
      category: '',
      subject: '',
      description: '',
    });
    setFile(null);
    setSuccess(null);
    setError('');
  };

  if (success) {
    return (
      <div className="page">
        <section className="section">
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '2.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#16a34a' }}>✓</div>
            <h2 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Grievance Registered Successfully!
            </h2>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              Your grievance has been received and will be reviewed by the Chief Minister's Office.
            </p>
            <div style={{ background: '#f1f5f9', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>
                Grievance Reference Number
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a8a', letterSpacing: '1px', marginBottom: '0.75rem' }}>
                {success}
              </div>
              <button type="button" className="btn btn-outline btn-sm" onClick={copyReference}>
                {copied ? '✓ Copied!' : 'Copy Reference Number'}
              </button>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '2rem' }}>
              Please save this reference number for tracking your grievance status anytime.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/citizen/dashboard')}>
                Go to Dashboard
              </button>
              <button className="btn btn-outline" onClick={handleReset}>
                Submit Another Grievance
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="section">
        <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Submit New Grievance</h1>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
            Please provide accurate details about your complaint. Fields marked with * are required.
          </p>

          {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="district" className="form-label">District *</label>
              <select
                id="district"
                name="district"
                className="form-input"
                value={formData.district}
                onChange={handleChange}
                required
              >
                <option value="">Select District</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category" className="form-label">Category *</label>
              <select
                id="category"
                name="category"
                className="form-input"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="subject" className="form-label">Subject *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="form-input"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief summary of the issue (e.g., Road repair needed on NH 66)"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">Detailed Description *</label>
              <textarea
                id="description"
                name="description"
                className="form-input"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide complete details including location, duration of the issue, and previous attempts to resolve it"
                rows="6"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="file" className="form-label">Attachment (Optional - Photos, PDF documents)</label>
              <input
                type="file"
                id="file"
                className="form-input"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
              />
              <small className="text-muted" style={{ display: 'block', marginTop: '0.25rem' }}>
                Allowed formats: Images, PDF. Max size: 5MB.
              </small>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Submitting Grievance...' : 'Submit Grievance'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/citizen/dashboard')}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
