const expectedFields = [
  "situationType",
  "suspiciousText",
  "preferredLanguage",
  "incidentDescription",
  "amount",
  "currency",
  "transactionDate",
  "transactionTime",
  "paymentMethod",
  "bankOrWallet",
  "transactionId",
  "upiId",
  "suspectedPhone",
  "suspectedEmail",
  "suspiciousUrl",
  "impersonatedEntity"
];

function normalizeValue(value) {
  const raw = Array.isArray(value) ? value.at(-1) : value;

  if (typeof raw !== "string") {
    return undefined;
  }

  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function normalizeFormData(body = {}) {
  const normalized = {};

  for (const field of expectedFields) {
    const value = normalizeValue(body[field]);

    if (value !== undefined) {
      normalized[field] = field === "amount" ? value.replaceAll(",", "").trim() : value;
    }
  }

  return normalized;
}
