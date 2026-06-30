import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplet, Search, UserPlus, Heart, Users, ClipboardList, ArrowRight } from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content fade-in-up">
            <div className="hero-badge">
              <Droplet size={14} />
              Community Blood Donor Network
            </div>
            <h1 className="hero-title">
              Connect with Blood Donors<br />in Your Community
            </h1>
            <p className="hero-subtitle">
              BloodLink bridges the gap between blood donors and recipients.
              Find compatible donors near you, or register to save lives in your community.
            </p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <>
                  <Link to="/search" className="btn btn-primary btn-lg">
                    <Search size={18} />
                    Find a Donor
                  </Link>
                  <Link to="/profile" className="btn btn-secondary btn-lg">
                    Donor Profile
                    <ArrowRight size={16} />
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/search" className="btn btn-primary btn-lg">
                    <Search size={18} />
                    Find a Donor
                  </Link>
                  <Link to="/register" className="btn btn-secondary btn-lg">
                    <UserPlus size={18} />
                    Become a Donor
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card card-flat fade-in">
              <div className="stat-icon-wrap">
                <Users size={20} />
              </div>
              <div className="stat-value">1,200+</div>
              <div className="stat-label">Registered Donors</div>
            </div>
            <div className="stat-card card-flat fade-in">
              <div className="stat-icon-wrap">
                <Heart size={20} />
              </div>
              <div className="stat-value">850+</div>
              <div className="stat-label">Lives Saved</div>
            </div>
            <div className="stat-card card-flat fade-in">
              <div className="stat-icon-wrap">
                <ClipboardList size={20} />
              </div>
              <div className="stat-value">400+</div>
              <div className="stat-label">Requests Fulfilled</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section page-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three simple steps to connect donors with those in need</p>

          <div className="steps-grid">
            <div className="step-card fade-in">
              <div className="step-number">1</div>
              <h3>Register & Create Profile</h3>
              <p>Sign up with your blood group and city. Set your availability so recipients can find you.</p>
            </div>
            <div className="step-card fade-in">
              <div className="step-number">2</div>
              <h3>Search Compatible Donors</h3>
              <p>Use our smart compatibility search to find donors matching your blood type and location.</p>
            </div>
            <div className="step-card fade-in">
              <div className="step-number">3</div>
              <h3>Connect & Save Lives</h3>
              <p>Create blood requests, reach out to donors directly, and help save lives in your community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="cta-section">
          <div className="container">
            <div className="cta-card">
              <h2>Ready to make a difference?</h2>
              <p>Join BloodLink today and become a part of the life-saving community.</p>
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      <style>{`
        .hero {
          padding: 80px 0 48px;
          background: var(--bg);
        }

        .hero-content {
          max-width: 640px;
          margin: 0 auto;
          text-align: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: var(--primary-lighter);
          color: var(--primary);
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 20px;
        }

        .hero-title {
          font-size: 40px;
          font-weight: 700;
          line-height: 1.2;
          color: var(--text-dark);
          margin-bottom: 16px;
          letter-spacing: -0.5px;
        }

        .hero-subtitle {
          font-size: 16px;
          color: var(--text-muted);
          line-height: 1.7;
          margin-bottom: 32px;
          max-width: 520px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* Stats */
        .stats-section {
          padding: 0 0 48px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .stat-card {
          text-align: center;
          padding: 28px 20px;
        }

        .stat-icon-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--primary-light);
          color: var(--primary);
          margin-bottom: 12px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-dark);
          line-height: 1.2;
        }

        .stat-label {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        /* How it works */
        .section-title {
          font-size: 26px;
          font-weight: 700;
          text-align: center;
          color: var(--text-dark);
          margin-bottom: 6px;
        }

        .section-subtitle {
          text-align: center;
          color: var(--text-muted);
          font-size: 15px;
          margin-bottom: 36px;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .step-card {
          padding: 28px 24px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          text-align: center;
        }

        .step-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--primary);
          color: #fff;
          font-weight: 700;
          font-size: 15px;
          margin-bottom: 14px;
        }

        .step-card h3 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--text-dark);
        }

        .step-card p {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.6;
        }

        /* CTA */
        .cta-section {
          padding: 0 0 64px;
        }

        .cta-card {
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 48px 32px;
          text-align: center;
        }

        .cta-card h2 {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 8px;
        }

        .cta-card p {
          color: var(--text-muted);
          font-size: 15px;
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .hero {
            padding: 48px 0 32px;
          }

          .hero-title {
            font-size: 28px;
          }

          .stats-grid,
          .steps-grid {
            grid-template-columns: 1fr;
          }

          .hero-actions {
            flex-direction: column;
            align-items: center;
          }

          .hero-actions .btn {
            width: 100%;
            max-width: 280px;
          }
        }
      `}</style>
    </div>
  );
}
