import { RELAY_SECTIONS } from "../_data/relay-sections";
import styles from "./relay-workspace.module.css";

export function RelaySectionHeading({
  tab,
  description,
}: {
  tab: string;
  description?: string;
}) {
  const section = RELAY_SECTIONS.find(({ value }) => value === tab);
  if (!section) return null;
  const Icon = section.icon;
  const text = description ?? section.description;
  return (
    <div className={styles.sectionHeading} data-relay-section-heading>
      <div>
        <span aria-hidden="true">
          <Icon />
        </span>
        <h2>{section.label}</h2>
      </div>
      {text && <p>{text}</p>}
    </div>
  );
}
