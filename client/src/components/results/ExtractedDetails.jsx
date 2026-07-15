import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { maskValue } from "../../utils/privacy.js";
import { IconButton } from "../common/IconButton.jsx";

const rows = [
  ["details.amount", "amount"],
  ["details.currency", "currency", "plain"],
  ["details.transactionId", "transactionId"],
  ["details.date", "transactionDate", "plain"],
  ["details.time", "transactionTime", "plain"],
  ["details.paymentMethod", "paymentMethod", "plain"],
  ["details.bankOrWallet", "bankOrWallet", "plain"],
  ["details.upiId", "upiId", "upi"],
  ["details.phone", "phoneNumbers", "phone"],
  ["details.email", "emails", "email"],
  ["details.url", "urls", "plain"],
  ["details.impersonatedOrganisation", "impersonatedEntity", "plain"]
];

function pick(details, key) {
  const value = details[key];
  return Array.isArray(value) ? value[0] : value;
}

export function ExtractedDetails({ details }) {
  const [revealed, setRevealed] = useState({});
  const { t } = useTranslation();
  return (
    <section className="result-panel">
      <div className="panel-title">
        <h2>{t("results.extractedDetails")}</h2>
        <p>{t("results.maskedDefault")}</p>
      </div>
      <dl className="detail-list">
        {rows.map(([labelKey, key, type = "generic"]) => {
          const value = pick(details, key);
          const display = !value ? t("common.notDetected") : revealed[key] || type === "plain" ? value : maskValue(value, type);
          const action = revealed[key] ? t("common.hide") : t("common.show");
          return (
            <div key={key}>
              <dt>{t(labelKey)}</dt>
              <dd>
                <span>{display}</span>
                {value && type !== "plain" ? (
                  <IconButton
                    label={`${action} ${t(labelKey)}`}
                    icon={revealed[key] ? EyeOff : Eye}
                    onClick={() => setRevealed((current) => ({ ...current, [key]: !current[key] }))}
                  />
                ) : null}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
