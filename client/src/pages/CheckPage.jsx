import { AlertTriangle, ArrowLeft, ArrowRight, FlaskConical, LoaderCircle, Send, ShieldAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCard } from "../components/common/AlertCard.jsx";
import { Button } from "../components/common/Button.jsx";
import { ErrorState } from "../components/common/ErrorState.jsx";
import { InputField } from "../components/forms/InputField.jsx";
import { PrivacyConfirmation } from "../components/forms/PrivacyConfirmation.jsx";
import { ReviewSection } from "../components/forms/ReviewSection.jsx";
import { SelectField } from "../components/forms/SelectField.jsx";
import { SituationCard } from "../components/forms/SituationCard.jsx";
import { Stepper } from "../components/forms/Stepper.jsx";
import { TextArea } from "../components/forms/TextArea.jsx";
import { UploadDropzone } from "../components/forms/UploadDropzone.jsx";
import { PageContainer } from "../components/layout/PageContainer.jsx";
import { analyzeIncident } from "../services/analysisApi.js";
import { saveAnalysis, saveFormDetails } from "../utils/storage.js";
import { hasMeaningfulEvidence } from "../utils/validation.js";
import { sampleScenarios } from "../utils/sampleScenarios.js";

const initialState = {
  situationType: "",
  suspiciousText: "",
  preferredLanguage: "English",
  incidentDescription: "",
  amount: "",
  currency: "INR",
  transactionDate: "",
  transactionTime: "",
  paymentMethod: "Not sure",
  bankOrWallet: "",
  transactionId: "",
  upiId: "",
  suspectedPhone: "",
  suspectedEmail: "",
  suspiciousUrl: "",
  impersonatedEntity: "",
  privacyConfirmed: false,
  evidenceFiles: []
};
const steps = ["Situation", "Evidence", "Details", "Review"];
const loadingMessages = [
  "Reviewing the submitted evidence",
  "Reading visible text and transaction details",
  "Identifying possible fraud patterns",
  "Organising the incident timeline",
  "Preparing recommended next steps"
];

