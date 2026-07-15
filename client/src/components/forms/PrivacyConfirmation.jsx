import { useTranslation } from "react-i18next";
import { InlineFieldError } from "../common/InlineFieldError.jsx";

export function PrivacyConfirmation({ checked, onChange, error }) {
  const { t } = useTranslation();
  return (
    <div className="privacy-confirmation">
      <label>
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        <span>{t("check.privacyConfirmation")}</span>
      </label>
      <InlineFieldError>{error}</InlineFieldError>
    </div>
  );
}
