import { Droplet, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Droplet size={18} className="footer-icon" />
          <span>BloodLink</span>
        </div>
        <p className="footer-text">
          Connecting blood donors with those in need. Every drop counts.
        </p>
        <p className="footer-copy">
          Made with <Heart size={13} className="footer-heart" /> &copy; {new Date().getFullYear()} BloodLink
        </p>
      </div>

      <style>{`
        .footer {
          background: var(--bg-subtle);
          border-top: 1px solid var(--border);
          padding: 32px 0;
          margin-top: auto;
        }

        .footer-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          font-size: 15px;
          color: var(--text-dark);
        }

        .footer-icon {
          color: var(--primary);
        }

        .footer-text {
          color: var(--text-muted);
          font-size: 13px;
        }

        .footer-copy {
          color: var(--text-light);
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .footer-heart {
          color: var(--primary);
          fill: var(--primary);
        }
      `}</style>
    </footer>
  );
}
