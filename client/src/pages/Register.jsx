import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Droplet } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    bloodGroup: '',
    city: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password || !form.bloodGroup || !form.city) {
      setError('Please fill in all required fields.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card fade-in-up" style={{ maxWidth: 480 }}>
        <div className="auth-header">
          <div className="auth-icon-wrap">
            <Droplet size={24} />
          </div>
          <h1>Create an account</h1>
          <p>Join BloodLink and start saving lives</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Blood Group *</label>
              <select
                name="bloodGroup"
                className="form-select"
                value={form.bloodGroup}
                onChange={handleChange}
              >
                <option value="">Select</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                name="city"
                className="form-input"
                placeholder="e.g. Nagpur"
                value={form.city}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone (optional)</label>
            <input
              type="tel"
              name="phone"
              className="form-input"
              placeholder="+91 9876543210"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            <UserPlus size={18} />
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>

      <style>{`
        .auth-page {
          min-height: calc(100vh - var(--navbar-height) - 120px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          padding: 36px 32px;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .auth-icon-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--primary-light);
          color: var(--primary);
          margin-bottom: 16px;
        }

        .auth-header h1 {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 4px;
        }

        .auth-header p {
          font-size: 14px;
          color: var(--text-muted);
        }

        .auth-error {
          background: var(--danger-light);
          color: var(--danger);
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #FECACA;
        }

        .auth-footer-text {
          text-align: center;
          font-size: 14px;
          color: var(--text-muted);
          margin-top: 20px;
        }

        .auth-link {
          color: var(--primary);
          font-weight: 500;
        }

        .auth-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
