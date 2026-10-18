"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  FileCode,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink,
  AlertCircle,
  Copy,
  Check,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { convertTipTapToTelegramHtml } from "@/lib/telegram-html";

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
};

function ToolbarButton({
  onClick,
  active,
  label,
  icon,
  disabled,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className="size-7 rounded-sm text-slate-700 hover:text-slate-900"
    >
      {icon}
    </Button>
  );
}

export interface TelegramTipTapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  variables?: { label: string; value: string; description?: string }[];
  showPreview?: boolean;
  previewTitle?: string;
  adminUsername?: string;
}

const DEFAULT_VARIABLES = [
  { label: "ID Tiket", value: "{ticket_id}", description: "Nomor unik tiket (e.g. 1042)" },
  { label: "Nominal", value: "{amount}", description: "Jumlah topup (e.g. 100.000)" },
  { label: "Kode Unik", value: "{unique_code}", description: "3 digit verifikasi (e.g. 452)" },
  { label: "Total Transfer", value: "{total_transfer}", description: "Nominal + kode (e.g. 100.452)" },
  { label: "Metode Pembayaran", value: "{payment_methods}", description: "Daftar rekening bank / QRIS" },
  { label: "Username Admin", value: "{admin_username}", description: "Username admin telegram (e.g. aldera_admin)" },
];

export function TelegramTipTapEditor({
  value,
  onChange,
  placeholder = "Tulis template pesan Telegram di sini…",
  className,
  minHeight = "160px",
  variables = DEFAULT_VARIABLES,
  showPreview = true,
  previewTitle = "Pratinjau Pesan Telegram",
  adminUsername = "aldera_admin",
}: TelegramTipTapEditorProps) {
  const [copied, setCopied] = React.useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-500 underline underline-offset-2" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm prose-neutral max-w-none focus:outline-none px-3.5 py-2.5 font-sans leading-relaxed text-slate-900",
          "selection:bg-blue-100",
          minHeight ? `min-h-[${minHeight}]` : "min-h-[160px]"
        ),
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [editor, value]);

  const setLink = React.useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Masukkan URL (http://, https://, atau tg://):", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const insertVariable = React.useCallback(
    (chip: string) => {
      if (!editor) return;
      editor.chain().focus().insertContent(chip).run();
    },
    [editor]
  );

  // Compute live Telegram converted HTML
  const telegramHtml = React.useMemo(() => {
    return convertTipTapToTelegramHtml(value);
  }, [value]);

  // Compute simulated Telegram preview with sample values
  const simulatedPreviewHtml = React.useMemo(() => {
    let preview = telegramHtml;
    preview = preview.replace(/\{ticket_id\}/g, "1042");
    preview = preview.replace(/\{amount\}/g, "100.000");
    preview = preview.replace(/\{unique_code\}/g, "452");
    preview = preview.replace(/\{total_transfer\}/g, "100.452");
    preview = preview.replace(
      /\{payment_methods\}/g,
      "🏦 <b>BCA:</b> <code>8830123456</code> (PT Aldera)\n📱 <b>QRIS:</b> Scan via GoPay/OVO/BCA Mobile"
    );
    preview = preview.replace(/\{admin_username\}/g, adminUsername);
    return preview;
  }, [telegramHtml, adminUsername]);

  const charCount = telegramHtml.length;
  const isCharWarning = charCount > 3800;
  const isCharOver = charCount > 4096;

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(telegramHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!editor) {
    return (
      <div className={cn("min-h-[220px] rounded-lg border border-slate-200 bg-white", className)}>
        <div className="h-9 animate-pulse border-b border-slate-100 bg-slate-50" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Variable Chips */}
      {variables.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              Variabel Dinamis (Klik untuk menyisipkan):
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {variables.map((v) => (
              <button
                key={v.value}
                type="button"
                onClick={() => insertVariable(v.value)}
                title={v.description || v.value}
                className="group inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50/70 px-2 py-0.5 text-xs font-mono font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <span>{v.value}</span>
                <span className="text-[10px] text-blue-500 font-sans group-hover:text-blue-700">
                  ({v.label})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor Box */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50/80 p-1.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            label="Tebal (<b>)"
            icon={<Bold className="size-3.5" />}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            label="Miring (<i>)"
            icon={<Italic className="size-3.5" />}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            label="Coret (<s>)"
            icon={<Strikethrough className="size-3.5" />}
          />
          <Separator orientation="vertical" className="mx-1 h-4" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            label="Monospace (<code>)"
            icon={<Code className="size-3.5" />}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            label="Blok Kode (<pre>)"
            icon={<FileCode className="size-3.5" />}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            label="Kutipan (<blockquote>)"
            icon={<Quote className="size-3.5" />}
          />
          <Separator orientation="vertical" className="mx-1 h-4" />
          <ToolbarButton
            onClick={setLink}
            active={editor.isActive("link")}
            label="Tautan (<a href>)"
            icon={<LinkIcon className="size-3.5" />}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive("link")}
            label="Hapus Tautan"
            icon={<Unlink className="size-3.5" />}
          />
          <Separator orientation="vertical" className="mx-1 h-4" />
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            label="Urungkan (Undo)"
            icon={<Undo className="size-3.5" />}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            label="Ulangi (Redo)"
            icon={<Redo className="size-3.5" />}
          />

          <div className="ml-auto flex items-center gap-2 pr-1">
            <span
              className={cn(
                "text-[11px] font-mono",
                isCharOver
                  ? "font-semibold text-rose-600"
                  : isCharWarning
                    ? "font-medium text-amber-600"
                    : "text-slate-400"
              )}
            >
              {charCount} / 4096 Karakter
            </span>
            {isCharOver && (
              <span title="Melebihi batas maksimal Telegram (4096 karakter)">
                <AlertCircle className="size-3.5 text-rose-600" />
              </span>
            )}
          </div>
        </div>

        {/* TipTap editable content */}
        <div style={{ minHeight }}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Live Telegram Chat Message Bubble Preview */}
      {showPreview && (
        <div className="rounded-lg border border-slate-200 bg-slate-100/70 p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Send className="size-3.5 text-sky-500" />
              <span>{previewTitle}</span>
              <Badge variant="outline" className="border-sky-300 bg-sky-50 text-[10px] text-sky-700">
                Live Telegram Bubble
              </Badge>
            </div>
            <button
              type="button"
              onClick={handleCopyRaw}
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 transition"
            >
              {copied ? (
                <>
                  <Check className="size-3 text-emerald-600" />
                  <span className="text-emerald-600">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  <span>Salin HTML Bot</span>
                </>
              )}
            </button>
          </div>

          {/* Telegram Chat Wallpaper & Bubble */}
          <div className="relative overflow-hidden rounded-md bg-[#748999] p-3 text-slate-900 shadow-inner">
            <div className="max-w-[85%] rounded-lg bg-white px-3 py-2 text-xs leading-relaxed shadow-sm">
              <div
                className="whitespace-pre-wrap font-sans text-slate-800 break-words"
                dangerouslySetInnerHTML={{
                  __html: simulatedPreviewHtml || "<span class='text-slate-400 italic'>Pesan kosong...</span>",
                }}
              />
              <div className="mt-1 flex items-center justify-end text-[10px] text-slate-400">
                <span>12:00</span>
                <span className="ml-1 text-sky-500">✓✓</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TelegramTipTapEditor;
