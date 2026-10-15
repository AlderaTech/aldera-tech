"use client";

import * as React from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Unlink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { API_ROUTES } from "@/lib/routes";

type ToolbarButtonProps = {
  editor: Editor;
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
      className="size-8"
    >
      {icon}
    </Button>
  );
}

export type TipTapEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

export function TipTapEditor({
  value,
  onChange,
  placeholder = "Mulai menulis…",
  className,
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline underline-offset-2" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral max-w-none focus:outline-none min-h-[300px] px-4 py-3",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const setLink = React.useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL:", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url, target: "_blank" })
      .run();
  }, [editor]);

  const addImage = React.useCallback(async () => {
    if (!editor) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch(API_ROUTES.upload, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const { url } = (await res.json()) as { url: string };
        editor.chain().focus().setImage({ src: url }).run();
      } catch (err) {
        toast.error("Gagal mengunggah gambar: " + (err as Error).message);
      }
    };
    input.click();
  }, [editor]);

  if (!editor) {
    return (
      <div className={cn("min-h-[400px] rounded-lg border", className)}>
        <div className="h-10 animate-pulse border-b bg-muted/30" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-background",
        className
      )}
    >
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b bg-muted/30 p-1.5">
        <ToolbarButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          label="Bold"
          icon={<Bold className="size-4" />}
        />
        <ToolbarButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          label="Italic"
          icon={<Italic className="size-4" />}
        />
        <ToolbarButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          label="Strikethrough"
          icon={<Strikethrough className="size-4" />}
        />
        <ToolbarButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          label="Inline code"
          icon={<Code className="size-4" />}
        />
        <Separator orientation="vertical" className="mx-1 !h-5" />
        <ToolbarButton
          editor={editor}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          label="Heading 1"
          icon={<Heading1 className="size-4" />}
        />
        <ToolbarButton
          editor={editor}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          label="Heading 2"
          icon={<Heading2 className="size-4" />}
        />
        <ToolbarButton
          editor={editor}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          label="Heading 3"
          icon={<Heading3 className="size-4" />}
        />
        <Separator orientation="vertical" className="mx-1 !h-5" />
        <ToolbarButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          label="Bullet list"
          icon={<List className="size-4" />}
        />
        <ToolbarButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          label="Ordered list"
          icon={<ListOrdered className="size-4" />}
        />
        <ToolbarButton
          editor={editor}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          label="Blockquote"
          icon={<Quote className="size-4" />}
        />
        <Separator orientation="vertical" className="mx-1 !h-5" />
        <ToolbarButton
          editor={editor}
          onClick={setLink}
          active={editor.isActive("link")}
          label="Add link"
          icon={<LinkIcon className="size-4" />}
        />
        <ToolbarButton
          editor={editor}
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive("link")}
          label="Remove link"
          icon={<Unlink className="size-4" />}
        />
        <ToolbarButton
          editor={editor}
          onClick={addImage}
          label="Insert image"
          icon={<ImageIcon className="size-4" />}
        />
        <Separator orientation="vertical" className="mx-1 !h-5" />
        <ToolbarButton
          editor={editor}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          label="Undo"
          icon={<Undo className="size-4" />}
        />
        <ToolbarButton
          editor={editor}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          label="Redo"
          icon={<Redo className="size-4" />}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
