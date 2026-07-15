import { ArrowRight, CheckCircle2, FileText, LockKeyhole, ShieldCheck, UploadCloud } from "lucide-react";
import { Button } from "../components/common/Button.jsx";
import { Disclaimer } from "../components/common/Disclaimer.jsx";
import { PageContainer } from "../components/layout/PageContainer.jsx";
import { SectionHeading } from "../components/layout/SectionHeading.jsx";

export default function LandingPage() {
  return (
    <PageContainer className="landing-page">
      <section className="hero">
        <div className="hero-copy">
          <p className="badge">AI Cyber-Fraud Emergency Assistant</p>
          <h1>Been targeted by a digital scam?</h1>
          <p>FraudFirst helps you understand suspicious activity, preserve important evidence and prepare the information needed for official reporting.</p>
          <div className="hero-actions">
            <Button to="/check" icon={ArrowRight}>Start Emergency Check</Button>
            <Button to="/check" variant="secondary">Check a Suspicious Message</Button>
          </div>
          <ul className="trust-list">
            {["No account required", "Session-only processing", "Evidence stays under your control", "AI-assisted, human-review recommended"].map((item) => (
              <li key={item}><CheckCircle2 size={17} aria-hidden="true" />{item}</li>
            ))}
          </ul>
        </div>
        <div className="product-preview" aria-label="FraudFirst product preview">
          <div>
            <span className="risk-dot" />
            <strong>Strong fraud indicators detected</strong>
            <p>Payment pressure, suspicious link and impersonation pattern identified.</p>
          </div>
          <dl>
            <div><dt>Amount</dt><dd>******8500</dd></div>
            <div><dt>Method</dt><dd>UPI</dd></div>
            <div><dt>Action</dt><dd>Contact provider using official app</dd></div>
          </dl>
        </div>
      </section>

      <section id="how-it-works" className="content-band">
        <SectionHeading eyebrow="How FraudFirst Helps" title="A calmer path through the first hour" />
        <div className="feature-grid">
          {[
            [UploadCloud, "Share the evidence", "Upload screenshots, paste messages or describe what happened."],
            [ShieldCheck, "Understand the warning signs", "AI reviews patterns while keeping uncertainty visible."],
            [LockKeyhole, "Preserve important information", "See what evidence is found, missing and worth saving."],
            [FileText, "Prepare for official reporting", "Generate a neutral incident summary you can review."]
          ].map(([Icon, title, text]) => (
            <article key={title}>
              <Icon size={25} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="privacy" className="content-band privacy-band">
        <SectionHeading eyebrow="Privacy" title="Designed for sensitive moments">
          Uploaded evidence is processed for the current request. FraudFirst does not permanently store files. Never upload passwords, PINs, OTPs or CVV numbers, and review AI-generated information before sharing it.
        </SectionHeading>
        <Disclaimer>FraudFirst provides AI-assisted guidance and does not replace banks, law enforcement or official cybercrime authorities.</Disclaimer>
      </section>
    </PageContainer>
  );
}
