import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function ActionChecklist({ actions }) {
  const [done, setDone] = useState({});
  const { t } = useTranslation();
  return (
    <section className="result-panel">
      <h2>{t("results.immediateActions")}</h2>
      <ul className="action-checklist">
        {actions.map((action) => (
          <li key={action.priority} className={action.urgent ? "urgent" : ""}>
            <button type="button" onClick={() => setDone((current) => ({ ...current, [action.priority]: !current[action.priority] }))} aria-pressed={Boolean(done[action.priority])}>
              {done[action.priority] ? <CheckCircle2 size={22} /> : <Circle size={22} />}
              <span>
                <strong>{action.priority}. {action.title}</strong>
                <small>{action.description}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
