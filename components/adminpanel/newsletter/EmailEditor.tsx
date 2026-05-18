"use client";
import React, { useRef, useCallback, useEffect, useState } from "react";
import {
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, List, ListOrdered, Link2, Image, Undo2,
  Redo2, Type, Palette, Eye, EyeOff, Minus, Quote,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

const FONT_SIZES = ["12", "14", "16", "18", "20", "24", "28", "32", "36", "48"];
const FONT_FAMILIES = ["Arial", "Georgia", "Trebuchet MS", "Verdana", "Roboto Mono", "Times New Roman"];
const COLORS = [
  "#ffffff", "#f1f5f9", "#94a3b8", "#475569", "#1e293b", "#0f172a",
  "#ef4444", "#d63031", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
];

// ─── Resize handle positions ─────────────────────────────────────────────────
type HandlePos = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
const HANDLES: HandlePos[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
const CURSOR_MAP: Record<HandlePos, string> = {
  nw: "nwse-resize", n: "ns-resize", ne: "nesw-resize",
  e: "ew-resize", se: "nwse-resize", s: "ns-resize",
  sw: "nesw-resize", w: "ew-resize",
};

type ToolbarButtonProps = {
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
};

function ToolBtn({ onClick, title, active, children }: ToolbarButtonProps) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded-lg transition-all hover:bg-white/10 ${
        active ? "bg-[#d63031]/25 text-[#d63031]" : "text-slate-400 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-white/10 mx-0.5 self-center" />;
}

// ─── Image Resize Overlay ────────────────────────────────────────────────────
interface ResizeState {
  img: HTMLImageElement;
  rect: DOMRect;
  editorRect: DOMRect;
}

interface ImageOverlayProps {
  resizeState: ResizeState;
  onResize: () => void;
  onDeselect: () => void;
}

function ImageOverlay({ resizeState, onResize, onDeselect }: ImageOverlayProps) {
  const { img, rect, editorRect } = resizeState;

  // Position overlay relative to editor container
  const top = rect.top - editorRect.top;
  const left = rect.left - editorRect.left;
  const width = rect.width;
  const height = rect.height;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, pos: HandlePos) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;
      const startW = img.offsetWidth || rect.width;
      const startH = img.offsetHeight || rect.height;

      const onMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        let newW = startW;
        let newH = startH;

        if (pos.includes("e")) newW = Math.max(40, startW + dx);
        if (pos.includes("w")) newW = Math.max(40, startW - dx);
        if (pos.includes("s")) newH = Math.max(40, startH + dy);
        if (pos.includes("n")) newH = Math.max(40, startH - dy);

        // Corner: maintain aspect ratio when shift is held OR always for corner handles
        const isCorner = pos.length === 2;
        if (isCorner) {
          const ratio = startW / startH;
          if (Math.abs(dx) > Math.abs(dy)) {
            newH = newW / ratio;
          } else {
            newW = newH * ratio;
          }
        }

        img.style.width = `${Math.round(newW)}px`;
        img.style.height = isCorner ? `${Math.round(newH)}px` : "";
      };

      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        onResize();
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [img, rect, onResize]
  );

  // Handle positions as % offsets
  const handleStyle = (pos: HandlePos): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "absolute",
      width: 10,
      height: 10,
      background: "#d63031",
      border: "2px solid #fff",
      borderRadius: 2,
      cursor: CURSOR_MAP[pos],
      zIndex: 10,
    };
    if (pos === "nw") return { ...base, top: -5, left: -5 };
    if (pos === "n")  return { ...base, top: -5, left: "50%", transform: "translateX(-50%)" };
    if (pos === "ne") return { ...base, top: -5, right: -5 };
    if (pos === "e")  return { ...base, top: "50%", right: -5, transform: "translateY(-50%)" };
    if (pos === "se") return { ...base, bottom: -5, right: -5 };
    if (pos === "s")  return { ...base, bottom: -5, left: "50%", transform: "translateX(-50%)" };
    if (pos === "sw") return { ...base, bottom: -5, left: -5 };
    if (pos === "w")  return { ...base, top: "50%", left: -5, transform: "translateY(-50%)" };
    return base;
  };

  return (
    <>
      {/* Backdrop click-away */}
      <div className="absolute inset-0 z-[5]" onMouseDown={onDeselect} />

      {/* Selection box */}
      <div
        style={{
          position: "absolute",
          top, left, width, height,
          border: "2px solid #d63031",
          borderRadius: 6,
          pointerEvents: "none",
          zIndex: 6,
          boxShadow: "0 0 0 1px rgba(214,48,49,0.3)",
        }}
      >
        {/* Size badge */}
        <div style={{
          position: "absolute", bottom: -24, left: 0,
          background: "#d63031", color: "#fff", fontSize: 10,
          fontWeight: 700, padding: "2px 6px", borderRadius: 4,
          whiteSpace: "nowrap", letterSpacing: "0.05em",
        }}>
          {Math.round(img.offsetWidth)} × {Math.round(img.offsetHeight || rect.height)}
        </div>
      </div>

      {/* Handles (pointer-events: all) */}
      <div
        style={{ position: "absolute", top, left, width, height, zIndex: 7, pointerEvents: "none" }}
      >
        {HANDLES.map((pos) => (
          <div
            key={pos}
            style={{ ...handleStyle(pos), pointerEvents: "all" }}
            onMouseDown={(e) => handleMouseDown(e, pos)}
          />
        ))}
      </div>
    </>
  );
}

