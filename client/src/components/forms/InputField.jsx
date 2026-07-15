import { InlineFieldError } from "../common/InlineFieldError.jsx";

export function InputField({ label, id, error, ...props }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props} />
      <InlineFieldError id={`${id}-error`}>{error}</InlineFieldError>
    </div>
  );
}
