import { Siren } from "lucide-react";
import { OfficialHelpCard } from "./OfficialHelpCard.jsx";

export function EmergencyBanner({ analysis }) {
  const show = analysis?.moneyTransferred && ["high", "critical"].includes(analysis?.risk?.level);
  if (!show) return null;
  return (
    <section className="emergency-banner">
      <Siren size={26} aria-hidden="true" />
      <div>
        <h2>Immediate reporting may be important</h2>
        <p>Use verified bank or payment-provider contact details from the official app, card or website, and consider reporting through official cybercrime channels.</p>
        <OfficialHelpCard prominent />
      </div>
    </section>
  );
}
