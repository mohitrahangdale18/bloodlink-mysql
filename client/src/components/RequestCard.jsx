import { MapPin, Building2, Phone, Clock, Droplet } from 'lucide-react';
import Badge from './Badge';

const urgencyVariant = {
  normal: 'default',
  urgent: 'warning',
  critical: 'danger',
};

const statusVariant = {
  pending: 'warning',
  fulfilled: 'success',
  cancelled: 'default',
};

export default function RequestCard({ request, onStatusUpdate, currentUserId }) {
  const requester = request.requester || {};
  const isOwner = currentUserId === request.requestedBy;
  const createdAt = new Date(request.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="request-card card fade-in">
      <div className="request-card-header">
        <div className="request-blood-group">
          <Droplet size={16} />
          <span>{request.bloodGroup}</span>
        </div>
        <div className="request-badges">
          <Badge variant={urgencyVariant[request.urgency]} size="sm">
            {request.urgency}
          </Badge>
          <Badge variant={statusVariant[request.status]} size="sm">
            {request.status}
          </Badge>
        </div>
      </div>

      <div className="request-card-body">
        <div className="request-detail">
          <Building2 size={14} />
          <span>{request.hospital}</span>
        </div>
        <div className="request-detail">
          <MapPin size={14} />
          <span>{request.city}</span>
        </div>
        <div className="request-detail">
          <Phone size={14} />
          <span>{request.contactNumber}</span>
        </div>
        <div className="request-detail">
          <Clock size={14} />
          <span>{createdAt}</span>
        </div>
      </div>

      {requester.name && (
        <div className="request-requester">
          Requested by <strong>{requester.name}</strong>
        </div>
      )}

      {isOwner && request.status === 'pending' && onStatusUpdate && (
        <div className="request-actions">
          <button
            className="btn btn-success btn-sm"
            onClick={() => onStatusUpdate(request.id, 'fulfilled')}
          >
            Mark Fulfilled
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onStatusUpdate(request.id, 'cancelled')}
          >
            Cancel
          </button>
        </div>
      )}

      <style>{`
        .request-card {
          transition: transform var(--transition), box-shadow var(--transition);
        }

        .request-card:hover {
          transform: translateY(-2px);
        }

        .request-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 14px;
          gap: 8px;
        }

        .request-blood-group {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 18px;
          font-weight: 700;
          color: var(--primary);
        }

        .request-badges {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .request-card-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px 0;
          border-top: 1px solid var(--border-light);
          border-bottom: 1px solid var(--border-light);
        }

        .request-detail {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-muted);
        }

        .request-detail span {
          color: var(--text-medium);
        }

        .request-requester {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 10px;
        }

        .request-requester strong {
          color: var(--text-dark);
          font-weight: 500;
        }

        .request-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
      `}</style>
    </div>
  );
}
