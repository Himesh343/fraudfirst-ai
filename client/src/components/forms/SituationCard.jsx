import { CheckCircle, CreditCard, MessageSquareWarning } from "lucide-react";

export function SituationCard({ title, description, value, selected, onSelect }) {
  const Icon = value === "money_transferred" ? CreditCard : MessageSquareWarning;
  return (
    <button type="button" className={`situation-card ${selected ? "selected" : ""}`} onClick={() => onSelect(value)} aria-pressed={selected}>
      <Icon size={28} aria-hidden="true" />
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      {selected ? <CheckCircle size={22} aria-hidden="true" /> : null}
    </button>
  );
}
