import { AlertTriangle, ArrowLeft, ArrowRight, FlaskConical, LoaderCircle, Send, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { aiNameToLanguageCode, languageCodeToAiName, languageOptions } from "../i18n/index.js";
import { analyzeIncident } from "../services/analysisApi.js";
import { saveAnalysis, saveFormDetails } from "../utils/storage.js";
import { hasMeaningfulEvidence } from "../utils/validation.js";

function createInitialState(languageCode) {
  return {
    situationType: "",
    suspiciousText: "",
    preferredLanguage: languageCodeToAiName(languageCode),
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
}

const paymentValues = ["UPI", "Bank transfer", "Debit card", "Credit card", "Digital wallet", "QR code", "Cash deposit", "Other", "Not sure"];
const paymentKeys = ["upi", "bank", "debit", "credit", "wallet", "qr", "cash", "other", "unsure"];

export default function CheckPage() {
  const { t, i18n } = useTranslation();
  const activeLanguage = i18n.resolvedLanguage || i18n.language || "en";
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => createInitialState(activeLanguage));
  const [errorKey, setErrorKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const abortRef = useRef(null);
  const navigate = useNavigate();

  const steps = t("check.steps", { returnObjects: true });
  const loadingMessages = t("check.loading", { returnObjects: true });
  const paymentOptions = paymentValues.map((value, index) => ({ value, label: t(`check.paymentOptions.${paymentKeys[index]}`) }));
  const preferredLanguageOptions = languageOptions.map((language) => ({ value: language.aiName, label: language.nativeName }));
  const samples = t("check.samples", { returnObjects: true });
  const currentPreferredLanguage = languageCodeToAiName(activeLanguage);

  useEffect(() => {
    if (!loading) return undefined;
    const timer = window.setInterval(() => setLoadingIndex((index) => (index + 1) % loadingMessages.length), 2200);
    return () => window.clearInterval(timer);
  }, [loading, loadingMessages.length]);

  const errorMessage = useMemo(() => errorKey ? t(errorKey) : "", [errorKey, t]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrorKey("");
  }

  function updatePreferredLanguage(value) {
    update("preferredLanguage", value);
    const nextCode = aiNameToLanguageCode(value);
    if (nextCode !== activeLanguage) i18n.changeLanguage(nextCode);
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
    if (step === 0 && !form.situationType) return "check.validation.chooseSituation";
    if (step === 1 && !hasMeaningfulEvidence(form)) return "check.validation.missingEvidence";
    if (step === 3 && !form.privacyConfirmed) return "check.validation.privacy";
    return "";
  }

  function next() {
    const validation = canAdvance();
    if (validation) return setErrorKey(validation);
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  async function submit() {
    const validation = canAdvance();
    if (validation) return setErrorKey(validation);
    setLoading(true);
    setErrorKey("");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const submission = { ...form, preferredLanguage: currentPreferredLanguage };
      const analysis = await analyzeIncident(submission, controller.signal);
      saveAnalysis(analysis);
      saveFormDetails(submission);
      navigate("/results");
    } catch (err) {
      if (err.name === "AbortError") {
        setErrorKey("check.validation.cancelled");
        setStep(3);
      } else {
        setErrorKey(err.code === "AI_NOT_CONFIGURED" ? "check.validation.aiUnavailable" : "api.generic");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function loadSample(scenario, index) {
    setForm((current) => ({
      ...current,
      situationType: index === 1 ? "money_transferred" : "suspicious_received",
      suspiciousText: scenario.text,
      incidentDescription: scenario.description,
      paymentMethod: index === 1 || index === 2 ? "UPI" : "Not sure"
    }));
  }

  if (loading) {
    return (
      <PageContainer className="check-page">
        <section className="analysis-loading" role="status" aria-live="polite">
          <LoaderCircle className="spin" size={34} aria-hidden="true" />
          <h1>{loadingMessages[loadingIndex]}</h1>
          <p>{t("check.loadingNote")}</p>
          <Button type="button" variant="secondary" onClick={() => abortRef.current?.abort()}>{t("check.cancelAnalysis")}</Button>
        </section>
      </PageContainer>
    );
  }

  return (
    <PageContainer className={`check-page ${form.situationType === "money_transferred" ? "emergency-mode" : ""}`}>
      <Stepper steps={steps} current={step} />
      {errorMessage ? <ErrorState title={t("check.errorTitle")} message={errorMessage} actionLabel={t("check.continueEditing")} onAction={() => setErrorKey("")} /> : null}
      <section className="workflow-card">
        {step === 0 ? (
          <>
            <h1>{t("check.situationTitle")}</h1>
            <div className="situation-grid">
              <SituationCard value="suspicious_received" selected={form.situationType === "suspicious_received"} onSelect={(value) => update("situationType", value)} title={t("check.suspiciousTitle")} description={t("check.suspiciousDescription")} />
              <SituationCard value="money_transferred" selected={form.situationType === "money_transferred"} onSelect={(value) => update("situationType", value)} title={t("check.transferredTitle")} description={t("check.transferredDescription")} />
            </div>
            {form.situationType === "money_transferred" ? <AlertCard title={t("check.emergencyModeTitle")} tone="danger" icon={ShieldAlert}>{t("check.emergencyModeText")}</AlertCard> : null}
            <div className="sample-row">
              {samples.map((scenario, index) => (
                <Button key={scenario.title} type="button" variant="ghost" icon={FlaskConical} onClick={() => loadSample(scenario, index)}>{scenario.title}</Button>
              ))}
            </div>
          </>
        ) : null}
        {step === 1 ? (
          <>
            <h1>{t("check.addEvidence")}</h1>
            <UploadDropzone files={form.evidenceFiles} onAddFiles={addFiles} onRemoveFile={removeFile} />
            <TextArea label={t("check.pasteMessage")} id="suspiciousText" placeholder={t("check.pastePlaceholder")} rows="7" showCount value={form.suspiciousText} onChange={(event) => update("suspiciousText", event.target.value)} />
          </>
        ) : null}
        {step === 2 ? (
          <>
            <h1>{t("check.incidentDetails")}</h1>
            <AlertCard title={t("check.sensitiveTitle")} icon={AlertTriangle}>{t("check.sensitiveText")}</AlertCard>
            <div className="form-grid">
              <SelectField label={t("check.preferredLanguage")} id="preferredLanguage" value={currentPreferredLanguage} onChange={(event) => updatePreferredLanguage(event.target.value)} options={preferredLanguageOptions} />
              <TextArea label={t("check.incidentDescription")} id="incidentDescription" placeholder={t("check.placeholders.incidentDescription")} rows="5" value={form.incidentDescription} onChange={(event) => update("incidentDescription", event.target.value)} />
              <InputField label={t("check.amountTransferred")} id="amount" placeholder={t("check.placeholders.amount")} value={form.amount} onChange={(event) => update("amount", event.target.value)} />
              <InputField label={t("check.currency")} id="currency" value={form.currency} onChange={(event) => update("currency", event.target.value)} />
              <InputField label={t("check.transactionDate")} id="transactionDate" type="date" value={form.transactionDate} onChange={(event) => update("transactionDate", event.target.value)} />
              <InputField label={t("check.transactionTime")} id="transactionTime" type="time" value={form.transactionTime} onChange={(event) => update("transactionTime", event.target.value)} />
              <SelectField label={t("check.paymentMethod")} id="paymentMethod" value={form.paymentMethod} onChange={(event) => update("paymentMethod", event.target.value)} options={paymentOptions} />
              <InputField label={t("check.bankOrWallet")} id="bankOrWallet" placeholder={t("check.placeholders.bankOrWallet")} value={form.bankOrWallet} onChange={(event) => update("bankOrWallet", event.target.value)} />
              <InputField label={t("check.transactionId")} id="transactionId" placeholder={t("check.placeholders.transactionId")} value={form.transactionId} onChange={(event) => update("transactionId", event.target.value)} />
              <InputField label={t("check.upiId")} id="upiId" placeholder={t("check.placeholders.upiId")} value={form.upiId} onChange={(event) => update("upiId", event.target.value)} />
              <InputField label={t("check.suspectedPhone")} id="suspectedPhone" placeholder={t("check.placeholders.suspectedPhone")} value={form.suspectedPhone} onChange={(event) => update("suspectedPhone", event.target.value)} />
              <InputField label={t("check.suspectedEmail")} id="suspectedEmail" placeholder={t("check.placeholders.suspectedEmail")} value={form.suspectedEmail} onChange={(event) => update("suspectedEmail", event.target.value)} />
              <InputField label={t("check.suspiciousUrl")} id="suspiciousUrl" placeholder={t("check.placeholders.suspiciousUrl")} value={form.suspiciousUrl} onChange={(event) => update("suspiciousUrl", event.target.value)} />
              <InputField label={t("check.impersonatedEntity")} id="impersonatedEntity" placeholder={t("check.placeholders.impersonatedEntity")} value={form.impersonatedEntity} onChange={(event) => update("impersonatedEntity", event.target.value)} />
            </div>
          </>
        ) : null}
        {step === 3 ? (
          <>
            <h1>{t("check.reviewTitle")}</h1>
            <ReviewSection title={t("check.selectedSituation")}><p>{form.situationType === "money_transferred" ? t("check.transferredTitle") : t("check.suspiciousTitle")}</p></ReviewSection>
            <ReviewSection title={t("check.evidenceInventory")}><p>{t("check.screenshotCount", { count: form.evidenceFiles.length })}</p><p>{form.suspiciousText || t("check.noPastedMessage")}</p></ReviewSection>
            <ReviewSection title={t("check.incidentDescription")}><p>{form.incidentDescription || t("check.noDescription")}</p></ReviewSection>
            <ReviewSection title={t("check.transactionDetails")}><p>{[form.amount, form.currency, paymentOptions.find((option) => option.value === form.paymentMethod)?.label, form.transactionId, form.upiId].filter(Boolean).join(" · ") || t("check.noTransactionDetails")}</p></ReviewSection>
            <ReviewSection title={t("check.preferredLanguage")}><p>{preferredLanguageOptions.find((option) => option.value === currentPreferredLanguage)?.label}</p></ReviewSection>
            <PrivacyConfirmation checked={form.privacyConfirmed} onChange={(checked) => update("privacyConfirmed", checked)} />
          </>
        ) : null}
        <div className="workflow-actions">
          <Button type="button" variant="secondary" icon={ArrowLeft} disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>{t("common.backAndEdit")}</Button>
          {step < 3 ? <Button type="button" icon={ArrowRight} onClick={next}>{t("common.continue")}</Button> : <Button type="button" icon={Send} onClick={submit}>{t("check.analyzeIncident")}</Button>}
        </div>
      </section>
    </PageContainer>
  );
}
