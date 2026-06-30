export default function Loader({ size = 32, text = '' }) {
  return (
    <div className="loader-wrapper">
      <div className="loader-spinner" style={{ width: size, height: size }} />
      {text && <p className="loader-text">{text}</p>}

      <style>{`
        .loader-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 0;
          gap: 12px;
        }

        .loader-spinner {
          border: 3px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .loader-text {
          color: var(--text-muted);
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
