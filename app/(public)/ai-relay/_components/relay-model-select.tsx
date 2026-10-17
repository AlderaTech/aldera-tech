import type { ModelCatalogItem } from "@/lib/ai-relay-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import styles from "./relay-tools.module.css";

export function RelayModelSelect({
  id,
  label,
  value,
  onValueChange,
  models,
}: {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  models: ModelCatalogItem[];
}) {
  return (
    <div className={styles.modelSelect}>
      <label htmlFor={id}>{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className={styles.selectTrigger}>
          <SelectValue placeholder="Pilih model" />
        </SelectTrigger>
        <SelectContent className="font-jakarta">
          {models
            .filter((model) => model.isActive)
            .map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.displayName}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}
