import { useTranslation } from "react-i18next";
import { EmptyState } from "../components/common/EmptyState.jsx";

export default function NotFoundPage() {
  const { t } = useTranslation();
  return <EmptyState title={t("notFound.title")} message={t("notFound.message")} actionLabel={t("notFound.action")} to="/" />;
}
