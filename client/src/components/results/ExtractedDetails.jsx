import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { maskValue } from "../../utils/privacy.js";
import { IconButton } from "../common/IconButton.jsx";

const rows = [
  ["Amount", "amount"],
  ["Currency", "currency", "plain"],
  ["Transaction ID", "transactionId"],
  ["Date", "transactionDate", "plain"],
  ["Time", "transactionTime", "plain"],
  ["Payment method", "paymentMethod", "plain"],
  ["Bank or wallet", "bankOrWallet", "plain"],
  ["UPI ID", "upiId", "upi"],
  ["Phone number", "phoneNumbers", "phone"],
  ["Email", "emails", "email"],
  ["URL", "urls", "plain"],
  ["Impersonated organisation", "impersonatedEntity", "plain"]
];

function pick(details, key) {
  const value = details[key];
  return Array.isArray(value) ? value[0] : value;
}

export function ExtractedDetails({ details }) {
  const [revealed, setRevealed] = useState({});
  return (
    <section className="result-panel">
      <div className="panel-title">
        <h2>Extracted details</h2>
        <p>Masked by default for privacy</p>
      </div>
      <dl className="detail-list">
        {rows.map(([label, key, type = "generic"]) => {
          const value = pick(details, key);
          const display = !value ? "Not detected" : revealed[key] || type === "plain" ? value : maskValue(value, type);
          return (
            <div key={key}>
              <dt>{label}</dt>
              <dd>
                <span>{display}</span>
                {value && type !== "plain" ? (
                  <IconButton
                    label={`${revealed[key] ? "Hide" : "Reveal"} ${label}`}
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
