import styles from "./relay-tools.module.css";

export function RelayRangeField({
  id,
  label,
  value,
  unit,
  min,
  max,
  step,
  midpoint,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  midpoint: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className={styles.rangeField}>
      <div className={styles.rangeLabel}>
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>
          {value.toLocaleString("id-ID")} <span>{unit}</span>
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={`${value.toLocaleString("id-ID")} ${unit}`}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className={styles.rangeBounds} aria-hidden="true">
        <span>{min.toLocaleString("id-ID")}</span>
        <span>{midpoint}</span>
        <span>{max.toLocaleString("id-ID")}</span>
      </div>
    </div>
  );
}
