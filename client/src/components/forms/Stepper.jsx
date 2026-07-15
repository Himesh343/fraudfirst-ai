export function Stepper({ steps, current }) {
  return (
    <ol className="stepper" aria-label="Incident check progress">
      {steps.map((step, index) => (
        <li key={step} className={index === current ? "active" : index < current ? "done" : ""}>
          <span>{index + 1}</span>
          <p>{step}</p>
        </li>
      ))}
    </ol>
  );
}
