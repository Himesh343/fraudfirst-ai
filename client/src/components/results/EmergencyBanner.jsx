import { Siren } from "lucide-react";
import { useTranslation } from "react-i18next";
import { OfficialHelpCard } from "./OfficialHelpCard.jsx";

export function EmergencyBanner({ analysis }) {
  const { t } = useTranslation();
  const show = analysis?.moneyTransferred && ["high", "critical"].includes(analysis?.risk?.level);
  if (!show) return null;
  return (
    <section className="emergency-banner">
      <Siren size={26} aria-hidden="true" />
      <div>
        <h2>{t("results.emergencyHeading")}</h2>
        <p>{t("results.emergencyText")}</p>
        <OfficialHelpCard prominent />
      </div>
    </section>
  );
}
