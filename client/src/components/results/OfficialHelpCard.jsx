import { ExternalLink, PhoneCall } from "lucide-react";
import { useTranslation } from "react-i18next";
import { officialResources } from "../../config/officialResources.js";

export function OfficialHelpCard({ prominent = false }) {
  const { t } = useTranslation();
  return (
    <section className={`official-help ${prominent ? "official-help--prominent" : ""}`}>
      <h3>{t("results.officialHelp")}</h3>
      <p>{t("common.externalNotice")}</p>
      <div className="action-row">
        <a className="button button--danger" href={officialResources.cybercrimeHelpline.href}>
          <PhoneCall size={18} aria-hidden="true" />
          <span>{t("results.call1930")}</span>
        </a>
        <a className="button button--secondary" href={officialResources.reportingPortal.href} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={18} aria-hidden="true" />
          <span>{t("results.openPortal")}</span>
        </a>
      </div>
    </section>
  );
}
