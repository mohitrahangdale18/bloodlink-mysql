import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Loader from '../components/Loader';
import { Save, ToggleLeft, ToggleRight, CheckCircle } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    bloodGroup: user?.bloodGroup || '',
    city: user?.city || '',
    lastDonated: '',
  });
  const [isAvailable, setIsAvailable] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get(`/donors/search?bloodGroup=${user?.bloodGroup}&city=`);
      const donors = res.data.data || [];
      const myProfile = donors.find((d) => d.userId === user?.id);
      if (myProfile) {
        setHasProfile(true);
        setForm({
          bloodGroup: myProfile.bloodGroup,
          city: myProfile.city,
          lastDonated: myProfile.lastDonated ? myProfile.lastDonated.split('T')[0] : '',
        });
        setIsAvailable(myProfile.isAvailable);
      }
    } catch {
      // No profile yet
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!form.bloodGroup || !form.city) {
      setMessage({ type: 'error', text: 'Blood group and city are required.' });
      return;
    }

    setSaving(true);
    try {
      if (hasProfile) {
        await API.put('/donors/profile', form);
        setMessage({ type: 'success', text: 'Profile updated successfully.' });
      } else {
        await API.post('/donors/profile', form);
        setHasProfile(true);
        setMessage({ type: 'success', text: 'Donor profile created successfully.' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save profile.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    if (!hasProfile) {
      setMessage({ type: 'error', text: 'Create a profile first.' });
      return;
    }

    setToggling(true);
    try {
      const res = await API.patch('/donors/availability');
      setIsAvailable(res.data.data.isAvailable);
      setMessage({ type: 'success', text: res.data.message });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to toggle availability.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setToggling(false);
    }
  };

  if (loading) return <Loader text="Loading profile..." />;

  return (
    <div className="profile-page page-section">
      <div className="container">
        <div className="profile-wrapper fade-in-up">
          <div className="profile-card card">
            <h1 className="profile-title">
              {hasProfile ? 'Update Donor Profile' : 'Create Donor Profile'}
            </h1>
            <p className="profile-subtitle text-muted text-sm">
              {hasProfile
                ? 'Update your donation details and availability'
                : 'Set up your donor profile to appear in search results'}
            </p>

            {message.text && (
              <div className={`profile-message ${message.type}`}>
                {message.type === 'success' && <CheckCircle size={16} />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-24">
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
                <label className="form-label">Last Donated</label>
                <input
                  type="date"
                  name="lastDonated"
                  className="form-input"
                  value={form.lastDonated}
                  onChange={handleChange}
                />
              </div>

              {/* Availability Toggle */}
              {hasProfile && (
                <div className="availability-row">
                  <div>
                    <span className="form-label" style={{ marginBottom: 0 }}>Available to Donate</span>
                    <p className="text-xs text-muted" style={{ marginTop: 2 }}>
                      {isAvailable ? 'You are visible in search results' : 'You are hidden from search results'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={handleToggle}
                    disabled={toggling}
                    aria-label="Toggle availability"
                  >
                    {isAvailable ? (
                      <ToggleRight size={36} className="toggle-on" />
                    ) : (
                      <ToggleLeft size={36} className="toggle-off" />
                    )}
                  </button>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-block btn-lg mt-24" disabled={saving}>
                <Save size={18} />
                {saving ? 'Saving...' : hasProfile ? 'Update Profile' : 'Create Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .profile-wrapper {
          max-width: 520px;
          margin: 0 auto;
        }

        .profile-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-dark);
        }

        .profile-subtitle {
          margin-top: 4px;
        }

        .profile-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          margin-top: 20px;
        }

        .profile-message.success {
          background: var(--success-light);
          color: var(--success);
          border: 1px solid #BBF7D0;
        }

        .profile-message.error {
          background: var(--danger-light);
          color: var(--danger);
          border: 1px solid #FECACA;
        }

        .availability-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          border-radius: 10px;
          margin-top: 4px;
        }

        .toggle-btn {
          background: none;
          border: none;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .toggle-on {
          color: var(--success);
        }

        .toggle-off {
          color: var(--text-light);
        }
      `}</style>
    </div>
  );
}
