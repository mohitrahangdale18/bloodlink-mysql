import { useState } from 'react';
import API from '../api/axios';
import DonorCard from '../components/DonorCard';
import Loader from '../components/Loader';
import { Search, Droplet, MapPin, Users } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function SearchDonors() {
  const [bloodGroup, setBloodGroup] = useState('');
  const [city, setCity] = useState('');
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');

    if (!bloodGroup) {
      setError('Please select a blood group.');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ bloodGroup });
      if (city.trim()) params.append('city', city.trim());
      const res = await API.get(`/donors/search?${params.toString()}`);
      setDonors(res.data.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to search donors.';
      setError(msg);
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page page-section">
      <div className="container">
        <div className="search-header fade-in">
          <h1 className="page-title">Search Donors</h1>
          <p className="text-muted">Find compatible blood donors in your area</p>
        </div>

        {/* Filter Bar */}
        <form className="search-bar card-flat mt-24 fade-in" onSubmit={handleSearch}>
          <div className="search-fields">
            <div className="search-field">
              <Droplet size={16} className="search-field-icon" />
              <select
                className="form-select"
                value={bloodGroup}
                onChange={(e) => { setBloodGroup(e.target.value); setError(''); }}
              >
                <option value="">Blood Group</option>
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
                placeholder="City (optional)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Search size={16} />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && <p className="form-error mt-8">{error}</p>}
        </form>

        {/* Results */}
        <div className="search-results mt-32">
          {loading ? (
            <Loader text="Searching donors..." />
          ) : searched && donors.length === 0 ? (
            <div className="empty-state fade-in">
              <Users size={40} className="empty-icon" />
              <h3>No donors found</h3>
              <p>Try adjusting your search criteria or removing the city filter</p>
            </div>
          ) : donors.length > 0 ? (
            <>
              <p className="results-count text-sm text-muted mb-16">
                {donors.length} donor{donors.length !== 1 ? 's' : ''} found
              </p>
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

        .search-bar {
          padding: 20px;
        }

        .search-fields {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .search-field {
          flex: 1;
          position: relative;
        }

        .search-field-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
          pointer-events: none;
        }

        .search-field .form-select,
        .search-field .form-input {
          padding-left: 36px;
        }

        .donors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }

        .empty-state {
          text-align: center;
          padding: 64px 20px;
        }

        .empty-icon {
          color: var(--text-light);
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 6px;
        }

        .empty-state p {
          font-size: 14px;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .search-fields {
            flex-direction: column;
          }

          .search-fields .btn {
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
