import { useState } from 'react';
import { register } from '../services/api';
import { Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile_number: '',
    password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validate = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.mobile_number.trim()) {
      newErrors.mobile_number = 'Mobile number is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      // const { confirm_password, ...submitData } = formData;
      const res = await register(formData);
      // const res = await register(submitData);
      // if (!res.ok) {
      //   const errData = await res.json().catch(() => ({}));
      //   throw new Error(errData.detail || 'Registration failed. Please try again.');
      // }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));

        let message = 'Registration failed. Please try again.';

        if (typeof errData.detail === 'string') {
          message = errData.detail;
        } else if (Array.isArray(errData.detail)) {
          message = errData.detail
            .map((item) => item.msg || 'Invalid input')
            .join(', ');
        } else if (errData.detail) {
          message = JSON.stringify(errData.detail);
        }

        throw new Error(message);
      }
      setSuccess(true);
    } catch (err) {
      setApiError(
        err.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page">
        <section className="section">
          <div className="auth-container">
            <div className="card auth-card">
              <div className="auth-success">
                <h2 className="auth-title">Registration Successful!</h2>
                <p className="auth-subtitle">
                  Your account has been created successfully. Please login to
                  access the portal.
                </p>
                <Link to="/login" className="btn btn-primary btn-block">
                  Go to Login
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="section">
        <div className="auth-container">
          <div className="card auth-card">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">
              Register to submit and track grievances on the portal
            </p>

            {apiError && <div className="alert alert-error">{apiError}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="full_name" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  className={`form-input ${errors.full_name ? 'form-input-error' : ''}`}
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                />
                {errors.full_name && <span className="form-error">{errors.full_name}</span>}
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
                  autoComplete="email"
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="mobile_number" className="form-label">Mobile Number</label>
                <input
                  type="tel"
                  id="mobile_number"
                  name="mobile_number"
                  className={`form-input ${errors.mobile_number ? 'form-input-error' : ''}`}
                  placeholder="Enter your mobile number"
                  value={formData.mobile_number}
                  onChange={handleChange}
                />
                {errors.mobile_number && <span className="form-error">{errors.mobile_number}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                  placeholder="Create a password (min 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirm_password" className="form-label">Confirm Password</label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  className={`form-input ${errors.confirm_password ? 'form-input-error' : ''}`}
                  placeholder="Confirm your password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                {errors.confirm_password && (
                  <span className="form-error">{errors.confirm_password}</span>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