// ─── Main Editor ─────────────────────────────────────────────────────────────
export function EmailEditor({ value, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [fontSize, setFontSize] = useState("16");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textColor, setTextColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("transparent");
  const [showTextColors, setShowTextColors] = useState(false);
  const [showBgColors, setShowBgColors] = useState(false);

  // Image resize state
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);

  const syncContent = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const exec = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    syncContent();
  }, [syncContent]);

  // Sync initial value once
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, []); // eslint-disable-line

  // Image click — show resize handles
  const handleEditorClick = useCallback((e: React.MouseEvent) => {
    setShowTextColors(false);
    setShowBgColors(false);

    const target = e.target as HTMLElement;
    if (target.tagName === "IMG" && wrapperRef.current) {
      const img = target as HTMLImageElement;
      const rect = img.getBoundingClientRect();
      const editorRect = wrapperRef.current.getBoundingClientRect();
      setResizeState({ img, rect, editorRect });
    } else {
      setResizeState(null);
    }
  }, []);

  // Update overlay rect after resize
  const handleResizeDone = useCallback(() => {
    syncContent();
    if (resizeState && wrapperRef.current) {
      const rect = resizeState.img.getBoundingClientRect();
      const editorRect = wrapperRef.current.getBoundingClientRect();
      setResizeState({ img: resizeState.img, rect, editorRect });
    }
  }, [resizeState, syncContent]);

  const insertLink = () => {
    const url = window.prompt("Enter URL:", "https://");
    if (url) exec("createLink", url);
  };

  const insertImage = () => {
    const url = window.prompt("Enter image URL:", "https://");
    if (url) exec("insertImage", url);
  };

  const insertHR = () =>
    exec("insertHTML", "<hr style='border:none;border-top:1px solid #334155;margin:16px 0;'/>");

  const insertBlockquote = () => exec("formatBlock", "blockquote");

  const applyFontSize = (size: string) => {
    setFontSize(size);
    exec("insertHTML",
      `<span style="font-size:${size}px">${window.getSelection()?.toString() || ""}</span>`
    );
  };

  const applyFontFamily = (family: string) => {
    setFontFamily(family);
    exec("fontName", family);
  };

  const applyTextColor = (color: string) => {
    setTextColor(color);
    exec("foreColor", color);
    setShowTextColors(false);
  };

  const applyBgColor = (color: string) => {
    setBgColor(color);
    exec("hiliteColor", color);
    setShowBgColors(false);
  };

  return (
    <div className="flex flex-col rounded-2xl border border-white/10 overflow-hidden bg-slate-900/60">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-slate-800/80 border-b border-white/8">
        <ToolBtn onClick={() => exec("undo")} title="Undo"><Undo2 size={15} /></ToolBtn>
        <ToolBtn onClick={() => exec("redo")} title="Redo"><Redo2 size={15} /></ToolBtn>
        <Divider />

        <select value={fontFamily} onChange={(e) => applyFontFamily(e.target.value)}
          className="text-xs bg-slate-700 border border-white/10 text-white rounded-lg px-2 py-1 outline-none hover:border-[#d63031]/40 transition-colors">
          {FONT_FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>

        <select value={fontSize} onChange={(e) => applyFontSize(e.target.value)}
          className="text-xs bg-slate-700 border border-white/10 text-white rounded-lg px-2 py-1 w-16 outline-none hover:border-[#d63031]/40 transition-colors">
          {FONT_SIZES.map((s) => <option key={s} value={s}>{s}px</option>)}
        </select>
        <Divider />

        <ToolBtn onClick={() => exec("bold")} title="Bold"><Bold size={15} /></ToolBtn>
        <ToolBtn onClick={() => exec("italic")} title="Italic"><Italic size={15} /></ToolBtn>
        <ToolBtn onClick={() => exec("underline")} title="Underline"><Underline size={15} /></ToolBtn>
        <ToolBtn onClick={() => exec("strikeThrough")} title="Strikethrough"><Strikethrough size={15} /></ToolBtn>
        <Divider />

        <ToolBtn onClick={() => exec("justifyLeft")} title="Align Left"><AlignLeft size={15} /></ToolBtn>
        <ToolBtn onClick={() => exec("justifyCenter")} title="Center"><AlignCenter size={15} /></ToolBtn>
        <ToolBtn onClick={() => exec("justifyRight")} title="Align Right"><AlignRight size={15} /></ToolBtn>
        <ToolBtn onClick={() => exec("justifyFull")} title="Justify"><AlignJustify size={15} /></ToolBtn>
        <Divider />

        <ToolBtn onClick={() => exec("insertUnorderedList")} title="Bullet List"><List size={15} /></ToolBtn>
        <ToolBtn onClick={() => exec("insertOrderedList")} title="Numbered List"><ListOrdered size={15} /></ToolBtn>
        <ToolBtn onClick={insertBlockquote} title="Blockquote"><Quote size={15} /></ToolBtn>
        <ToolBtn onClick={insertHR} title="Divider Line"><Minus size={15} /></ToolBtn>
        <Divider />

        {/* Text color */}
        <div className="relative">
          <button onMouseDown={(e) => { e.preventDefault(); setShowTextColors((v) => !v); setShowBgColors(false); }}
            title="Text Color" className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all">
            <Type size={15} />
            <span className="w-3 h-1 rounded-sm" style={{ background: textColor }} />
          </button>
          {showTextColors && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-slate-800 border border-white/10 rounded-xl p-2 grid grid-cols-8 gap-1 shadow-2xl">
              {COLORS.map((c) => (
                <button key={c} onMouseDown={(e) => { e.preventDefault(); applyTextColor(c); }}
                  className="w-5 h-5 rounded-md border border-white/20 hover:scale-110 transition-transform" style={{ background: c }} title={c} />
              ))}
            </div>
          )}
        </div>

        {/* Highlight color */}
        <div className="relative">
          <button onMouseDown={(e) => { e.preventDefault(); setShowBgColors((v) => !v); setShowTextColors(false); }}
            title="Highlight Color" className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all">
            <Palette size={15} />
            <span className="w-3 h-1 rounded-sm" style={{ background: bgColor === "transparent" ? "#334155" : bgColor }} />
          </button>
          {showBgColors && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-slate-800 border border-white/10 rounded-xl p-2 grid grid-cols-8 gap-1 shadow-2xl">
              {COLORS.map((c) => (
                <button key={c} onMouseDown={(e) => { e.preventDefault(); applyBgColor(c); }}
                  className="w-5 h-5 rounded-md border border-white/20 hover:scale-110 transition-transform" style={{ background: c }} title={c} />
              ))}
            </div>
          )}
        </div>
        <Divider />

        <ToolBtn onClick={insertLink} title="Insert Link"><Link2 size={15} /></ToolBtn>
        <ToolBtn onClick={insertImage} title="Insert Image"><Image size={15} /></ToolBtn>
        <Divider />

        {(["H1", "H2", "H3"] as const).map((h) => (
          <ToolBtn key={h} onClick={() => exec("formatBlock", h)} title={h}>
            <span className="text-[11px] font-bold leading-none">{h}</span>
          </ToolBtn>
        ))}
        <ToolBtn onClick={() => exec("formatBlock", "p")} title="Paragraph">
          <span className="text-[11px] font-bold leading-none">P</span>
        </ToolBtn>
        <Divider />

        <button onClick={() => setShowPreview((v) => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            showPreview ? "bg-[#d63031] text-white" : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
          }`}>
          {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
          {showPreview ? "Edit" : "Preview"}
        </button>
      </div>

      {/* ── Editor / Preview ── */}
      {showPreview ? (
        <div className="min-h-[420px] p-6 bg-white overflow-auto">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: value }} />
        </div>
      ) : (
        // Wrapper is the positioning root for the resize overlay
        <div ref={wrapperRef} className="relative">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={syncContent}
            onClick={handleEditorClick}
            style={{ fontFamily, fontSize: fontSize + "px", minHeight: 420 }}
            className="p-5 text-white outline-none focus:ring-0 overflow-auto"
            data-placeholder="Start composing your email…"
          />

          {/* Image resize overlay */}
          {resizeState && (
            <ImageOverlay
              resizeState={resizeState}
              onResize={handleResizeDone}
              onDeselect={() => setResizeState(null)}
            />
          )}
        </div>
      )}

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-t border-white/8 text-slate-600 text-xs">
        <span>
          {resizeState
            ? `Image selected — drag handles to resize · click outside to deselect`
            : "Click any image to select and resize it"}
        </span>
        <span>{value.replace(/<[^>]*>/g, "").length} characters</span>
      </div>

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #475569;
          pointer-events: none;
        }
        [contenteditable] blockquote {
          border-left: 3px solid #d63031;
          margin: 12px 0;
          padding: 8px 16px;
          color: #94a3b8;
          font-style: italic;
        }
        [contenteditable] a { color: #60a5fa; text-decoration: underline; }
        [contenteditable] img {
          max-width: 100%;
          border-radius: 8px;
          margin: 8px 0;
          cursor: pointer;
          display: inline-block;
        }
        [contenteditable] img:hover { outline: 2px solid rgba(214,48,49,0.5); }
        [contenteditable] hr { border: none; border-top: 1px solid #334155; margin: 16px 0; }
        [contenteditable] h1 { font-size: 2em; font-weight: 800; margin: 12px 0; color: #fff; }
        [contenteditable] h2 { font-size: 1.5em; font-weight: 700; margin: 10px 0; color: #fff; }
        [contenteditable] h3 { font-size: 1.25em; font-weight: 600; margin: 8px 0; color: #fff; }
        [contenteditable] ul { list-style: disc; padding-left: 24px; }
        [contenteditable] ol { list-style: decimal; padding-left: 24px; }
      `}</style>
    </div>
  );
}
