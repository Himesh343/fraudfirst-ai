import { InlineFieldError } from "../common/InlineFieldError.jsx";

export function TextArea({ label, id, error, showCount, value = "", ...props }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} value={value} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props} />
      <div className="field-meta">
        <InlineFieldError id={`${id}-error`}>{error}</InlineFieldError>
        {showCount ? <span>{value.length} characters</span> : null}
      </div>
    </div>
  );
}
