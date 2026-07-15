import { Copy, Printer, RotateCcw, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button.jsx";
import { EmptyState } from "../components/common/EmptyState.jsx";
import { PageContainer } from "../components/layout/PageContainer.jsx";
import { officialResources } from "../config/officialResources.js";
import { maskValue } from "../utils/privacy.js";
import { clearSessionData, getAnalysis, getFormDetails } from "../utils/storage.js";

function privateValue(value, includeFull, type) {
  if (!value) return null;
  return includeFull ? value : maskValue(value, type);
}

function rows(details, includeFull, t) {
  return [
    [t("details.amount"), details.amount],
    [t("details.currency"), details.currency],
    [t("details.transactionId"), privateValue(details.transactionId, includeFull)],
    [t("details.date"), details.transactionDate],
    [t("details.time"), details.transactionTime],
    [t("details.paymentMethod"), details.paymentMethod],
    [t("details.bankOrWallet"), details.bankOrWallet],
    [t("details.upiId"), privateValue(details.upiId, includeFull, "upi")],
    [t("details.phone"), privateValue(details.phoneNumbers?.[0], includeFull, "phone")],
    [t("details.email"), privateValue(details.emails?.[0], includeFull, "email")],
    [t("details.url"), details.urls?.[0]],
    [t("details.impersonatedOrganisation"), details.impersonatedEntity]
  ];
}

export default function ReportPage() {
  const [analysis] = useState(getAnalysis());
  const [form] = useState(getFormDetails());
  const [includeFull, setIncludeFull] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const generatedAt = useMemo(() => new Date().toLocaleString(), []);

  if (!analysis) {
    return <EmptyState title={t("report.noReportTitle")} message={t("report.noReportMessage")} actionLabel={t("report.returnToCheck")} to="/check" />;
  }

  const reportText = `${t("report.reportTextTitle")}\n${t("report.reference")}: ${analysis.analysisId}\n${t("report.generated")}: ${generatedAt}\n\n${analysis.reportSummary}\n\n${t("report.reportDisclaimer")}: ${analysis.safetyDisclaimer}`;

  async function copyReport() {
    await navigator.clipboard.writeText(reportText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  function startNew() {
    clearSessionData();
    navigate("/check");
  }

  return (
    <PageContainer className="report-page">
      <section className="report-actions">
        <Button type="button" icon={Printer} onClick={() => window.print()}>{t("report.print")}</Button>
        <Button type="button" variant="secondary" icon={Copy} onClick={copyReport}>{copied ? t("report.copied") : t("report.copy")}</Button>
        <Button to="/results" variant="secondary">{t("report.returnResults")}</Button>
        <Button type="button" variant="ghost" icon={RotateCcw} onClick={startNew}>{t("common.startNewCheck")}</Button>
      </section>
      <article className="incident-report">
        <header>
          <ShieldCheck size={30} aria-hidden="true" />
          <div>
            <h1>{t("report.title")}</h1>
            <p>{t("report.notice")}</p>
          </div>
        </header>
        <label className="report-toggle">
          <input type="checkbox" checked={includeFull} onChange={(event) => setIncludeFull(event.target.checked)} />
          {t("report.includeFull")}
        </label>
        <p className="disclaimer">{t("report.reviewNotice")}</p>
        <section><h2>{t("report.generatedDetails")}</h2><p>{generatedAt}</p><p>{t("report.reference")}: {analysis.analysisId}</p><p>{t("report.preferredLanguage")}: {analysis.language}</p></section>
        <section><h2>{t("report.userDescription")}</h2><p>{form?.incidentDescription || t("report.notStored")}</p></section>
        <section><h2>{t("report.analysisSummary")}</h2><p>{analysis.reportSummary}</p><p>{analysis.risk.summary}</p></section>
        <section><h2>{t("report.suspectedScam")}</h2><p>{analysis.suspectedScam.category}: {analysis.suspectedScam.description}</p></section>
        <section><h2>{t("report.riskIndicators")}</h2><ul>{analysis.risk.indicators.map((item) => <li key={item.title}><strong>{item.title}</strong>: {item.explanation}</li>)}</ul></section>
        <section><h2>{t("report.transactionDetails")}</h2><dl>{rows(analysis.extractedDetails, includeFull, t).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || t("common.notDetected")}</dd></div>)}</dl></section>
        <section>
          <h2>{t("report.evidenceInventory")}</h2>
          {form?.evidenceInventory?.length ? (
            <ul>{form.evidenceInventory.map((item) => <li key={`${item.name}-${item.size}`}>{item.name} ({item.type})</li>)}</ul>
          ) : <p>{t("report.noMetadata")}</p>}
        </section>
        <section><h2>{t("report.missingEvidence")}</h2><ul>{analysis.evidence.missing.map((item) => <li key={item.label}>{item.label}: {item.description}</li>)}</ul></section>
        <section><h2>{t("report.timeline")}</h2><ol>{analysis.timeline.map((item, index) => <li key={`${item.title}-${index}`}>{item.date || t("results.dateNotDetected")} {item.time || ""}: {item.title}. {item.description}</li>)}</ol></section>
        <section><h2>{t("report.actions")}</h2><ol>{analysis.immediateActions.map((item) => <li key={item.priority}>{item.title}: {item.description}</li>)}</ol></section>
        <section><h2>{t("report.limitations")}</h2><ul>{analysis.limitations.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section><h2>{t("report.officialResources")}</h2><p>{t("report.helpline")}: {officialResources.cybercrimeHelpline.value}</p><p>{t("report.portal")}: {officialResources.reportingPortal.href}</p></section>
        <section><h2>{t("report.safetyDisclaimer")}</h2><p>{analysis.safetyDisclaimer}</p></section>
        <footer>{t("report.footer")}</footer>
      </article>
    </PageContainer>
  );
}
