import { useTranslation } from "react-i18next";
import { InlineFieldError } from "../common/InlineFieldError.jsx";

export function TextArea({ label, id, error, showCount, value = "", ...props }) {
  const { t } = useTranslation();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} value={value} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props} />
      <div className="field-meta">
        <InlineFieldError id={`${id}-error`}>{error}</InlineFieldError>
        {showCount ? <span>{t("upload.characterCount", { count: value.length })}</span> : null}
      </div>
    </div>
  );
}
