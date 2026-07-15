import { ArrowRight, CheckCircle2, FileText, LockKeyhole, ShieldCheck, UploadCloud } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/common/Button.jsx";
import { Disclaimer } from "../components/common/Disclaimer.jsx";
import { PageContainer } from "../components/layout/PageContainer.jsx";
import { SectionHeading } from "../components/layout/SectionHeading.jsx";

export default function LandingPage() {
  const { t } = useTranslation();
  const trustItems = t("hero.trust", { returnObjects: true });
  const features = t("landing.features", { returnObjects: true });
  const icons = [UploadCloud, ShieldCheck, LockKeyhole, FileText];

  return (
    <PageContainer className="landing-page">
      <section className="hero">
        <div className="hero-copy">
          <p className="badge">{t("hero.badge")}</p>
          <h1>{t("hero.heading")}</h1>
          <p>{t("hero.description")}</p>
          <div className="hero-actions">
            <Button to="/check" icon={ArrowRight}>{t("hero.emergencyButton")}</Button>
            <Button to="/check" variant="secondary">{t("hero.suspiciousButton")}</Button>
          </div>
          <ul className="trust-list">
            {trustItems.map((item) => <li key={item}><CheckCircle2 size={17} aria-hidden="true" />{item}</li>)}
          </ul>
        </div>
        <div className="product-preview" aria-label={t("hero.previewAria")}>
          <div>
            <span className="risk-dot" />
            <strong>{t("hero.previewRisk")}</strong>
            <p>{t("hero.previewDescription")}</p>
          </div>
          <dl>
            <div><dt>{t("hero.amount")}</dt><dd>******8500</dd></div>
            <div><dt>{t("hero.method")}</dt><dd>UPI</dd></div>
            <div><dt>{t("hero.action")}</dt><dd>{t("hero.previewAction")}</dd></div>
          </dl>
        </div>
      </section>

      <section id="how-it-works" className="content-band">
        <SectionHeading eyebrow={t("landing.howEyebrow")} title={t("landing.howTitle")} />
        <div className="feature-grid">
          {features.map((feature, index) => {
            const Icon = icons[index];
            return (
              <article key={feature.title}>
                <Icon size={25} aria-hidden="true" />
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="privacy" className="content-band privacy-band">
        <SectionHeading eyebrow={t("landing.privacyEyebrow")} title={t("landing.privacyTitle")}>
          {t("landing.privacyText")}
        </SectionHeading>
        <Disclaimer>{t("footer.disclaimer")}</Disclaimer>
      </section>
    </PageContainer>
  );
}
