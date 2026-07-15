import { CheckCircle, HelpCircle, ListPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

const groups = [
  ["results.evidenceFound", "found", CheckCircle],
  ["results.missingEvidence", "missing", HelpCircle],
  ["results.recommendedEvidence", "recommended", ListPlus]
];

export function EvidenceChecklist({ evidence }) {
  const { t } = useTranslation();
  return (
    <section className="result-panel">
      <h2>{t("results.evidenceChecklist")}</h2>
      <div className="evidence-groups">
        {groups.map(([titleKey, key, Icon]) => (
          <article key={key}>
            <h3><Icon size={18} aria-hidden="true" />{t(titleKey)}</h3>
            <ul>
              {evidence[key].map((item) => (
                <li key={`${key}-${item.label}`}>
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
