import { MapPin, Phone, Droplet, Navigation } from 'lucide-react';
import Badge from './Badge';

export default function DonorCard({ donor }) {
  const user = donor.user || {};
  const hasDistance = donor.distanceKm !== undefined && donor.distanceKm !== null;

  return (
    <div className="donor-card card fade-in">
      <div className="donor-card-header">
        <div className="donor-avatar">
          {(user.name || 'D').charAt(0).toUpperCase()}
        </div>
        <div className="donor-info">
          <h3 className="donor-name">{user.name || 'Unknown'}</h3>
          <div className="donor-meta">
            <MapPin size={14} />
            <span>{donor.city || user.city}</span>
            {hasDistance && (
              <span className="donor-distance-inline">
                • <Navigation size={12} className="distance-icon" /> ~{donor.distanceKm} km
              </span>
            )}
          </div>
        </div>
        <Badge variant="primary">
          <Droplet size={12} />
          {donor.bloodGroup}
        </Badge>
      </div>

      <div className="donor-card-body">
        {hasDistance && (
          <div className="donor-detail">
            <span className="donor-detail-label">Distance</span>
            <span className="donor-distance-pill">
              <Navigation size={12} />
              ~{donor.distanceKm} km away
            </span>
          </div>
        )}

        <div className="donor-detail">
          <span className="donor-detail-label">Status</span>
          <span className="donor-status">
            <span
              className="status-dot"
              style={{ background: donor.isAvailable ? 'var(--success)' : 'var(--text-light)' }}
            />
            {donor.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>

        <div className="donor-detail">
          <span className="donor-detail-label">Donations</span>
          <span>{donor.totalDonations || 0}</span>
        </div>

        {user.phone && (
          <div className="donor-detail">
            <span className="donor-detail-label">Contact</span>
            <span className="donor-phone">
              <Phone size={13} />
              {user.phone}
            </span>
          </div>
        )}
      </div>

      <style>{`
        .donor-card {
          transition: transform var(--transition), box-shadow var(--transition);
        }

        .donor-card:hover {
          transform: translateY(-2px);
        }

        .donor-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .donor-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--primary-light);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
          flex-shrink: 0;
        }

        .donor-info {
          flex: 1;
          min-width: 0;
        }

        .donor-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-dark);
          line-height: 1.3;
        }

        .donor-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--text-muted);
          font-size: 13px;
          margin-top: 2px;
          flex-wrap: wrap;
        }

        .donor-distance-inline {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          color: var(--primary);
          font-weight: 500;
        }

        .distance-icon {
          color: var(--primary);
        }

        .donor-distance-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 12px;
          background: var(--primary-lighter);
          color: var(--primary);
          font-size: 12px;
          font-weight: 600;
        }

        .donor-card-body {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-top: 12px;
          border-top: 1px solid var(--border-light);
        }

        .donor-detail {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }

        .donor-detail-label {
          color: var(--text-muted);
        }

        .donor-status {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .donor-phone {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--text-dark);
        }
      `}</style>
    </div>
  );
}
