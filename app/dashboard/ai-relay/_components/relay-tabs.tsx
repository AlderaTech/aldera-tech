import {
  Activity,
  Calculator,
  Cpu,
  CreditCard,
  Key,
  Layers,
  Send,
  Terminal,
} from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import styles from "./relay-workspace.module.css";

const RELAY_TABS = [
  { value: "catalog", label: "Katalog Model", icon: Layers },
  { value: "playground", label: "Playground Chat", icon: Terminal },
  { value: "keys", label: "API Keys", icon: Key },
  { value: "billing", label: "Saldo & Ledger", icon: CreditCard },
  { value: "telegram", label: "Telegram Bot", icon: Send },
  { value: "analytics", label: "Analitik & Log", icon: Activity },
  { value: "simulator", label: "Komparasi & Simulasi", icon: Calculator },
  { value: "health", label: "Status & Latensi", icon: Cpu },
];

export function RelayTabs() {
  return (
    <div className={styles.tabScroll}>
      <TabsList aria-label="Fitur AI Relay" className={styles.tabList}>
        {RELAY_TABS.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value}>
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}
