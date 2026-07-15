import { AlertTriangle } from "lucide-react";
import { Button } from "./Button.jsx";

export function ErrorState({ title = "Something went wrong", message, actionLabel, onAction }) {
  return (
    <section className="state-card state-card--error" role="alert">
      <AlertTriangle size={28} aria-hidden="true" />
      <h2>{title}</h2>
      <p>{message}</p>
      {actionLabel ? <Button type="button" onClick={onAction}>{actionLabel}</Button> : null}
    </section>
  );
}
