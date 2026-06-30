import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplet, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMobileOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <Droplet size={22} className="brand-icon" />
          <span className="brand-text">BloodLink</span>
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`navbar-menu ${mobileOpen ? 'open' : ''}`}>
          <div className="navbar-links">
            <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
            {isAuthenticated && (
              <>
                <Link to="/search" className="nav-link" onClick={closeMenu}>Search</Link>
                <Link to="/requests" className="nav-link" onClick={closeMenu}>Requests</Link>
              </>
            )}
          </div>

          <div className="navbar-actions">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-link" onClick={closeMenu}>Dashboard</Link>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link" onClick={closeMenu}>Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>Register</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: var(--navbar-height);
          background: var(--bg);
          border-bottom: 1px solid var(--border);
          z-index: 100;
        }

        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 18px;
          color: var(--text-dark);
        }

        .brand-icon {
          color: var(--primary);
          fill: var(--primary-light);
        }

        .navbar-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--text-dark);
          padding: 4px;
        }

        .navbar-menu {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-link {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-muted);
          padding: 6px 12px;
          border-radius: 6px;
          transition: color var(--transition), background var(--transition);
        }

        .nav-link:hover {
          color: var(--text-dark);
          background: var(--bg-subtle);
        }

        @media (max-width: 768px) {
          .navbar-toggle {
            display: block;
          }

          .navbar-menu {
            display: none;
            position: absolute;
            top: var(--navbar-height);
            left: 0;
            right: 0;
            background: var(--bg);
            border-bottom: 1px solid var(--border);
            flex-direction: column;
            padding: 16px 24px;
            gap: 16px;
          }

          .navbar-menu.open {
            display: flex;
          }

          .navbar-links,
          .navbar-actions {
            flex-direction: column;
            width: 100%;
            gap: 4px;
          }

          .nav-link {
            width: 100%;
            padding: 10px 12px;
          }

          .navbar-actions .btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </nav>
  );
}
