export function AlertCard({ title, children, tone = "info", icon: Icon }) {
  return (
    <section className={`alert-card alert-card--${tone}`}>
      {Icon ? <Icon size={22} aria-hidden="true" /> : null}
      <div>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    </section>
  );
}
