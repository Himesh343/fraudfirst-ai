import { useTranslation } from "react-i18next";

export function IncidentTimeline({ timeline }) {
  const { t } = useTranslation();
  return (
    <section className="result-panel">
      <h2>{t("results.timeline")}</h2>
      <ol className="timeline">
        {timeline.map((event, index) => (
          <li key={`${event.title}-${index}`} className={event.source}>
            <span>{event.date || t("results.dateNotDetected")} {event.time || ""}</span>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <small>{event.source === "user_provided" ? t("results.userProvided") : t("results.aiExtracted")}</small>
          </li>
        ))}
      </ol>
    </section>
  );
}
