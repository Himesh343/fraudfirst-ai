import { FileQuestion } from "lucide-react";
import { Button } from "./Button.jsx";

export function EmptyState({ title, message, actionLabel, to }) {
  return (
    <section className="state-card">
      <FileQuestion size={30} aria-hidden="true" />
      <h1>{title}</h1>
      <p>{message}</p>
      {actionLabel ? <Button to={to}>{actionLabel}</Button> : null}
    </section>
  );
}
