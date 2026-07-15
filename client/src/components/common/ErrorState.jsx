import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button.jsx";

export function ErrorState({ title, message, actionLabel, onAction }) {
  const { t } = useTranslation();
  return (
    <section className="state-card state-card--error" role="alert">
      <AlertTriangle size={28} aria-hidden="true" />
      <h2>{title || t("common.errorTitle")}</h2>
      <p>{message}</p>
      {actionLabel ? <Button type="button" onClick={onAction}>{actionLabel}</Button> : null}
    </section>
  );
}
