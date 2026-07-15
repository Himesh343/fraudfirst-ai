import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./translations/en.js";
import hi from "./translations/hi.js";
import kn from "./translations/kn.js";

export const LANGUAGE_STORAGE_KEY = "fraudfirst-language";
const LEGACY_LANGUAGE_STORAGE_KEY = "fraudfirst.language";
export const languageOptions = [
  { code: "en", nativeName: "English", aiName: "English" },
  { code: "hi", nativeName: "हिन्दी", aiName: "Hindi" },
  { code: "kn", nativeName: "ಕನ್ನಡ", aiName: "Kannada" }
];

export function languageCodeToAiName(code) {
  return languageOptions.find((language) => language.code === code)?.aiName || "English";
}

export function aiNameToLanguageCode(name) {
  return languageOptions.find((language) => language.aiName === name)?.code || "en";
}

function detectInitialLanguage() {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (["en", "hi", "kn"].includes(stored)) return stored;
  const legacyStored = localStorage.getItem(LEGACY_LANGUAGE_STORAGE_KEY);
  if (["en", "hi", "kn"].includes(legacyStored)) {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, legacyStored);
    localStorage.removeItem(LEGACY_LANGUAGE_STORAGE_KEY);
    return legacyStored;
  }
  const browserLanguage = navigator.language || "en";
  if (browserLanguage.startsWith("hi")) return "hi";
  if (browserLanguage.startsWith("kn")) return "kn";
  return "en";
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    kn: { translation: kn }
  },
  lng: detectInitialLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnObjects: true
});

function applyDocumentLanguage(language) {
  if (typeof document !== "undefined" && ["en", "hi", "kn"].includes(language)) {
    document.documentElement.lang = language;
  }
}

applyDocumentLanguage(i18n.resolvedLanguage || i18n.language);

i18n.on("languageChanged", (language) => {
  if (["en", "hi", "kn"].includes(language)) {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    localStorage.removeItem(LEGACY_LANGUAGE_STORAGE_KEY);
    applyDocumentLanguage(language);
  }
});

export default i18n;

