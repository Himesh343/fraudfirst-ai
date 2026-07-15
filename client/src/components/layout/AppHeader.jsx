import { ExternalLink, Languages, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, NavLink } from "react-router-dom";
import { officialResources } from "../../config/officialResources.js";
import { languageOptions } from "../../i18n/index.js";

export function AppHeader() {
  const { t, i18n } = useTranslation();

  function changeLanguage(event) {
    i18n.changeLanguage(event.target.value);
  }

  return (
    <header className="app-header">
      <Link className="brand" to="/" aria-label={t("header.home")}>
        <span className="brand-mark" aria-hidden="true"><ShieldCheck size={23} /></span>
        <span>FraudFirst</span>
      </Link>
      <nav aria-label={t("header.primaryNav")}>
        <a href="/#how-it-works">{t("header.howItWorks")}</a>
        <a href="/#privacy">{t("header.privacy")}</a>
        <label className="language-select">
          <span className="sr-only">{t("header.selectLanguage")}</span>
          <Languages size={17} aria-hidden="true" />
          <select aria-label={t("header.selectLanguage")} value={i18n.resolvedLanguage || i18n.language} onChange={changeLanguage}>
            {languageOptions.map((language) => <option key={language.code} value={language.code}>{language.nativeName}</option>)}
          </select>
        </label>
        <NavLink className="help-link" to="/check">{t("header.getHelp")}</NavLink>
        <a className="official-link" href={officialResources.reportingPortal.href} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={16} aria-hidden="true" />
          {t("header.officialPortal")}
        </a>
      </nav>
    </header>
  );
}
