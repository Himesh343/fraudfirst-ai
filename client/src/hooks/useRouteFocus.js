import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useRouteFocus() {
  const location = useLocation();
  useEffect(() => {
    document.getElementById("main-content")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);
}
