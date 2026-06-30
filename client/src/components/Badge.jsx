export default function Badge({ children, variant = 'default', size = 'md' }) {
  const variants = {
    default: { bg: 'var(--bg-muted)', color: 'var(--text-muted)', border: 'var(--border)' },
    primary: { bg: 'var(--primary-light)', color: 'var(--primary)', border: '#FECACA' },
    success: { bg: 'var(--success-light)', color: 'var(--success)', border: '#BBF7D0' },
    warning: { bg: 'var(--warning-light)', color: 'var(--warning)', border: '#FDE68A' },
    danger: { bg: 'var(--danger-light)', color: 'var(--danger)', border: '#FECACA' },
  };

  const v = variants[variant] || variants.default;
  const sizeStyles = size === 'sm'
    ? { padding: '2px 8px', fontSize: '11px' }
    : { padding: '4px 12px', fontSize: '12px' };

  return (
    <span
      className="badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: 500,
        borderRadius: '6px',
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...sizeStyles,
      }}
    >
      {children}
    </span>
  );
}
