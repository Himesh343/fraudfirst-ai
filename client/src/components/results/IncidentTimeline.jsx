export function IncidentTimeline({ timeline }) {
  return (
    <section className="result-panel">
      <h2>Incident timeline</h2>
      <ol className="timeline">
        {timeline.map((event, index) => (
          <li key={`${event.title}-${index}`} className={event.source}>
            <span>{event.date || "Date not detected"} {event.time || ""}</span>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <small>{event.source === "user_provided" ? "User-provided" : "AI-extracted"}</small>
          </li>
        ))}
      </ol>
    </section>
  );
}
