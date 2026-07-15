const ANALYSIS_KEY = "fraudfirst.latestAnalysis";
const FORM_KEY = "fraudfirst.formDetails";

export function saveAnalysis(analysis) {
  sessionStorage.setItem(ANALYSIS_KEY, JSON.stringify(analysis));
}

export function getAnalysis() {
  try {
    return JSON.parse(sessionStorage.getItem(ANALYSIS_KEY));
  } catch {
    return null;
  }
}

export function saveFormDetails(formState) {
  const { evidenceFiles, suspiciousText, ...rest } = formState;
  const evidenceInventory = evidenceFiles.map((item) => ({
    name: item.file.name,
    type: item.file.type,
    size: item.file.size
  }));
  sessionStorage.setItem(FORM_KEY, JSON.stringify({ ...rest, suspiciousText: suspiciousText ? "[Not stored for privacy]" : "", evidenceInventory }));
}

export function getFormDetails() {
  try {
    return JSON.parse(sessionStorage.getItem(FORM_KEY));
  } catch {
    return null;
  }
}

export function clearSessionData() {
  sessionStorage.removeItem(ANALYSIS_KEY);
  sessionStorage.removeItem(FORM_KEY);
}
