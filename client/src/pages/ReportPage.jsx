import { Copy, Printer, RotateCcw, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button.jsx";
import { EmptyState } from "../components/common/EmptyState.jsx";
import { PageContainer } from "../components/layout/PageContainer.jsx";
import { officialResources } from "../config/officialResources.js";
import { maskValue } from "../utils/privacy.js";
import { clearSessionData, getAnalysis, getFormDetails } from "../utils/storage.js";

function rows(details, includeFull) {
  return [
    ["Amount", details.amount],
    ["Currency", details.currency],
    ["Transaction ID", includeFull ? details.transactionId : maskValue(details.transactionId)],
    ["Date", details.transactionDate],
    ["Time", details.transactionTime],
    ["Payment method", details.paymentMethod],
    ["Bank or wallet", details.bankOrWallet],
    ["UPI ID", includeFull ? details.upiId : maskValue(details.upiId, "upi")],
    ["Phone", includeFull ? details.phoneNumbers?.[0] : maskValue(details.phoneNumbers?.[0], "phone")],
    ["Email", includeFull ? details.emails?.[0] : maskValue(details.emails?.[0], "email")],
    ["URL", details.urls?.[0]],
    ["Impersonated organisation", details.impersonatedEntity]
  ];
}

export default function ReportPage() {
  const [analysis] = useState(getAnalysis());
  const [form] = useState(getFormDetails());
  const [includeFull, setIncludeFull] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const generatedAt = useMemo(() => new Date().toLocaleString(), []);

  if (!analysis) {
    return <EmptyState title="No report available" message="An incident check must be completed before a report can be prepared." actionLabel="Return to check" to="/check" />;
  }

  const reportText = `FraudFirst AI-assisted incident summary\nReference: ${analysis.analysisId}\nGenerated: ${generatedAt}\n\n${analysis.reportSummary}\n\nDisclaimer: ${analysis.safetyDisclaimer}`;

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
        <Button type="button" icon={Printer} onClick={() => window.print()}>Print or Save as PDF</Button>
        <Button type="button" variant="secondary" icon={Copy} onClick={copyReport}>{copied ? "Report copied" : "Copy Report Text"}</Button>
        <Button to="/results" variant="secondary">Return to Results</Button>
        <Button type="button" variant="ghost" icon={RotateCcw} onClick={startNew}>Start New Check</Button>
      </section>
      <article className="incident-report">
        <header>
          <ShieldCheck size={30} aria-hidden="true" />
          <div>
            <h1>FraudFirst Incident Summary</h1>
            <p>This document is an AI-assisted incident summary prepared from the information you provided. It has not been submitted to any authority.</p>
          </div>
        </header>
        <label className="report-toggle">
          <input type="checkbox" checked={includeFull} onChange={(event) => setIncludeFull(event.target.checked)} />
          Include full transaction details in report
        </label>
        <p className="disclaimer">Review this report before sharing it. Uploaded screenshots are not included in the printable MVP.</p>
        <section><h2>Generated details</h2><p>{generatedAt}</p><p>Temporary incident reference ID: {analysis.analysisId}</p><p>Preferred language: {analysis.language}</p></section>
        <section><h2>User-provided incident description</h2><p>{form?.incidentDescription || "Not stored in session"}</p></section>
        <section><h2>Analysis summary</h2><p>{analysis.reportSummary}</p><p>{analysis.risk.summary}</p></section>
        <section><h2>Suspected scam category</h2><p>{analysis.suspectedScam.category}: {analysis.suspectedScam.description}</p></section>
        <section><h2>Risk indicators</h2><ul>{analysis.risk.indicators.map((item) => <li key={item.title}><strong>{item.title}</strong>: {item.explanation}</li>)}</ul></section>
        <section><h2>Transaction details</h2><dl>{rows(analysis.extractedDetails, includeFull).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "Not detected"}</dd></div>)}</dl></section>
        <section>
          <h2>Evidence inventory</h2>
          {form?.evidenceInventory?.length ? (
            <ul>{form.evidenceInventory.map((item) => <li key={`-`}>{item.name} ({item.type})</li>)}</ul>
          ) : <p>No screenshot file metadata retained.</p>}
        </section>
        <section><h2>Missing evidence</h2><ul>{analysis.evidence.missing.map((item) => <li key={item.label}>{item.label}: {item.description}</li>)}</ul></section>
        <section><h2>Incident timeline</h2><ol>{analysis.timeline.map((item, index) => <li key={`${item.title}-${index}`}>{item.date || "Date not detected"} {item.time || ""}: {item.title}. {item.description}</li>)}</ol></section>
        <section><h2>Immediate recommended actions</h2><ol>{analysis.immediateActions.map((item) => <li key={item.priority}>{item.title}: {item.description}</li>)}</ol></section>
        <section><h2>Analysis limitations</h2><ul>{analysis.limitations.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section><h2>Official reporting resources</h2><p>Cybercrime helpline: {officialResources.cybercrimeHelpline.value}</p><p>National Cybercrime Reporting Portal: {officialResources.reportingPortal.href}</p></section>
        <section><h2>Safety disclaimer</h2><p>{analysis.safetyDisclaimer}</p></section>
        <footer>FraudFirst AI-assisted incident summary. Review before sharing.</footer>
      </article>
    </PageContainer>
  );
}
