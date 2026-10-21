import { useState } from 'react';
import API from '../api/axios';
import DonorCard from '../components/DonorCard';
import Loader from '../components/Loader';
import {
  Search,
  Droplet,
  MapPin,
  Users,
  Navigation,
  Crosshair,
  AlertCircle,
  X,
  Compass,
  Building2,
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const RADIUS_OPTIONS = [5, 10, 25, 50];

export default function SearchDonors() {
  const [searchMode, setSearchMode] = useState('nearby'); // 'nearby' | 'city'
  const [bloodGroup, setBloodGroup] = useState('');
  const [radius, setRadius] = useState(10);
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationName, setLocationName] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [showManualCoords, setShowManualCoords] = useState(false);

  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [lastSearchParams, setLastSearchParams] = useState(null);

  // Obtain user's browser geolocation with permission
  const handleGetLocation = () => {
    setGeoError('');
    setError('');

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Please enter coordinates manually.');
      setShowManualCoords(true);
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        setLocationName('Current Location');
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        let msg = 'Unable to access your location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can enter coordinates manually below or switch to City search.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable on your device. Please enter coordinates manually.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please try again or enter coordinates manually.';
        }
        setGeoError(msg);
        setShowManualCoords(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleClearLocation = () => {
    setLatitude('');
    setLongitude('');
    setLocationName('');
    setGeoError('');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setGeoError('');

    if (!bloodGroup) {
      setError('Please select a recipient blood group.');
      return;
    }

    const params = new URLSearchParams({ bloodGroup });

    if (searchMode === 'nearby') {
      const hasLat = latitude !== '' && latitude !== null && latitude !== undefined;
      const hasLng = longitude !== '' && longitude !== null && longitude !== undefined;

      if (!hasLat || !hasLng) {
        setError('Please use "Current Location" or provide latitude and longitude coordinates.');
        return;
      }

      const numLat = parseFloat(latitude);
      const numLng = parseFloat(longitude);

      if (isNaN(numLat) || numLat < -90 || numLat > 90) {
        setError('Latitude must be a valid number between -90 and 90.');
        return;
      }

      if (isNaN(numLng) || numLng < -180 || numLng > 180) {
        setError('Longitude must be a valid number between -180 and 180.');
        return;
      }

      params.append('latitude', numLat);
      params.append('longitude', numLng);
      params.append('radius', radius);
    } else {
      // City mode
      if (city.trim()) {
        params.append('city', city.trim());
      }
    }

    setLoading(true);
    setSearched(true);
    try {
      const res = await API.get(`/donors/search?${params.toString()}`);
      setDonors(res.data.data || []);
      setLastSearchParams({
        mode: searchMode,
        bloodGroup,
        radius: searchMode === 'nearby' ? radius : null,
        city: searchMode === 'city' ? city.trim() : null,
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to search donors. Please check connection and try again.';
      setError(msg);
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  const hasCoords = latitude !== '' && longitude !== '';

  return (
    <div className="search-page page-section">
      <div className="container">
        <div className="search-header fade-in">
          <h1 className="page-title">Find Compatible Blood Donors</h1>
          <p className="text-muted">
            Search nearby verified donors by radius or search by city name
          </p>
        </div>

        {/* Search Mode Toggle */}
        <div className="search-mode-tabs mt-20 fade-in">
          <button
            type="button"
            className={`mode-tab ${searchMode === 'nearby' ? 'active' : ''}`}
            onClick={() => {
              setSearchMode('nearby');
              setError('');
            }}
          >
            <Compass size={16} />
            Nearby Search (Radius)
          </button>
          <button
            type="button"
            className={`mode-tab ${searchMode === 'city' ? 'active' : ''}`}
            onClick={() => {
              setSearchMode('city');
              setError('');
            }}
          >
            <Building2 size={16} />
            Search by City
          </button>
        </div>

        {/* Filter Card */}
        <form className="search-bar card-flat mt-16 fade-in" onSubmit={handleSearch}>
          {searchMode === 'nearby' ? (
            <div className="nearby-controls">
              {/* Row 1: Blood group and Radius */}
              <div className="search-row">
                <div className="search-field bg-field">
                  <label className="field-label">Recipient Blood Group *</label>
                  <div className="field-input-wrap">
                    <Droplet size={16} className="search-field-icon" />
                    <select
                      className="form-select"
                      value={bloodGroup}
                      onChange={(e) => {
                        setBloodGroup(e.target.value);
                        setError('');
                      }}
                    >
                      <option value="">Select Blood Group</option>
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="search-field radius-field">
                  <label className="field-label">Search Radius</label>
                  <div className="radius-pills">
                    {RADIUS_OPTIONS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={`radius-pill ${radius === r ? 'active' : ''}`}
                        onClick={() => setRadius(r)}
                      >
                        {r} km
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Location selector */}
              <div className="location-bar mt-16">
                <div className="location-bar-main">
                  {hasCoords ? (
                    <div className="location-pill active">
                      <Crosshair size={14} className="text-primary" />
                      <span className="location-pill-text">
                        {locationName || 'Location'} (~{Number(latitude).toFixed(3)}, ~{Number(longitude).toFixed(3)})
                      </span>
                      <button
                        type="button"
                        className="location-clear-btn"
                        onClick={handleClearLocation}
                        title="Remove location"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary location-detect-btn"
                      onClick={handleGetLocation}
                      disabled={geoLoading}
                    >
                      <Crosshair size={15} />
                      {geoLoading ? 'Detecting Location...' : 'Use My Current Location'}
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn-link text-xs text-muted coords-toggle-btn"
                    onClick={() => setShowManualCoords(!showManualCoords)}
                  >
                    {showManualCoords ? 'Hide Manual Coordinates' : 'Manual Coordinates Fallback'}
                  </button>
                </div>

                <button type="submit" className="btn btn-primary search-submit-btn" disabled={loading}>
                  <Search size={16} />
                  {loading ? 'Searching...' : `Search Within ${radius} km`}
                </button>
              </div>

              {/* Manual coordinates collapsible */}
              {showManualCoords && (
                <div className="manual-coords-row mt-12 fade-in">
                  <div className="coord-field">
                    <label className="field-label text-xs">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input form-input-sm"
                      placeholder="e.g. 21.145800"
                      value={latitude}
                      onChange={(e) => {
                        setLatitude(e.target.value);
                        setLocationName('Custom Coordinates');
                        setError('');
                      }}
                    />
                  </div>
                  <div className="coord-field">
                    <label className="field-label text-xs">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input form-input-sm"
                      placeholder="e.g. 79.088200"
                      value={longitude}
                      onChange={(e) => {
                        setLongitude(e.target.value);
                        setLocationName('Custom Coordinates');
                        setError('');
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* City mode */
            <div className="city-controls">
              <div className="search-fields">
                <div className="search-field">
                  <Droplet size={16} className="search-field-icon" />
                  <select
                    className="form-select"
                    value={bloodGroup}
                    onChange={(e) => {
                      setBloodGroup(e.target.value);
                      setError('');
                    }}
                  >
                    <option value="">Select Blood Group</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div className="search-field">
                  <MapPin size={16} className="search-field-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="City (optional, e.g. Nagpur)"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <Search size={16} />
                  {loading ? 'Searching...' : 'Search Donors'}
                </button>
              </div>
            </div>
          )}

          {/* Geo error message */}
          {geoError && (
            <div className="alert-box alert-warning mt-12 fade-in">
              <AlertCircle size={15} />
              <span>{geoError}</span>
            </div>
          )}

          {/* General / API error */}
          {error && (
            <div className="alert-box alert-danger mt-12 fade-in">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Search Results */}
        <div className="search-results mt-32">
          {loading ? (
            <Loader text="Searching nearby compatible donors..." />
          ) : searched && donors.length === 0 ? (
            <div className="empty-state card fade-in">
              <Users size={44} className="empty-icon" />
              <h3>No compatible donors found</h3>
              <p className="text-muted text-sm">
                {lastSearchParams?.mode === 'nearby'
                  ? `No available donors found within ${lastSearchParams.radius} km for ${lastSearchParams.bloodGroup}. Try selecting a wider radius (e.g. 25 km or 50 km).`
                  : `No available donors found matching "${lastSearchParams?.bloodGroup}" in ${lastSearchParams?.city || 'the selected criteria'}.`}
              </p>
              {lastSearchParams?.mode === 'nearby' && lastSearchParams.radius < 25 && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm mt-16"
                  onClick={() => {
                    setRadius(25);
                  }}
                >
                  <Navigation size={13} />
                  Expand Search to 25 km
                </button>
              )}
            </div>
          ) : donors.length > 0 ? (
            <>
              <div className="results-header-bar flex-between mb-16 fade-in">
                <div>
                  <h2 className="results-title">
                    {donors.length} Compatible Donor{donors.length !== 1 ? 's' : ''} Found
                  </h2>
                  <p className="results-subtitle text-xs text-muted">
                    {lastSearchParams?.mode === 'nearby'
                      ? `Sorted by nearest distance within ${lastSearchParams.radius} km for ${lastSearchParams.bloodGroup}`
                      : `Matching compatible groups for ${lastSearchParams?.bloodGroup}`}
                  </p>
                </div>
                {lastSearchParams?.mode === 'nearby' && (
                  <span className="radius-tag">
                    <Navigation size={12} /> Within {lastSearchParams.radius} km
                  </span>
                )}
              </div>

              <div className="donors-grid">
                {donors.map((donor) => (
                  <DonorCard key={donor.id} donor={donor} />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      <style>{`
        .page-title {
          font-size: 26px;
          font-weight: 700;
          color: var(--text-dark);
        }

        .search-mode-tabs {
          display: flex;
          gap: 8px;
        }

        .mode-tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text-muted);
          transition: all var(--transition);
        }

        .mode-tab:hover {
          color: var(--text-dark);
          background: var(--bg-subtle);
        }

        .mode-tab.active {
          background: var(--primary-light);
          color: var(--primary);
          border-color: #FECACA;
        }

        .search-bar {
          padding: 24px;
        }

        .search-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-medium);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .field-input-wrap {
          position: relative;
        }

        .field-input-wrap .form-select {
          padding-left: 36px;
        }

        .search-field-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
          pointer-events: none;
        }

        .radius-pills {
          display: flex;
          gap: 8px;
          height: 42px;
        }

        .radius-pill {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
          background: var(--bg);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-medium);
          transition: all var(--transition);
        }

        .radius-pill:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .radius-pill.active {
          background: var(--primary);
          color: #fff;
          border-color: var(--primary);
          font-weight: 600;
        }

        .location-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border-light);
          flex-wrap: wrap;
        }

        .location-bar-main {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .location-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--primary-lighter);
          border: 1px solid #FECACA;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
        }

        .location-pill-text {
          color: var(--text-dark);
        }

        .location-clear-btn {
          background: none;
          border: none;
          padding: 2px;
          color: var(--text-light);
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .location-clear-btn:hover {
          color: var(--danger);
        }

        .btn-link {
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: underline;
        }

        .manual-coords-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding: 12px;
          background: var(--bg-subtle);
          border-radius: 8px;
          border: 1px solid var(--border);
        }

        .form-input-sm {
          padding: 8px 10px;
          font-size: 13px;
        }

        .alert-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          line-height: 1.4;
        }

        .alert-warning {
          background: #FFFBEB;
          color: #B45309;
          border: 1px solid #FDE68A;
        }

        .alert-danger {
          background: var(--danger-light);
          color: var(--danger);
          border: 1px solid #FECACA;
        }

        .city-controls .search-fields {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .city-controls .search-field {
          flex: 1;
          position: relative;
        }

        .city-controls .search-field .form-select,
        .city-controls .search-field .form-input {
          padding-left: 36px;
        }

        .results-header-bar {
          align-items: center;
        }

        .results-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-dark);
        }

        .radius-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 12px;
          background: var(--primary-light);
          color: var(--primary);
          font-size: 12px;
          font-weight: 600;
        }

        .donors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }

        .empty-state {
          text-align: center;
          padding: 48px 24px;
        }

        .empty-icon {
          color: var(--text-light);
          margin-bottom: 12px;
        }

        .empty-state h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 6px;
        }

        @media (max-width: 768px) {
          .search-row {
            grid-template-columns: 1fr;
          }

          .location-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .location-bar-main {
            flex-direction: column;
            align-items: stretch;
          }

          .city-controls .search-fields {
            flex-direction: column;
          }

          .city-controls .search-fields .btn {
            width: 100%;
          }

          .donors-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
