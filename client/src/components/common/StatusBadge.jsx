export function StatusBadge({ children, tone = "neutral", icon: Icon }) {
  return (
    <span className={`status-badge status-badge--${tone}`}>
      {Icon ? <Icon size={15} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
