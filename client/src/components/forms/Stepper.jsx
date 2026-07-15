import { useTranslation } from "react-i18next";

export function Stepper({ steps, current }) {
  const { t } = useTranslation();
  return (
    <ol className="stepper" aria-label={t("check.progressLabel")}>
      {steps.map((step, index) => (
        <li key={step} className={index === current ? "active" : index < current ? "done" : ""}>
          <span>{index + 1}</span>
          <p>{step}</p>
        </li>
      ))}
    </ol>
  );
}
