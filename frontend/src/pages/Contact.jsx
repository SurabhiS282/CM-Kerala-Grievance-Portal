import { useState } from 'react';
import { Link } from 'react-router-dom';
import { submitContact } from '../services/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess(false);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSubmitting(true);
      await submitContact(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setApiError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <section className="section">
        <h1 className="page-title">Contact Us</h1>
        <p className="page-subtitle">
          Have questions or need assistance? Reach out to us and we will get back
          to you as soon as possible.
        </p>
      </section>

      <section className="section">
        <div className="grid grid-contact">
          {/* Contact Form */}
          <div className="card">
            <h2 className="card-title">Send a Message</h2>

            {success && (
              <div className="alert alert-success">
                Your message has been sent successfully. We will respond within 2-3
                business days.
              </div>
            )}

            {apiError && (
              <div className="alert alert-error">{apiError}</div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="subject" className="form-label">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className={`form-input ${errors.subject ? 'form-input-error' : ''}`}
                  placeholder="Enter the subject"
                  value={formData.subject}
                  onChange={handleChange}
                />
                {errors.subject && <span className="form-error">{errors.subject}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  className={`form-input form-textarea ${errors.message ? 'form-input-error' : ''}`}
                  placeholder="Enter your message"
                  value={formData.message}
                  onChange={handleChange}
                />
                {errors.message && <span className="form-error">{errors.message}</span>}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={submitting}
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Info Sidebar */}
          <div className="contact-sidebar">
            <div className="card">
              <h3 className="card-title">Contact Information</h3>
              <div className="contact-info-list">
                <div className="contact-info-item">
                  <span className="contact-info-label">Address</span>
                  <p className="contact-info-value">
                    Chief Minister's Office<br />
                    Government Secretariat<br />
                    Thiruvananthapuram, Kerala 695001
                  </p>
                </div>
                <div className="contact-info-item">
                  <span className="contact-info-label">Phone</span>
                  <p className="contact-info-value">+91 471 2333 812</p>
                </div>
                <div className="contact-info-item">
                  <span className="contact-info-label">Email</span>
                  <p className="contact-info-value">grievance@kerala.gov.in</p>
                </div>
                <div className="contact-info-item">
                  <span className="contact-info-label">Working Hours</span>
                  <p className="contact-info-value">
                    Monday - Friday: 10:00 AM - 5:00 PM<br />
                    Saturday: 10:00 AM - 1:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">Quick Links</h3>
              <ul className="quick-links">
                <li><Link to="/faq">Frequently Asked Questions</Link></li>
                <li><Link to="/how-it-works">How It Works</Link></li>
                <li><Link to="/track">Track Your Grievance</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
