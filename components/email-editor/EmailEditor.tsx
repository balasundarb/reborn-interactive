"use client";

import React, { useCallback, useState } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import CharacterCount from "@tiptap/extension-character-count";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link2, Image as ImageIcon,
  Undo2, Redo2, Quote, Minus, Code, Code2,
  Subscript as SubIcon, Superscript as SupIcon,
  Highlighter, Palette, Table as TableIcon,
  CheckSquare, Eye, EyeOff, Type, ChevronDown,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

export interface NotionEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxCharacters?: number;
  className?: string;
}

type Level = 1 | 2 | 3 | 4;

// ── Constants ──────────────────────────────────────────────────────────────

const lowlight = createLowlight(common);

const TEXT_COLORS = [
  { label: "Default", value: "#ffffff" },
  { label: "Muted", value: "#94a3b8" },
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Yellow", value: "#eab308" },
  { label: "Green", value: "#22c55e" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Purple", value: "#8b5cf6" },
  { label: "Pink", value: "#ec4899" },
];

const HIGHLIGHT_COLORS = [
  { label: "Yellow", value: "#fef08a" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Blue", value: "#bfdbfe" },
  { label: "Purple", value: "#e9d5ff" },
  { label: "Pink", value: "#fbcfe8" },
  { label: "Red", value: "#fecaca" },
  { label: "Orange", value: "#fed7aa" },
  { label: "None", value: "" },
];

const HEADING_LEVELS: { label: string; value: Level | "paragraph" }[] = [
  { label: "Heading 1", value: 1 },
  { label: "Heading 2", value: 2 },
  { label: "Heading 3", value: 3 },
  { label: "Heading 4", value: 4 },
  { label: "Paragraph", value: "paragraph" },
];

// ── Toolbar primitives ─────────────────────────────────────────────────────

interface ToolBtnProps {
  onClick: () => void;
  title: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

function ToolBtn({ onClick, title, active, disabled, children, className = "" }: ToolBtnProps) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      disabled={disabled}
      className={`
        relative p-1.5 rounded-md transition-all select-none
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
        ${active
          ? "bg-[#d63031]/20 text-[#d63031]"
          : "text-slate-400 hover:text-white hover:bg-white/8"
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-white/10 mx-1 self-center shrink-0" />;
}

// ── Color picker dropdown ──────────────────────────────────────────────────

interface ColorDropdownProps {
  colors: { label: string; value: string }[];
  onSelect: (value: string) => void;
  trigger: React.ReactNode;
  title: string;
}

function ColorDropdown({ colors, onSelect, trigger, title }: ColorDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onMouseDown={(e) => { e.preventDefault(); setOpen((v) => !v); }}
        title={title}
        className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/8 transition-all"
      >
        {trigger}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onMouseDown={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1.5 z-50 bg-slate-800 border border-white/10 rounded-xl p-2 shadow-2xl shadow-black/40 min-w-[140px]">
            {colors.map((c) => (
              <button
                key={c.value || "none"}
                onMouseDown={(e) => { e.preventDefault(); onSelect(c.value); setOpen(false); }}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-white/8 text-xs text-slate-300 transition-all"
              >
                <span
                  className="w-4 h-4 rounded border border-white/20 shrink-0"
                  style={{
                    background: c.value || "transparent",
                    backgroundImage: !c.value ? "repeating-linear-gradient(45deg, #475569 0, #475569 2px, transparent 0, transparent 50%)" : undefined,
                    backgroundSize: !c.value ? "6px 6px" : undefined,
                  }}
                />
                {c.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Heading select ─────────────────────────────────────────────────────────

interface HeadingSelectProps {
  editor: Editor;
}

function HeadingSelect({ editor }: HeadingSelectProps) {
  const [open, setOpen] = useState(false);

  const current = HEADING_LEVELS.find((h) =>
    h.value === "paragraph"
      ? editor.isActive("paragraph")
      : editor.isActive("heading", { level: h.value })
  ) ?? HEADING_LEVELS[4];

  return (
    <div className="relative">
      <button
        onMouseDown={(e) => { e.preventDefault(); setOpen((v) => !v); }}
        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-white/8 transition-all min-w-[100px] border border-white/10"
      >
        <Type size={12} className="shrink-0" />
        <span className="flex-1 text-left">{current.label}</span>
        <ChevronDown size={11} className="shrink-0 opacity-60" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onMouseDown={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1.5 z-50 bg-slate-800 border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/40 min-w-[140px]">
            {HEADING_LEVELS.map((h) => {
              const isActive = h.value === "paragraph"
                ? editor.isActive("paragraph")
                : editor.isActive("heading", { level: h.value });

              return (
                <button
                  key={String(h.value)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (h.value === "paragraph") {
                      editor.chain().focus().setParagraph().run();
                    } else {
                      editor.chain().focus().toggleHeading({ level: h.value as Level }).run();
                    }
                    setOpen(false);
                  }}
                  className={`
                    flex items-center gap-2 w-full px-3 py-2 text-left transition-all
                    ${isActive ? "bg-[#d63031]/15 text-[#d63031]" : "text-slate-300 hover:bg-white/8 hover:text-white"}
                  `}
                  style={{
                    fontSize: h.value === 1 ? 18 : h.value === 2 ? 15 : h.value === 3 ? 13 : h.value === 4 ? 12 : 12,
                    fontWeight: h.value === "paragraph" ? 400 : 700,
                  }}
                >
                  {h.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── Bubble menu (selection toolbar) ────────────────────────────────────────

interface BubbleToolbarProps {
  editor: Editor;
}

function BubbleToolbar({ editor }: BubbleToolbarProps) {
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL:", prev ?? "https://");
    if (url === null) return;
    if (!url) { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url, target: "_blank" }).run();
  };

  return (
    <div className="flex items-center gap-0.5 bg-slate-800 border border-white/12 rounded-xl px-1.5 py-1 shadow-2xl shadow-black/50 backdrop-blur-sm">
      <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} title="Bold" active={editor.isActive("bold")}><Bold size={13} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic" active={editor.isActive("italic")}><Italic size={13} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline" active={editor.isActive("underline")}><UnderlineIcon size={13} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough" active={editor.isActive("strike")}><Strikethrough size={13} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} title="Inline Code" active={editor.isActive("code")}><Code size={13} /></ToolBtn>
      <Divider />
      <ColorDropdown
        colors={TEXT_COLORS}
        onSelect={(c) => editor.chain().focus().setColor(c).run()}
        trigger={<Palette size={13} />}
        title="Text color"
      />
      <ColorDropdown
        colors={HIGHLIGHT_COLORS}
        onSelect={(c) => c
          ? editor.chain().focus().setHighlight({ color: c }).run()
          : editor.chain().focus().unsetHighlight().run()
        }
        trigger={<Highlighter size={13} />}
        title="Highlight"
      />
      <Divider />
      <ToolBtn onClick={setLink} title="Link" active={editor.isActive("link")}><Link2 size={13} /></ToolBtn>
    </div>
  );
}

// ── Floating menu (empty-line slash commands) ──────────────────────────────

interface FloatingMenuBarProps {
  editor: Editor;
}

function FloatingMenuBar({ editor }: FloatingMenuBarProps) {
  const insertImage = () => {
    const url = window.prompt("Image URL:", "https://");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const insertTable = () =>
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();

  return (
    <div className="flex items-center gap-0.5 bg-slate-800/90 border border-white/10 rounded-xl px-1.5 py-1 shadow-xl shadow-black/40 backdrop-blur-sm">
      <span className="text-[10px] text-slate-500 px-1.5 font-medium tracking-wide">Insert</span>
      <Divider />
      {([1, 2, 3] as Level[]).map((l) => (
        <ToolBtn key={l} onClick={() => editor.chain().focus().toggleHeading({ level: l }).run()} title={`Heading ${l}`}>
          <span className="text-[11px] font-bold">H{l}</span>
        </ToolBtn>
      ))}
      <Divider />
      <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list"><List size={13} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered list"><ListOrdered size={13} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleTaskList().run()} title="Task list"><CheckSquare size={13} /></ToolBtn>
      <Divider />
      <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote"><Quote size={13} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block"><Code2 size={13} /></ToolBtn>
      <ToolBtn onClick={insertTable} title="Table"><TableIcon size={13} /></ToolBtn>
      <ToolBtn onClick={insertImage} title="Image"><ImageIcon size={13} /></ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Divider"
      >
        <Minus size={13} />
      </ToolBtn>
    </div>
  );
}

// ── Main toolbar ───────────────────────────────────────────────────────────

interface MainToolbarProps {
  editor: Editor;
  showPreview: boolean;
  onTogglePreview: () => void;
}

function MainToolbar({ editor, showPreview, onTogglePreview }: MainToolbarProps) {
  const setLink = useCallback(() => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL:", prev ?? "https://");
    if (url === null) return;
    if (!url) { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url, target: "_blank" }).run();
  }, [editor]);

  const insertImage = useCallback(() => {
    const url = window.prompt("Image URL:", "https://");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const insertTable = useCallback(() =>
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    [editor]
  );

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-slate-800/80 border-b border-white/8 sticky top-0 z-10">
      {/* Undo / Redo */}
      <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo" disabled={!editor.can().undo()}><Undo2 size={14} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo" disabled={!editor.can().redo()}><Redo2 size={14} /></ToolBtn>
      <Divider />

      {/* Heading select */}
      <HeadingSelect editor={editor} />
      <Divider />

      {/* Format */}
      <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} title="Bold" active={editor.isActive("bold")}><Bold size={14} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic" active={editor.isActive("italic")}><Italic size={14} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline" active={editor.isActive("underline")}><UnderlineIcon size={14} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough" active={editor.isActive("strike")}><Strikethrough size={14} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} title="Inline Code" active={editor.isActive("code")}><Code size={14} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleSubscript().run()} title="Subscript" active={editor.isActive("subscript")}><SubIcon size={14} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} title="Superscript" active={editor.isActive("superscript")}><SupIcon size={14} /></ToolBtn>
      <Divider />

      {/* Color */}
      <ColorDropdown
        colors={TEXT_COLORS}
        onSelect={(c) => editor.chain().focus().setColor(c).run()}
        trigger={<Palette size={14} />}
        title="Text color"
      />
      <ColorDropdown
        colors={HIGHLIGHT_COLORS}
        onSelect={(c) => c
          ? editor.chain().focus().setHighlight({ color: c }).run()
          : editor.chain().focus().unsetHighlight().run()
        }
        trigger={<Highlighter size={14} />}
        title="Highlight"
      />
      <Divider />

      {/* Align */}
      <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Align Left" active={editor.isActive({ textAlign: "left" })}><AlignLeft size={14} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Center" active={editor.isActive({ textAlign: "center" })}><AlignCenter size={14} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Align Right" active={editor.isActive({ textAlign: "right" })}><AlignRight size={14} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().setTextAlign("justify").run()} title="Justify" active={editor.isActive({ textAlign: "justify" })}><AlignJustify size={14} /></ToolBtn>
      <Divider />

      {/* Lists */}
      <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List" active={editor.isActive("bulletList")}><List size={14} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered List" active={editor.isActive("orderedList")}><ListOrdered size={14} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleTaskList().run()} title="Task List" active={editor.isActive("taskList")}><CheckSquare size={14} /></ToolBtn>
      <Divider />

      {/* Blocks */}
      <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote" active={editor.isActive("blockquote")}><Quote size={14} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code Block" active={editor.isActive("codeBlock")}><Code2 size={14} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus size={14} /></ToolBtn>
      <Divider />

      {/* Insert */}
      <ToolBtn onClick={setLink} title="Insert Link" active={editor.isActive("link")}><Link2 size={14} /></ToolBtn>
      <ToolBtn onClick={insertImage} title="Insert Image"><ImageIcon size={14} /></ToolBtn>
      <ToolBtn onClick={insertTable} title="Insert Table"><TableIcon size={14} /></ToolBtn>
      <Divider />

      {/* Preview */}
      <button
        onClick={onTogglePreview}
        className={`
          flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ml-auto
          ${showPreview
            ? "bg-[#d63031] text-white"
            : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
          }
        `}
      >
        {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
        {showPreview ? "Edit" : "Preview"}
      </button>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────

export function NotionEditor({
  value,
  onChange,
  placeholder = "Start writing… or press / on an empty line",
  maxCharacters,
  className = "",
}: NotionEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // replaced by CodeBlockLowlight
        heading: { levels: [1, 2, 3, 4] },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder }),
      Color,
      TextStyle,
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({ lowlight }),
      ...(maxCharacters ? [CharacterCount.configure({ limit: maxCharacters })] : [CharacterCount]),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  if (!editor) return null;

  const charCount = editor.storage.characterCount?.characters?.() ?? 0;
  const wordCount = editor.storage.characterCount?.words?.() ?? 0;
  const atLimit = maxCharacters ? charCount >= maxCharacters : false;

  return (
    <div className={`notion-editor flex flex-col rounded-2xl border border-white/10 overflow-hidden bg-slate-900/60 ${className}`}>
      {/* Toolbar */}
      <MainToolbar
        editor={editor}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview((v) => !v)}
      />

      {/* Bubble menu — appears on text selection */}
      <BubbleMenu
        editor={editor}
        options={{ placement: "top" }}
        shouldShow={({ editor: e, state }: { editor: Editor; state: any }) => {
          const { from, to } = state.selection;
          return from !== to && !e.isActive("image") && !e.isActive("codeBlock");
        }}
      >
        <BubbleToolbar editor={editor} />
      </BubbleMenu>

      {/* Floating menu — appears on empty line */}
      <FloatingMenu
        editor={editor}
        options={{ placement: "left" }}
        shouldShow={({ state }: { state: any }) => {
          const { $from } = state.selection;
          const currentLineText = $from.nodeBefore?.textContent ?? "";
          return $from.parent.textContent === "" && currentLineText === "";
        }}
      >
        <FloatingMenuBar editor={editor} />
      </FloatingMenu>

      {/* Editor / Preview */}
      {showPreview ? (
        <div className="min-h-[520px] p-8 bg-white overflow-auto">
          <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: value }} />
        </div>
      ) : (
        <EditorContent
          editor={editor}
          className="notion-editor-content flex-1 min-h-[520px] overflow-auto"
        />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-t border-white/8 text-slate-500 text-xs">
        <span className="text-slate-600 text-[10px] italic">
          Select text for formatting · Empty line shows insert menu
        </span>
        <div className="flex items-center gap-3">
          <span>{wordCount} words</span>
          <span className={atLimit ? "text-[#d63031] font-semibold" : ""}>
            {charCount}{maxCharacters ? ` / ${maxCharacters}` : ""} chars
          </span>
        </div>
      </div>
    </div>
  );
}