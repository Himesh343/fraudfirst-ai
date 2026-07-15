export function LimitationsCard({ limitations }) {
  return (
    <section className="result-panel limitations-card">
      <h2>Limitations</h2>
      <ul>
        {limitations.length ? limitations.map((item) => <li key={item}>{item}</li>) : <li>No specific limitations were returned, but the AI-assisted result should still be reviewed.</li>}
      </ul>
    </section>
  );
}
