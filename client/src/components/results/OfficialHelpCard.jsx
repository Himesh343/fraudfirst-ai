import { ExternalLink, PhoneCall } from "lucide-react";
import { officialResources } from "../../config/officialResources.js";

export function OfficialHelpCard({ prominent = false }) {
  return (
    <section className={`official-help ${prominent ? "official-help--prominent" : ""}`}>
      <h3>Official reporting resources</h3>
      <p>You are leaving FraudFirst when opening official external resources. FraudFirst does not own or operate these services.</p>
      <div className="action-row">
        <a className="button button--danger" href={officialResources.cybercrimeHelpline.href}>
          <PhoneCall size={18} aria-hidden="true" />
          <span>Call 1930</span>
        </a>
        <a className="button button--secondary" href={officialResources.reportingPortal.href} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={18} aria-hidden="true" />
          <span>Open official portal</span>
        </a>
      </div>
    </section>
  );
}
