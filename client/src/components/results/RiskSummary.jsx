import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { StatusBadge } from "../common/StatusBadge.jsx";

const riskIcon = {
  low: ShieldCheck,
  medium: ShieldAlert,
  high: AlertTriangle,
  critical: AlertTriangle
};

export function RiskSummary({ analysis }) {
  const Icon = riskIcon[analysis.risk.level] || ShieldAlert;
  return (
    <section className={`result-panel risk-panel risk-${analysis.risk.level}`}>
      <div className="panel-title">
        <Icon size={28} aria-hidden="true" />
        <div>
          <h2>{analysis.risk.label}</h2>
          <p>{analysis.suspectedScam.category}</p>
        </div>
        <StatusBadge tone={analysis.risk.level}>{analysis.risk.confidence} confidence</StatusBadge>
      </div>
      <p>{analysis.risk.summary}</p>
      <div className="indicator-grid">
        {analysis.risk.indicators.map((indicator) => (
          <article key={`${indicator.title}-${indicator.evidence}`}>
            <h3>{indicator.title}</h3>
            <p>{indicator.explanation}</p>
            <small>{indicator.evidence}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
