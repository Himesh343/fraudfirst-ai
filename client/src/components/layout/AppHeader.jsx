import { ExternalLink, ShieldCheck } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { officialResources } from "../../config/officialResources.js";

export function AppHeader() {
  return (
    <header className="app-header">
      <Link className="brand" to="/" aria-label="FraudFirst home">
        <span className="brand-mark" aria-hidden="true"><ShieldCheck size={23} /></span>
        <span>FraudFirst</span>
      </Link>
      <nav aria-label="Primary navigation">
        <a href="/#how-it-works">How It Works</a>
        <a href="/#privacy">Privacy</a>
        <label className="language-select">
          <span className="sr-only">Language</span>
          <select defaultValue="English">
            <option>English</option>
            <option>Hindi</option>
            <option>Kannada</option>
          </select>
        </label>
        <NavLink className="help-link" to="/check">Get Help</NavLink>
        <a className="official-link" href={officialResources.reportingPortal.href} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={16} aria-hidden="true" />
          Official Portal
        </a>
      </nav>
    </header>
  );
}
