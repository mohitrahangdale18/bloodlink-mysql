import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import RequestCard from '../components/RequestCard';
import Loader from '../components/Loader';
import { Plus, ClipboardList, CheckCircle, X, Filter } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState('');
  const [filterCity, setFilterCity] = useState('');

  // Form
  const [form, setForm] = useState({
    bloodGroup: '',
    city: '',
    hospital: '',
    contactNumber: '',
    urgency: 'normal',
  });

  const fetchRequests = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterBloodGroup) params.append('bloodGroup', filterBloodGroup);
      if (filterCity) params.append('city', filterCity);
      const res = await API.get(`/requests?${params.toString()}`);
      setRequests(res.data.data || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterBloodGroup, filterCity]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!form.bloodGroup || !form.city || !form.hospital || !form.contactNumber) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setCreating(true);
    try {
      await API.post('/requests', form);
      setMessage({ type: 'success', text: 'Blood request created successfully.' });
      setForm({ bloodGroup: '', city: '', hospital: '', contactNumber: '', urgency: 'normal' });
      setShowForm(false);
      setLoading(true);
      fetchRequests();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create request.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setCreating(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.patch(`/requests/${id}/status`, { status });
      fetchRequests();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status.';
      setMessage({ type: 'error', text: msg });
    }
  };

  return (
    <div className="requests-page page-section">
      <div className="container">
        {/* Header */}
        <div className="requests-header fade-in">
          <div>
            <h1 className="page-title">Blood Requests</h1>
            <p className="text-muted">Create and manage blood donation requests</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancel' : 'New Request'}
          </button>
        </div>

        {/* Messages */}
        {message.text && (
          <div className={`requests-message ${message.type} mt-16 fade-in`}>
            {message.type === 'success' && <CheckCircle size={16} />}
            {message.text}
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <form className="create-form card mt-24 fade-in-up" onSubmit={handleCreate}>
            <h2 className="form-title">Create Blood Request</h2>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Blood Group *</label>
                <select
                  name="bloodGroup"
                  className="form-select"
                  value={form.bloodGroup}
                  onChange={handleFormChange}
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
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Hospital *</label>
                <input
                  type="text"
                  name="hospital"
                  className="form-input"
                  placeholder="Hospital name"
                  value={form.hospital}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Number *</label>
                <input
                  type="tel"
                  name="contactNumber"
                  className="form-input"
                  placeholder="+91 9876543210"
                  value={form.contactNumber}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Urgency</label>
              <select
                name="urgency"
                className="form-select"
                value={form.urgency}
                onChange={handleFormChange}
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={creating}>
              <Plus size={16} />
              {creating ? 'Creating...' : 'Create Request'}
            </button>
          </form>
        )}

        {/* Filters */}
        <div className="filter-bar card-flat mt-32 fade-in">
          <div className="filter-icon-label">
            <Filter size={15} />
            <span>Filters</span>
          </div>
          <div className="filter-fields">
            <select
              className="form-select filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              className="form-select filter-select"
              value={filterBloodGroup}
              onChange={(e) => setFilterBloodGroup(e.target.value)}
            >
              <option value="">All Blood Groups</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>

            <input
              type="text"
              className="form-input filter-input"
              placeholder="Filter by city"
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
            />
          </div>
        </div>

        {/* Requests List */}
        <div className="requests-list mt-24">
          {loading ? (
            <Loader text="Loading requests..." />
          ) : requests.length === 0 ? (
            <div className="empty-state fade-in">
              <ClipboardList size={40} className="empty-icon" />
              <h3>No requests found</h3>
              <p>Create a new blood request or adjust your filters</p>
            </div>
          ) : (
            <div className="requests-grid">
              {requests.map((req) => (
                <RequestCard
                  key={req.id}
                  request={req}
                  currentUserId={user?.id}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .page-title {
          font-size: 26px;
          font-weight: 700;
          color: var(--text-dark);
        }

        .requests-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
        }

        .requests-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
        }

        .requests-message.success {
          background: var(--success-light);
          color: var(--success);
          border: 1px solid #BBF7D0;
        }

        .requests-message.error {
          background: var(--danger-light);
          color: var(--danger);
          border: 1px solid #FECACA;
        }

        .form-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 20px;
        }

        .filter-bar {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .filter-icon-label {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
        }

        .filter-fields {
          display: flex;
          gap: 10px;
          flex: 1;
          flex-wrap: wrap;
        }

        .filter-select,
        .filter-input {
          max-width: 180px;
          font-size: 13px;
          padding: 8px 12px;
        }

        .requests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
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
          .filter-fields {
            flex-direction: column;
          }

          .filter-select,
          .filter-input {
            max-width: 100%;
          }

          .requests-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
