import { z } from "zod";

export const situationTypes = ["suspicious_received", "money_transferred"];
export const preferredLanguages = ["English", "Hindi", "Kannada"];
export const paymentMethods = [
  "UPI",
  "Bank transfer",
  "Debit card",
  "Credit card",
  "Digital wallet",
  "QR code",
  "Cash deposit",
  "Other",
  "Not sure"
];
export const currencies = ["INR"];

const optionalText = (max, message) => z.string().trim().max(max, message).optional();
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function isValidCalendarDate(value) {
  if (!datePattern.test(value)) {
    return false;
  }

  const date = new Date(value + "T00:00:00.000Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const incidentRequestSchema = z.object({
  situationType: z.enum(situationTypes, { message: "Choose a supported situation type." }),
  suspiciousText: optionalText(10000, "Suspicious message must be 10,000 characters or fewer."),
  preferredLanguage: z.enum(preferredLanguages, { message: "Choose English, Hindi, or Kannada." }),
  incidentDescription: optionalText(5000, "Incident description must be 5,000 characters or fewer."),
  amount: z
    .string()
    .trim()
    .refine((value) => /^\d+(\.\d+)?$/.test(value), "Enter a valid non-negative amount.")
    .optional(),
  currency: z.enum(currencies, { message: "Choose a supported currency." }).optional(),
  transactionDate: z.string().trim().refine(isValidCalendarDate, "Enter a valid date in YYYY-MM-DD format.").optional(),
  transactionTime: z.string().trim().regex(timePattern, "Enter a valid time in HH:mm format.").optional(),
  paymentMethod: z.enum(paymentMethods, { message: "Choose a supported payment method." }).optional(),
  bankOrWallet: optionalText(200, "Bank or wallet name must be 200 characters or fewer."),
  transactionId: optionalText(200, "Transaction ID must be 200 characters or fewer."),
  upiId: optionalText(200, "UPI ID must be 200 characters or fewer."),
  suspectedPhone: optionalText(40, "Phone number must be 40 characters or fewer."),
  suspectedEmail: z.string().trim().email("Enter a valid email address.").optional(),
  suspiciousUrl: z.string().trim().refine(isHttpUrl, "Enter a valid HTTP or HTTPS URL.").optional(),
  impersonatedEntity: optionalText(200, "Impersonated entity must be 200 characters or fewer.")
});
