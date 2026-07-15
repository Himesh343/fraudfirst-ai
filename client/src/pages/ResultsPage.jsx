import { Copy, FileText, Pencil, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button.jsx";
import { EmptyState } from "../components/common/EmptyState.jsx";
import { PageContainer } from "../components/layout/PageContainer.jsx";
import { ActionChecklist } from "../components/results/ActionChecklist.jsx";
import { EmergencyBanner } from "../components/results/EmergencyBanner.jsx";
import { EvidenceChecklist } from "../components/results/EvidenceChecklist.jsx";
import { ExtractedDetails } from "../components/results/ExtractedDetails.jsx";
import { IncidentTimeline } from "../components/results/IncidentTimeline.jsx";
import { LimitationsCard } from "../components/results/LimitationsCard.jsx";
import { OfficialHelpCard } from "../components/results/OfficialHelpCard.jsx";
import { RiskSummary } from "../components/results/RiskSummary.jsx";
import { clearSessionData, getAnalysis } from "../utils/storage.js";

function buildSummary(analysis) {
  return [
    `Risk summary: ${analysis.risk.label} (${analysis.risk.confidence} confidence). ${analysis.risk.summary}`,
    `Suspected scam category: ${analysis.suspectedScam.category}`,
    `Immediate actions: ${analysis.immediateActions.map((item) => `${item.priority}. ${item.title} - ${item.description}`).join(" ")}`,
    `Extracted details: ${JSON.stringify(analysis.extractedDetails)}`,
    `Missing evidence: ${analysis.evidence.missing.map((item) => item.label).join(", ") || "None listed"}`,
    `Disclaimer: ${analysis.safetyDisclaimer}`
  ].join("\n\n");
}

export default function ResultsPage() {
  const [analysis] = useState(getAnalysis());
  const [copied, setCopied] = useState(false);
  const headingRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  if (!analysis) {
    return <EmptyState title="No analysis yet" message="Complete an incident check before viewing results." actionLabel="Start incident check" to="/check" />;
  }

  async function copySummary() {
    await navigator.clipboard.writeText(buildSummary(analysis));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  function startNew() {
    clearSessionData();
    navigate("/check");
  }

  return (
    <PageContainer className="results-page">
      <h1 ref={headingRef} tabIndex="-1">AI-assisted incident results</h1>
      <EmergencyBanner analysis={analysis} />
      <div className="results-grid">
        <RiskSummary analysis={analysis} />
        <ActionChecklist actions={analysis.immediateActions} />
        <ExtractedDetails details={analysis.extractedDetails} />
        <EvidenceChecklist evidence={analysis.evidence} />
        <IncidentTimeline timeline={analysis.timeline} />
        <LimitationsCard limitations={analysis.limitations} />
        <OfficialHelpCard prominent={analysis.moneyTransferred} />
      </div>
      <section className="result-actions" aria-live="polite">
        <Button to="/report" icon={FileText}>Generate Incident Report</Button>
        <Button type="button" variant="secondary" icon={Copy} onClick={copySummary}>{copied ? "Summary copied" : "Copy Summary"}</Button>
        <Button type="button" variant="secondary" icon={RotateCcw} onClick={startNew}>Start New Check</Button>
        <Button to="/check" variant="ghost" icon={Pencil}>Edit Details and Analyse Again</Button>
      </section>
    </PageContainer>
  );
}
