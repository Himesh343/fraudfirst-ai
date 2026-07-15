import { LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LoadingState({ message }) {
  const { t } = useTranslation();
  return (
    <div className="state-card" role="status" aria-live="polite">
      <LoaderCircle className="spin" size={28} aria-hidden="true" />
      <p>{message || t("check.loading.0")}</p>
    </div>
  );
}
