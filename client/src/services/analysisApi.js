const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function parseResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

export async function analyzeIncident(formState, signal) {
  const formData = new FormData();
  const fields = [
    "situationType", "suspiciousText", "preferredLanguage", "incidentDescription", "amount", "currency",
    "transactionDate", "transactionTime", "paymentMethod", "bankOrWallet", "transactionId", "upiId",
    "suspectedPhone", "suspectedEmail", "suspiciousUrl", "impersonatedEntity", "privacyConfirmed"
  ];

  for (const field of fields) {
    formData.append(field, formState[field] ?? "");
  }
  for (const evidence of formState.evidenceFiles || []) {
    formData.append("evidenceFiles", evidence.file);
  }

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    body: formData,
    signal
  });
  const payload = await parseResponse(response);
  if (!response.ok) {
    const code = payload?.error?.code || "UNKNOWN_ERROR";
    const fallback = code === "AI_NOT_CONFIGURED"
      ? "AI analysis is temporarily unavailable. Please try again later."
      : "We could not complete the AI analysis. Your entered information has been preserved. Please try again.";
    throw Object.assign(new Error(payload?.error?.message || fallback), { code, status: response.status });
  }
  return payload.analysis;
}