export default function CheckPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const abortRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) return undefined;
    const timer = window.setInterval(() => setLoadingIndex((index) => (index + 1) % loadingMessages.length), 2200);
    return () => window.clearInterval(timer);
  }, [loading]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function addFiles(files) {
    const wrapped = files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    setForm((current) => ({ ...current, evidenceFiles: [...current.evidenceFiles, ...wrapped] }));
  }

  function removeFile(index) {
    setForm((current) => {
      URL.revokeObjectURL(current.evidenceFiles[index].previewUrl);
      return { ...current, evidenceFiles: current.evidenceFiles.filter((_, itemIndex) => itemIndex !== index) };
    });
  }

  function canAdvance() {
    if (step === 0 && !form.situationType) return "Choose the situation that best fits.";
    if (step === 1 && !hasMeaningfulEvidence(form)) return "Add a screenshot, pasted message or meaningful description before continuing.";
    if (step === 3 && !form.privacyConfirmed) return "Please confirm the privacy acknowledgement.";
    return "";
  }

  function next() {
    const validation = canAdvance();
    if (validation) return setError(validation);
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  async function submit() {
    const validation = canAdvance();
    if (validation) return setError(validation);
    setLoading(true);
    setError("");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const analysis = await analyzeIncident(form, controller.signal);
      saveAnalysis(analysis);
      saveFormDetails(form);
      navigate("/results");
    } catch (err) {
      if (err.name === "AbortError") {
        setError("Analysis was cancelled. Your entered information has been preserved.");
        setStep(3);
      } else {
        setError(err.code === "AI_NOT_CONFIGURED" ? "AI analysis is temporarily unavailable. Please try again later." : err.message);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  if (loading) {
    return (
      <PageContainer className="check-page">
        <section className="analysis-loading" role="status" aria-live="polite">
          <LoaderCircle className="spin" size={34} aria-hidden="true" />
          <h1>{loadingMessages[loadingIndex]}</h1>
          <p>FraudFirst is preparing AI-assisted guidance. No fake percentages are shown.</p>
          <Button type="button" variant="secondary" onClick={() => abortRef.current?.abort()}>Cancel analysis</Button>
        </section>
      </PageContainer>
    );
  }

  return (
    <PageContainer className={`check-page ${form.situationType === "money_transferred" ? "emergency-mode" : ""}`}>
      <Stepper steps={steps} current={step} />
      {error ? <ErrorState title="Check the details" message={error} actionLabel="Continue editing" onAction={() => setError("")} /> : null}
      <section className="workflow-card">
        {step === 0 ? (
          <>
            <h1>Choose your situation</h1>
            <div className="situation-grid">
              <SituationCard value="suspicious_received" selected={form.situationType === "suspicious_received"} onSelect={(value) => update("situationType", value)} title="I received something suspicious" description="Analyse a message, email, payment request, QR code or screenshot before taking further action." />
              <SituationCard value="money_transferred" selected={form.situationType === "money_transferred"} onSelect={(value) => update("situationType", value)} title="I already transferred money" description="Get urgent guidance and organise transaction evidence immediately." />
            </div>
            {form.situationType === "money_transferred" ? <AlertCard title="Emergency Mode enabled" tone="danger" icon={ShieldAlert}>Acting quickly may be important. Keep the information calm, complete and accurate.</AlertCard> : null}
            <div className="sample-row">
              {sampleScenarios.map((scenario) => (
                <Button key={scenario.title} type="button" variant="ghost" icon={FlaskConical} onClick={() => setForm((current) => ({ ...current, ...scenario }))}>{scenario.title}</Button>
              ))}
            </div>
          </>
        ) : null}
        {step === 1 ? (
          <>
            <h1>Add evidence</h1>
            <UploadDropzone files={form.evidenceFiles} onAddFiles={addFiles} onRemoveFile={removeFile} />
            <TextArea label="Paste the suspicious message" id="suspiciousText" placeholder="Paste the SMS, WhatsApp message, email or other suspicious content here." rows="7" showCount value={form.suspiciousText} onChange={(event) => update("suspiciousText", event.target.value)} />
          </>
        ) : null}
        {step === 2 ? (
          <>
            <h1>Incident details</h1>
            <AlertCard title="Sensitive information reminder" icon={AlertTriangle}>Never enter your password, PIN, OTP or CVV.</AlertCard>
            <div className="form-grid">
              <SelectField label="Preferred language" id="preferredLanguage" value={form.preferredLanguage} onChange={(event) => update("preferredLanguage", event.target.value)} options={["English", "Hindi", "Kannada"]} />
              <TextArea label="Incident description" id="incidentDescription" rows="5" value={form.incidentDescription} onChange={(event) => update("incidentDescription", event.target.value)} />
              <InputField label="Amount transferred" id="amount" value={form.amount} onChange={(event) => update("amount", event.target.value)} />
              <InputField label="Currency" id="currency" value={form.currency} onChange={(event) => update("currency", event.target.value)} />
              <InputField label="Transaction date" id="transactionDate" type="date" value={form.transactionDate} onChange={(event) => update("transactionDate", event.target.value)} />
              <InputField label="Transaction time" id="transactionTime" type="time" value={form.transactionTime} onChange={(event) => update("transactionTime", event.target.value)} />
              <SelectField label="Payment method" id="paymentMethod" value={form.paymentMethod} onChange={(event) => update("paymentMethod", event.target.value)} options={["UPI", "Bank transfer", "Debit card", "Credit card", "Digital wallet", "QR code", "Cash deposit", "Other", "Not sure"]} />
              <InputField label="Bank or wallet" id="bankOrWallet" value={form.bankOrWallet} onChange={(event) => update("bankOrWallet", event.target.value)} />
              <InputField label="Transaction ID or UTR" id="transactionId" value={form.transactionId} onChange={(event) => update("transactionId", event.target.value)} />
              <InputField label="UPI ID" id="upiId" value={form.upiId} onChange={(event) => update("upiId", event.target.value)} />
              <InputField label="Suspected phone number" id="suspectedPhone" value={form.suspectedPhone} onChange={(event) => update("suspectedPhone", event.target.value)} />
              <InputField label="Suspected email address" id="suspectedEmail" value={form.suspectedEmail} onChange={(event) => update("suspectedEmail", event.target.value)} />
              <InputField label="Suspicious website URL" id="suspiciousUrl" value={form.suspiciousUrl} onChange={(event) => update("suspiciousUrl", event.target.value)} />
              <InputField label="Name of impersonated person or organisation" id="impersonatedEntity" value={form.impersonatedEntity} onChange={(event) => update("impersonatedEntity", event.target.value)} />
            </div>
          </>
        ) : null}
        {step === 3 ? (
          <>
            <h1>Review submission</h1>
            <ReviewSection title="Selected situation"><p>{form.situationType === "money_transferred" ? "I already transferred money" : "I received something suspicious"}</p></ReviewSection>
            <ReviewSection title="Evidence inventory"><p>{form.evidenceFiles.length} screenshot(s)</p><p>{form.suspiciousText || "No pasted message"}</p></ReviewSection>
            <ReviewSection title="Incident description"><p>{form.incidentDescription || "No description provided"}</p></ReviewSection>
            <ReviewSection title="Transaction details"><p>{[form.amount, form.currency, form.paymentMethod, form.transactionId, form.upiId].filter(Boolean).join(" · ") || "No transaction details provided"}</p></ReviewSection>
            <ReviewSection title="Preferred language"><p>{form.preferredLanguage}</p></ReviewSection>
            <PrivacyConfirmation checked={form.privacyConfirmed} onChange={(checked) => update("privacyConfirmed", checked)} />
          </>
        ) : null}
        <div className="workflow-actions">
          <Button type="button" variant="secondary" icon={ArrowLeft} disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>Back and Edit</Button>
          {step < 3 ? <Button type="button" icon={ArrowRight} onClick={next}>Continue</Button> : <Button type="button" icon={Send} onClick={submit}>Analyse Incident</Button>}
        </div>
      </section>
    </PageContainer>
  );
}
