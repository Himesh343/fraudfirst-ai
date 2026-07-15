export function IconButton({ label, icon: Icon, className = "", ...props }) {
  return (
    <button className={`icon-button ${className}`.trim()} aria-label={label} title={label} {...props}>
      <Icon size={18} aria-hidden="true" />
    </button>
  );
}
