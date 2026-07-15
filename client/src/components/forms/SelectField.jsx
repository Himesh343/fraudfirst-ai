import { useTranslation } from "react-i18next";
import { InlineFieldError } from "../common/InlineFieldError.jsx";

function normalizeOption(option) {
  return typeof option === "string" ? { value: option, label: option } : option;
}

export function SelectField({ label, id, options, error, ...props }) {
  const { t } = useTranslation();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props}>
        {options.map((option) => {
          const normalized = normalizeOption(option);
          return <option key={normalized.value} value={normalized.value}>{normalized.label || t("common.select")}</option>;
        })}
      </select>
      <InlineFieldError id={`${id}-error`}>{error}</InlineFieldError>
    </div>
  );
}
