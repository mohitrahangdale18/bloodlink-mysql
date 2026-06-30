import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Droplet } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card fade-in-up">
        <div className="auth-header">
          <div className="auth-icon-wrap">
            <Droplet size={24} />
          </div>
          <h1>Welcome back</h1>
          <p>Sign in to your BloodLink account</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
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
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            <LogIn size={18} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer-text">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Register</Link>
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
