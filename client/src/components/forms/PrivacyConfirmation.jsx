import { InlineFieldError } from "../common/InlineFieldError.jsx";

export function PrivacyConfirmation({ checked, onChange, error }) {
  return (
    <div className="privacy-confirmation">
      <label>
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        <span>I understand that FraudFirst provides AI-assisted guidance and I will review the generated information before using it.</span>
      </label>
      <InlineFieldError>{error}</InlineFieldError>
    </div>
  );
}
