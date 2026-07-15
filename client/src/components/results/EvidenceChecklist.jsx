import { CheckCircle, HelpCircle, ListPlus } from "lucide-react";

const groups = [
  ["Evidence found", "found", CheckCircle],
  ["Missing evidence", "missing", HelpCircle],
  ["Recommended evidence", "recommended", ListPlus]
];

export function EvidenceChecklist({ evidence }) {
  return (
    <section className="result-panel">
      <h2>Evidence checklist</h2>
      <div className="evidence-groups">
        {groups.map(([title, key, Icon]) => (
          <article key={key}>
            <h3><Icon size={18} aria-hidden="true" />{title}</h3>
            <ul>
              {evidence[key].map((item) => (
                <li key={`${key}-${item.label}`}>
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
