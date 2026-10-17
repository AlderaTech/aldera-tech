import { Check, Code2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./relay-catalog.module.css";

export interface RelayModelActionsProps {
  id: string;
  copiedId: string | null;
  onCopy: (id: string) => Promise<void>;
  onUse: (id: string) => void;
}

export function RelayCopyModel({
  id,
  copiedId,
  onCopy,
}: Omit<RelayModelActionsProps, "onUse">) {
  return (
    <div className={styles.modelId}>
      <code>{id}</code>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onCopy(id)}
        className={styles.copyButton}
        aria-label={`Salin Model ID ${id}`}
        title="Salin Model ID"
      >
        {copiedId === id ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <Copy className="size-4" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}

export function RelayUseModel({
  id,
  onUse,
}: Pick<RelayModelActionsProps, "id" | "onUse">) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={styles.useButton}
      onClick={() => onUse(id)}
    >
      <Code2 className="size-4" aria-hidden="true" />
      Gunakan di IDE
    </Button>
  );
}
