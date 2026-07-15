import { LoaderCircle } from "lucide-react";

export function LoadingState({ message = "Loading" }) {
  return (
    <div className="state-card" role="status" aria-live="polite">
      <LoaderCircle className="spin" size={28} aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
