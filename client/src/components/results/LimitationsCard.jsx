import { useTranslation } from "react-i18next";

export function LimitationsCard({ limitations }) {
  const { t } = useTranslation();
  return (
    <section className="result-panel limitations-card">
      <h2>{t("results.limitations")}</h2>
      <ul>
        {limitations.length ? limitations.map((item) => <li key={item}>{item}</li>) : <li>{t("results.noLimitations")}</li>}
      </ul>
    </section>
  );
}
