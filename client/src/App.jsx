import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Route, Routes } from "react-router-dom";
import { AppHeader } from "./components/layout/AppHeader.jsx";
import { AppFooter } from "./components/layout/AppFooter.jsx";
import { LoadingState } from "./components/common/LoadingState.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import CheckPage from "./pages/CheckPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import { useRouteFocus } from "./hooks/useRouteFocus.js";

const ResultsPage = lazy(() => import("./pages/ResultsPage.jsx"));
const ReportPage = lazy(() => import("./pages/ReportPage.jsx"));

export default function App() {
  const { t } = useTranslation();
  useRouteFocus();
  return (
    <div className="app-shell">
      <AppHeader />
      <main id="main-content" tabIndex="-1">
        <Suspense fallback={<LoadingState message={t("check.loading.0")} />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/check" element={<CheckPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <AppFooter />
    </div>
  );
}
