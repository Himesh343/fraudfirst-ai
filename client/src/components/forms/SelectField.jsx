import { InlineFieldError } from "../common/InlineFieldError.jsx";

export function SelectField({ label, id, options, error, ...props }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props}>
        {options.map((option) => <option key={option} value={option}>{option || "Select"}</option>)}
      </select>
      <InlineFieldError id={`${id}-error`}>{error}</InlineFieldError>
    </div>
  );
}
