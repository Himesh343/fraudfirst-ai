import { Copy, FileText, Pencil, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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

function buildSummary(analysis, t) {
  return [
    `${t("results.title")}: ${analysis.risk.label} (${analysis.risk.confidence}). ${analysis.risk.summary}`,
    `${t("report.suspectedScam")}: ${analysis.suspectedScam.category}`,
    `${t("results.immediateActions")}: ${analysis.immediateActions.map((item) => `${item.priority}. ${item.title} - ${item.description}`).join(" ")}`,
    `${t("results.extractedDetails")}: ${JSON.stringify(analysis.extractedDetails)}`,
    `${t("results.missingEvidence")}: ${analysis.evidence.missing.map((item) => item.label).join(", ") || t("common.notDetected")}`,
    `${t("report.reportDisclaimer")}: ${analysis.safetyDisclaimer}`
  ].join("\n\n");
}

export default function ResultsPage() {
  const [analysis] = useState(getAnalysis());
  const [copied, setCopied] = useState(false);
  const headingRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  if (!analysis) {
    return <EmptyState title={t("results.noAnalysisTitle")} message={t("results.noAnalysisMessage")} actionLabel={t("results.startIncidentCheck")} to="/check" />;
  }

  async function copySummary() {
    await navigator.clipboard.writeText(buildSummary(analysis, t));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  function startNew() {
    clearSessionData();
    navigate("/check");
  }

  return (
    <PageContainer className="results-page">
      <h1 ref={headingRef} tabIndex="-1">{t("results.title")}</h1>
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
        <Button to="/report" icon={FileText}>{t("results.generateReport")}</Button>
        <Button type="button" variant="secondary" icon={Copy} onClick={copySummary}>{copied ? t("results.summaryCopied") : t("results.copySummary")}</Button>
        <Button type="button" variant="secondary" icon={RotateCcw} onClick={startNew}>{t("common.startNewCheck")}</Button>
        <Button to="/check" variant="ghost" icon={Pencil}>{t("results.editAgain")}</Button>
      </section>
    </PageContainer>
  );
}
