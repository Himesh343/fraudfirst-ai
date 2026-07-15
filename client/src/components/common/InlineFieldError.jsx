export function InlineFieldError({ id, children }) {
  if (!children) return null;
  return <p className="field-error" id={id}>{children}</p>;
}
