import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import API from '../api/axios';
import Badge from '../components/Badge';
import Loader from '../components/Loader';
import {
  Droplet,
  MapPin,
  Search,
  ClipboardPlus,
  ClipboardList,
  UserCog,
  Heart,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [donorProfile, setDonorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonorProfile();
  }, []);

  const fetchDonorProfile = async () => {
    try {
      // Try to get donor profile via search with user's blood group
      const res = await API.get(`/donors/search?bloodGroup=${user?.bloodGroup}&city=`);
      const donors = res.data.data || [];
      const myProfile = donors.find((d) => d.userId === user?.id);
      setDonorProfile(myProfile || null);
    } catch {
      setDonorProfile(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Loading dashboard..." />;

  return (
    <div className="dashboard-page page-section">
      <div className="container">
        {/* Welcome */}
        <div className="dashboard-welcome fade-in">
          <div>
            <h1 className="dashboard-title">Welcome, {user?.name || 'User'}</h1>
            <p className="dashboard-subtitle">Manage your blood donation profile and requests</p>
          </div>
          <Badge variant="primary">
            <Droplet size={14} />
            {user?.bloodGroup}
          </Badge>
        </div>

        {/* Stat Cards */}
        <div className="dashboard-stats mt-32 fade-in">
          <div className="card-flat dashboard-stat-card">
            <div className="stat-card-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <MapPin size={20} />
            </div>
            <div>
              <div className="stat-card-label">City</div>
              <div className="stat-card-value">{user?.city || '—'}</div>
            </div>
          </div>

          <div className="card-flat dashboard-stat-card">
            <div className="stat-card-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
              {donorProfile?.isAvailable ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            </div>
            <div>
              <div className="stat-card-label">Availability</div>
              <div className="stat-card-value">
                {donorProfile ? (donorProfile.isAvailable ? 'Available' : 'Unavailable') : 'No profile'}
              </div>
            </div>
          </div>

          <div className="card-flat dashboard-stat-card">
            <div className="stat-card-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
              <Heart size={20} />
            </div>
            <div>
              <div className="stat-card-label">Total Donations</div>
              <div className="stat-card-value">{donorProfile?.totalDonations || 0}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="dashboard-section-title mt-48">Quick Actions</h2>
        <div className="dashboard-actions mt-16 fade-in">
          <Link to="/profile" className="action-card card">
            <UserCog size={22} className="action-icon" />
            <h3>Donor Profile</h3>
            <p>Create or update your donor profile</p>
          </Link>

          <Link to="/search" className="action-card card">
            <Search size={22} className="action-icon" />
            <h3>Search Donors</h3>
            <p>Find compatible blood donors</p>
          </Link>

          <Link to="/requests" className="action-card card">
            <ClipboardPlus size={22} className="action-icon" />
            <h3>Create Request</h3>
            <p>Post a new blood request</p>
          </Link>

          <Link to="/requests" className="action-card card">
            <ClipboardList size={22} className="action-icon" />
            <h3>View Requests</h3>
            <p>Browse all blood requests</p>
          </Link>
        </div>
      </div>

      <style>{`
        .dashboard-welcome {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .dashboard-title {
          font-size: 26px;
          font-weight: 700;
          color: var(--text-dark);
        }

        .dashboard-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .dashboard-stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 20px;
        }

        .stat-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-card-label {
          font-size: 12px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-card-value {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-dark);
          margin-top: 2px;
        }

        .dashboard-section-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-dark);
        }

        .dashboard-actions {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .action-card {
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: transform var(--transition), box-shadow var(--transition);
          cursor: pointer;
        }

        .action-card:hover {
          transform: translateY(-2px);
        }

        .action-icon {
          color: var(--primary);
        }

        .action-card h3 {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-dark);
        }

        .action-card p {
          font-size: 13px;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .dashboard-stats {
            grid-template-columns: 1fr;
          }

          .dashboard-actions {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 480px) {
          .dashboard-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
