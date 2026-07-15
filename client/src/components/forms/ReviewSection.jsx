export function ReviewSection({ title, children }) {
  return (
    <section className="review-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}
