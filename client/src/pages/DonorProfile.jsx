import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Loader from '../components/Loader';
import {
  Save,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  MapPin,
  Crosshair,
  AlertCircle,
  X,
  ShieldCheck,
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    bloodGroup: user?.bloodGroup || '',
    city: user?.city || '',
    lastDonated: '',
    latitude: '',
    longitude: '',
  });
  const [isAvailable, setIsAvailable] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // First try the dedicated profile endpoint
        try {
          const res = await API.get('/donors/profile');
          if (res.data?.data) {
            const profile = res.data.data;
            setHasProfile(true);
            setForm({
              bloodGroup: profile.bloodGroup || '',
              city: profile.city || '',
              lastDonated: profile.lastDonated ? profile.lastDonated.split('T')[0] : '',
              latitude: profile.latitude !== null && profile.latitude !== undefined ? profile.latitude : '',
              longitude: profile.longitude !== null && profile.longitude !== undefined ? profile.longitude : '',
            });
            setIsAvailable(profile.isAvailable);
            if (profile.latitude !== null && profile.latitude !== undefined) {
              setShowManualLocation(true);
            }
            return;
          }
        } catch (profileErr) {
          // If 404, user doesn't have a profile yet. Otherwise fallback to search.
          if (profileErr.response?.status !== 404) {
            const res = await API.get(`/donors/search?bloodGroup=${user?.bloodGroup}&city=`);
            const donors = res.data.data || [];
            const myProfile = donors.find((d) => d.userId === user?.id);
            if (myProfile) {
              setHasProfile(true);
              setForm({
                bloodGroup: myProfile.bloodGroup || '',
                city: myProfile.city || '',
                lastDonated: myProfile.lastDonated ? myProfile.lastDonated.split('T')[0] : '',
                latitude: '',
                longitude: '',
              });
              setIsAvailable(myProfile.isAvailable);
            }
          }
        }
      } catch {
        // No profile yet or error loading
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.bloodGroup, user?.id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' });
  };

  const handleDetectLocation = () => {
    setGeoError('');
    setMessage({ type: '', text: '' });

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Please enter coordinates manually.');
      setShowManualLocation(true);
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        setForm((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));
        setGeoLoading(false);
        setShowManualLocation(true);
        setMessage({
          type: 'success',
          text: `Location detected (${lat}, ${lng}). Click Save Profile to apply.`,
        });
      },
      (error) => {
        setGeoLoading(false);
        let errorMsg = 'Unable to retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied. You can enter your coordinates manually below.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is unavailable on your device. Please enter coordinates manually.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out. Please enter coordinates manually.';
        }
        setGeoError(errorMsg);
        setShowManualLocation(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleClearLocation = () => {
    setForm((prev) => ({
      ...prev,
      latitude: '',
      longitude: '',
    }));
    setGeoError('');
    setMessage({
      type: '',
      text: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setGeoError('');

    if (!form.bloodGroup || !form.city) {
      setMessage({ type: 'error', text: 'Blood group and city are required.' });
      return;
    }

    // Validate coordinates if provided
    const hasLat = form.latitude !== '' && form.latitude !== null && form.latitude !== undefined;
    const hasLng = form.longitude !== '' && form.longitude !== null && form.longitude !== undefined;

    if (hasLat || hasLng) {
      if (!hasLat || !hasLng) {
        setMessage({
          type: 'error',
          text: 'Both latitude and longitude are required when setting location coordinates.',
        });
        return;
      }

      const numLat = parseFloat(form.latitude);
      const numLng = parseFloat(form.longitude);

      if (isNaN(numLat) || numLat < -90 || numLat > 90) {
        setMessage({ type: 'error', text: 'Latitude must be a valid number between -90 and 90.' });
        return;
      }

      if (isNaN(numLng) || numLng < -180 || numLng > 180) {
        setMessage({ type: 'error', text: 'Longitude must be a valid number between -180 and 180.' });
        return;
      }
    }

    const payload = {
      bloodGroup: form.bloodGroup,
      city: form.city,
      lastDonated: form.lastDonated || null,
      latitude: hasLat ? parseFloat(form.latitude) : null,
      longitude: hasLng ? parseFloat(form.longitude) : null,
    };

    setSaving(true);
    try {
      if (hasProfile) {
        await API.put('/donors/profile', payload);
        setMessage({ type: 'success', text: 'Profile updated successfully.' });
      } else {
        await API.post('/donors/profile', payload);
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

  const isLocationSet =
    form.latitude !== '' &&
    form.latitude !== null &&
    form.longitude !== '' &&
    form.longitude !== null;

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
                ? 'Update your donation details, location, and availability'
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

              {/* Location (Coordinates) Section */}
              <div className="location-section">
                <div className="location-section-header">
                  <div>
                    <span className="form-label" style={{ marginBottom: 2 }}>
                      <MapPin size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom', color: 'var(--primary)' }} />
                      Donor Location (GPS Coordinates)
                    </span>
                    <p className="text-xs text-muted">
                      Setting your location helps nearby patients find you during emergencies.
                    </p>
                  </div>
                  {isLocationSet && (
                    <button
                      type="button"
                      className="btn-link text-xs text-muted"
                      onClick={handleClearLocation}
                      title="Clear location coordinates"
                    >
                      <X size={13} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Clear
                    </button>
                  )}
                </div>

                {isLocationSet ? (
                  <div className="location-status-box active">
                    <CheckCircle size={16} className="text-success" />
                    <div className="location-status-info">
                      <span className="location-status-title">Location Configured</span>
                      <span className="location-status-coords">
                        Lat: {Number(form.latitude).toFixed(4)}, Lng: {Number(form.longitude).toFixed(4)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="location-status-box inactive">
                    <MapPin size={16} className="text-muted" />
                    <div className="location-status-info">
                      <span className="location-status-title">No location coordinates set</span>
                      <span className="text-xs text-muted">
                        Click below to auto-detect via browser or enter manually.
                      </span>
                    </div>
                  </div>
                )}

                <div className="location-actions mt-12">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleDetectLocation}
                    disabled={geoLoading}
                  >
                    <Crosshair size={14} />
                    {geoLoading ? 'Detecting GPS...' : isLocationSet ? 'Update GPS Location' : 'Detect My Location'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowManualLocation(!showManualLocation)}
                  >
                    {showManualLocation ? 'Hide Manual Inputs' : 'Enter Coordinates Manually'}
                  </button>
                </div>

                {geoError && (
                  <div className="geo-error-alert mt-12">
                    <AlertCircle size={15} />
                    <span>{geoError}</span>
                  </div>
                )}

                {showManualLocation && (
                  <div className="manual-coords-grid mt-16 fade-in">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label text-xs">Latitude (-90 to 90)</label>
                      <input
                        type="number"
                        step="any"
                        name="latitude"
                        className="form-input"
                        placeholder="e.g. 21.145800"
                        value={form.latitude}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label text-xs">Longitude (-180 to 180)</label>
                      <input
                        type="number"
                        step="any"
                        name="longitude"
                        className="form-input"
                        placeholder="e.g. 79.088200"
                        value={form.longitude}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}

                <div className="privacy-notice mt-12">
                  <ShieldCheck size={14} className="privacy-icon" />
                  <span>
                    Privacy protected: Your exact coordinates are never shown to recipients. Only approximate distance is calculated.
                  </span>
                </div>
              </div>

              {/* Availability Toggle */}
              {hasProfile && (
                <div className="availability-row mt-20">
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

        .location-section {
          padding: 16px;
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          border-radius: 10px;
          margin-top: 20px;
        }

        .location-section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .btn-link {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          padding: 0;
          font-weight: 500;
        }

        .btn-link:hover {
          color: var(--danger);
        }

        .location-status-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 13px;
        }

        .location-status-box.active {
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          color: var(--text-dark);
        }

        .location-status-box.inactive {
          background: var(--bg-muted);
          border: 1px solid var(--border);
          color: var(--text-muted);
        }

        .location-status-info {
          display: flex;
          flex-direction: column;
        }

        .location-status-title {
          font-weight: 600;
          font-size: 13px;
        }

        .location-status-coords {
          font-size: 12px;
          color: var(--text-muted);
        }

        .location-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .geo-error-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #FFFBEB;
          color: #B45309;
          border: 1px solid #FDE68A;
          border-radius: 6px;
          font-size: 12px;
          line-height: 1.4;
        }

        .manual-coords-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .privacy-notice {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 11px;
          color: var(--text-light);
          line-height: 1.4;
        }

        .privacy-icon {
          flex-shrink: 0;
          color: var(--success);
          margin-top: 1px;
        }

        .availability-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          border-radius: 10px;
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
