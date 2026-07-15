import { useTranslation } from "react-i18next";

export function AppFooter() {
  const { t } = useTranslation();
  return (
    <footer className="app-footer">
      <p>{t("footer.disclaimer")}</p>
    </footer>
  );
}
