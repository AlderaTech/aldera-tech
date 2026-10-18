"use client";

import { useState, type ReactNode } from "react";
import { Check, Code2, Copy, FileCode, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  generateIdePresetConfig,
  type ApiKeyRecord,
  type IdeTarget,
} from "@/lib/ai-relay-utils";

import { IDE_TARGETS } from "./_data/ide-targets";

interface PresetConfigModalProps {
  illustration?: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  modelId: string;
  activeApiKeys: ApiKeyRecord[];
  baseUrl?: string;
}

export function PresetConfigModal({
  illustration,
  isOpen,
  onClose,
  modelId,
  activeApiKeys,
  baseUrl = "https://api.aldera.tech",
}: PresetConfigModalProps) {
  const [selectedTarget, setSelectedTarget] = useState<IdeTarget>("cursor");
  const [selectedKeyPrefix, setSelectedKeyPrefix] = useState<string>(
    activeApiKeys.find((k) => k.is_active)?.key_prefix || ""
  );
  const [customKey, setCustomKey] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Resolved API key to use in snippet
  const activeKeyObj = activeApiKeys.find(
    (k) => k.key_prefix === selectedKeyPrefix
  );
  const effectiveKey =
    customKey ||
    (activeKeyObj
      ? `${activeKeyObj.key_prefix}••••••••••••••••••••••••••••••••••••••••`
      : "sk-toko-YOUR_API_KEY_HERE");

  const configJson = generateIdePresetConfig(selectedTarget, {
    apiKey: effectiveKey,
    baseUrl,
    modelId,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(configJson);
      setCopied(true);
      toast.success(`Konfigurasi ${selectedTarget.toUpperCase()} disalin!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin konfigurasi.");
    }
  };

  const currentIdeInfo = IDE_TARGETS.find((i) => i.id === selectedTarget);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader data-relay-ide-header>
          {illustration && <span data-relay-ide-mascot>{illustration}</span>}
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Code2 className="h-5 w-5 text-indigo-600" />
            Gunakan Model di IDE ({modelId})
          </DialogTitle>
          <DialogDescription className="text-xs">
            Pilih editor Anda untuk menghasilkan konfigurasi JSON siap pakai
            dengan endpoint Aldera Relay.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Key Selection */}
          <div className="space-y-1.5">
            <Label
              htmlFor="relay-ide-key"
              className="text-xs font-semibold text-slate-700"
            >
              Pilih API Key untuk Konfigurasi:
            </Label>
            {activeApiKeys.filter((k) => k.is_active).length > 0 ? (
              <Select
                value={selectedKeyPrefix}
                onValueChange={(val) => {
                  setSelectedKeyPrefix(val);
                  setCustomKey("");
                }}
              >
                <SelectTrigger id="relay-ide-key" className="h-9 text-xs">
                  <SelectValue placeholder="Pilih API Key Aktif" />
                </SelectTrigger>
                <SelectContent>
                  {activeApiKeys
                    .filter((k) => k.is_active)
                    .map((k) => (
                      <SelectItem
                        key={k.id}
                        value={k.key_prefix}
                        className="text-xs"
                      >
                        <span className="font-semibold">{k.label}</span>{" "}
                        <span className="font-mono text-slate-400">
                          ({k.key_prefix}...)
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="relay-ide-key"
                placeholder="Masukkan API Key Anda (sk-toko-...)"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                className="font-mono text-xs"
              />
            )}
          </div>

          {/* IDE Tabs */}
          <Tabs
            value={selectedTarget}
            onValueChange={(v) => setSelectedTarget(v as IdeTarget)}
            className="w-full"
          >
            <TabsList className="grid h-9 grid-cols-5 bg-slate-100 p-1">
              {IDE_TARGETS.map((ide) => (
                <TabsTrigger
                  key={ide.id}
                  value={ide.id}
                  className="h-7 text-xs font-medium"
                >
                  {ide.name.split(" ")[0]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Code Snippet Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                <FileCode className="h-3.5 w-3.5 text-indigo-500" />
                {currentIdeInfo?.fileHint}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-7 gap-1 border-indigo-200 px-2.5 text-xs text-indigo-700 hover:bg-indigo-50"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Salin Snippet
                  </>
                )}
              </Button>
            </div>

            <div className="relative overflow-x-auto rounded-lg bg-slate-950 p-3.5 font-mono text-xs text-slate-100 shadow-inner">
              <pre className="leading-relaxed whitespace-pre select-all">
                {configJson}
              </pre>
            </div>
          </div>

          {/* Notice info */}
          <div className="space-y-1 rounded-lg border bg-slate-50 p-3 text-[11px] text-slate-600">
            <p>
              <Info className="mr-1 inline size-3.5" aria-hidden="true" />{" "}
              <strong>Catatan:</strong> Jika Anda menyalin kunci bertanda{" "}
              <code className="font-mono text-slate-800">••••</code>, ganti
              dengan API Key lengkap 56-karakter yang Anda simpan saat pembuatan
              kunci.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
