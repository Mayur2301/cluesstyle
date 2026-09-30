"use client";

/**
 * IDCardUploadSection
 * ─────────────────────────────────────────────────────────────────────────
 * Order Type + Card Settings + Material Type stay the same as before.
 *
 * The live preview is a FREEFORM CANVAS, same interaction model as the old
 * jersey logo canvas (DraggableLogo / LivePreviewCanvas):
 *   - Background = the blank card template image for the active side.
 *   - "Upload Image" adds an image layer anywhere on the card. The image is
 *     first sent to /api/remove-bg (which proxies to a Python rembg /
 *     U-2-Net microservice) so it lands on the card with a transparent
 *     background, no manual cropping needed.
 *   - "Add Text" adds an editable text layer anywhere on the card.
 *   - Every layer can be dragged, resized (corner handle), rotated
 *     (corner handle), duplicated, and removed — independently per side
 *     (front/back), exactly like the old logo layers.
 * There are no fixed "Full Name / ID Number / Photo" fields anymore — the
 * user builds the card entirely from uploaded images + free text.
 */

import { useRef, useState } from "react";
import Image from "next/image";

// ── Embedded types ───────────────────────────────────────────────────────

export type OrderType = "individual" | "bulk";
export type CardOrientation = "portrait" | "landscape";
export type CardMaterial = "standard-pvc" | "biodegradable" | "lanyard-attach";
export type CardTheme = "default" | "blue" | "green" | "dark" | "red" | "custom";
export type CardSide = "front" | "back";
export type LayerType = "image" | "text";

export const CARD_SIZE_OPTIONS = [
  { id: "cr80", label: "CR80 Standard (85.6 x 54 mm)" },
  { id: "cr79", label: "CR79 (83.9 x 51.9 mm)" },
  { id: "a7", label: "A7 Event Badge (74 x 105 mm)" },
] as const;

export const THEME_OPTIONS: { id: CardTheme; hex: string }[] = [
  { id: "default", hex: "#e5e7eb" },
  { id: "blue", hex: "#2563eb" },
  { id: "green", hex: "#16a34a" },
  { id: "dark", hex: "#111827" },
  { id: "red", hex: "#dc2626" },
  { id: "custom", hex: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" },
];

export interface CardLayer {
  id: string;
  type: LayerType;
  content: string;       // image src (object URL) OR text content
  pos: { x: number; y: number }; // percentage within canvas
  scale: number;
  rotation: number;
  fontSize?: number;     // text layers only, in px at scale=1
  color?: string;        // text layers only
}

export type CardLayers = Record<CardSide, CardLayer[]>;

export const EMPTY_CARD_LAYERS: CardLayers = { front: [], back: [] };

function newLayer(partial: Partial<CardLayer> & Pick<CardLayer, "type" | "content">): CardLayer {
  return {
    id: Math.random().toString(36).slice(2),
    pos: { x: 50, y: 50 },
    scale: 1,
    rotation: 0,
    fontSize: 16,
    color: "#111827",
    ...partial,
  };
}

// Sends the uploaded image to /api/remove-bg (proxies to the Python
// rembg / U-2-Net service) and returns an object URL for the
// background-removed PNG. Falls back to the original image if the
// service call fails, so uploads never silently do nothing.
async function removeBackground(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/remove-bg", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Background removal failed");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// ── Order Type selector ─────────────────────────────────────────────────

function OrderTypeSelector({ value, onChange }: { value: OrderType; onChange: (v: OrderType) => void }) {
  const OPTIONS: { id: OrderType; label: string }[] = [
    { id: "individual", label: "For Individual" },
    { id: "bulk", label: "For Bulk" },
  ];
  return (
    <div>
      <span className="text-[16px] font-semibold text-gray-700 mb-2 block">Order Type</span>
      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`py-3.5 rounded-2xl border-2 font-bold text-sm transition-all ${
                isSelected ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Draggable / resizable / rotatable layer (image or text) ────────────────

function DraggableLayer({
  layer, containerRef, active, onActivate,
  onPosChange, onScaleChange, onRotationChange, onTextChange,
  onDuplicate, onDelete,
}: {
  layer: CardLayer;
  containerRef: React.RefObject<HTMLDivElement | null>;
  active: boolean;
  onActivate: () => void;
  onPosChange: (p: { x: number; y: number }) => void;
  onScaleChange: (s: number) => void;
  onRotationChange: (r: number) => void;
  onTextChange: (v: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const dragging = useRef(false);
  const resizing = useRef(false);
  const rotating = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const startScale = useRef(1);
  const startDist = useRef(1);
  const [editing, setEditing] = useState(false);

  const updateFromPoint = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(2, Math.min(98, ((clientY - rect.top) / rect.height) * 100));
    onPosChange({ x, y });
  };
  const getCenter = () => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (editing) return;
    onActivate();
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    e.preventDefault();
    updateFromPoint(e.clientX, e.clientY);
  };
  const handlePointerUp = () => { dragging.current = false; };

  const handleResizeDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    onActivate();
    resizing.current = true;
    startScale.current = layer.scale;
    const c = getCenter();
    startDist.current = Math.hypot(e.clientX - c.x, e.clientY - c.y) || 1;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handleResizeMove = (e: React.PointerEvent) => {
    if (!resizing.current) return;
    e.stopPropagation();
    const c = getCenter();
    const dist = Math.hypot(e.clientX - c.x, e.clientY - c.y) || 1;
    onScaleChange(Math.max(0.3, Math.min(4, startScale.current * (dist / startDist.current))));
  };
  const handleResizeUp = () => { resizing.current = false; };

  const handleRotateDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    rotating.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handleRotateMove = (e: React.PointerEvent) => {
    if (!rotating.current) return;
    e.stopPropagation();
    const c = getCenter();
    const angle = Math.atan2(e.clientY - c.y, e.clientX - c.x) * (180 / Math.PI);
    onRotationChange(angle + 135);
  };
  const handleRotateUp = () => { rotating.current = false; };

  return (
    <div
      ref={wrapperRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={() => { if (layer.type === "text") setEditing(true); }}
      style={{
        position: "absolute",
        left: `${layer.pos.x}%`,
        top: `${layer.pos.y}%`,
        transform: `translate(-50%, -50%) rotate(${layer.rotation}deg) scale(${layer.scale})`,
        touchAction: active ? "none" : "pan-y",
        cursor: editing ? "text" : "grab",
      }}
      className="select-none active:cursor-grabbing group/layer"
    >
      {/* Controls — only visible while active/hovered */}
      <button type="button" onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Remove"
        className="absolute -top-2 -right-2 z-10 w-5 h-5 rounded-full bg-black/70 hover:bg-red-600 text-white text-[10px] font-bold flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover/layer:opacity-100 transition-opacity">
        ✕
      </button>
      <button type="button" onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onDuplicate(); }} title="Duplicate"
        className="absolute -top-2 -left-2 z-10 w-5 h-5 rounded-full bg-black/70 hover:bg-blue-600 text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover/layer:opacity-100 transition-opacity">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5a2 2 0 012-2h9a2 2 0 012 2v9a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-2M8 7h7a2 2 0 012 2v7" />
        </svg>
      </button>
      <div onPointerDown={handleResizeDown} onPointerMove={handleResizeMove}
        onPointerUp={handleResizeUp} onPointerCancel={handleResizeUp} title="Resize"
        style={{ touchAction: "none" }}
        className="absolute -bottom-2 -right-2 z-10 w-5 h-5 rounded-full bg-black/70 hover:bg-green-600 text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover/layer:opacity-100 transition-opacity cursor-nwse-resize">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 20l7-7m9-9l-7 7M14 4h6v6M4 14v6h6" />
        </svg>
      </div>
      <div onPointerDown={handleRotateDown} onPointerMove={handleRotateMove}
        onPointerUp={handleRotateUp} onPointerCancel={handleRotateUp} title="Rotate"
        style={{ touchAction: "none" }}
        className="absolute -bottom-2 -left-2 z-10 w-5 h-5 rounded-full bg-black/70 hover:bg-purple-600 text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover/layer:opacity-100 transition-opacity cursor-grab">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 1113.36-4.65M19.5 4v4.5H15" />
        </svg>
      </div>

      {/* Content */}
      {layer.type === "image" ? (
        <div className="relative w-[70px] h-[70px] pointer-events-none">
          <Image src={layer.content} alt="Uploaded" fill className="object-contain drop-shadow-md" />
        </div>
      ) : editing ? (
        <input
          autoFocus
          value={layer.content}
          onChange={(e) => onTextChange(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => { if (e.key === "Enter") setEditing(false); }}
          onPointerDown={(e) => e.stopPropagation()}
          style={{ fontSize: layer.fontSize, color: layer.color }}
          className="bg-white/90 border border-gray-400 rounded px-1.5 py-0.5 outline-none min-w-[80px]"
        />
      ) : (
        <div
          style={{ fontSize: layer.fontSize, color: layer.color }}
          className="whitespace-nowrap font-semibold px-1 drop-shadow-sm"
        >
          {layer.content || "Double-click to edit"}
        </div>
      )}
    </div>
  );
}

// ── Freeform live preview canvas ────────────────────────────────────────

function LiveCardCanvas({
  side, onSideChange, blankImageFront, blankImageBack,
  layers, setLayers, orientation,
}: {
  side: CardSide;
  onSideChange: (s: CardSide) => void;
  blankImageFront?: string;
  blankImageBack?: string;
  layers: CardLayers;
  setLayers: React.Dispatch<React.SetStateAction<CardLayers>>;
  orientation: CardOrientation;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [removingBg, setRemovingBg] = useState(false);
  const [bgRemoveError, setBgRemoveError] = useState<string | null>(null);
  const isLandscape = orientation === "landscape";
  const bgSrc = side === "front" ? blankImageFront : (blankImageBack || blankImageFront);

  const activeLayers = layers[side];

  const updateActiveLayers = (fn: (prev: CardLayer[]) => CardLayer[]) =>
    setLayers((prev) => ({ ...prev, [side]: fn(prev[side]) }));

  const addImageLayer = async (file: File) => {
    setBgRemoveError(null);
    setRemovingBg(true);
    let src: string;
    try {
      src = await removeBackground(file);
    } catch {
      setBgRemoveError("Couldn't remove background — used original image instead.");
      src = URL.createObjectURL(file);
    } finally {
      setRemovingBg(false);
    }
    const layer = newLayer({ type: "image", content: src });
    updateActiveLayers((prev) => [...prev, layer]);
    setActiveId(layer.id);
  };

  const addTextLayer = () => {
    const layer = newLayer({ type: "text", content: "Your Text" });
    updateActiveLayers((prev) => [...prev, layer]);
    setActiveId(layer.id);
  };

  const patchLayer = (id: string, patch: Partial<CardLayer>) =>
    updateActiveLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const duplicateLayer = (id: string) =>
    updateActiveLayers((prev) => {
      const layer = prev.find((l) => l.id === id);
      if (!layer) return prev;
      const copy = { ...layer, id: Math.random().toString(36).slice(2), pos: { x: Math.min(96, layer.pos.x + 4), y: Math.min(96, layer.pos.y + 4) } };
      return [...prev, copy];
    });

  const deleteLayer = (id: string) => updateActiveLayers((prev) => prev.filter((l) => l.id !== id));

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-1.5 bg-white/95 border border-gray-200 rounded-full px-2.5 py-1 text-xs font-bold text-gray-800 shadow-sm self-start">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
        </span>
        Live
      </div>

      <div
        ref={containerRef}
        onClick={() => setActiveId(null)}
        className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-dashed border-gray-300 bg-white flex-shrink-0"
        style={{ width: isLandscape ? 320 : 210, height: isLandscape ? 210 : 330 }}
      >
        {bgSrc ? (
          <Image key={bgSrc} src={bgSrc} alt={`Blank card ${side}`} fill className="object-cover pointer-events-none select-none" draggable={false} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 text-center px-4">
            No blank template set for this side
          </div>
        )}

        {activeLayers.map((layer) => (
          <DraggableLayer
            key={layer.id}
            layer={layer}
            containerRef={containerRef}
            active={activeId === layer.id}
            onActivate={() => setActiveId(layer.id)}
            onPosChange={(p) => patchLayer(layer.id, { pos: p })}
            onScaleChange={(s) => patchLayer(layer.id, { scale: s })}
            onRotationChange={(r) => patchLayer(layer.id, { rotation: r })}
            onTextChange={(v) => patchLayer(layer.id, { content: v })}
            onDuplicate={() => duplicateLayer(layer.id)}
            onDelete={() => deleteLayer(layer.id)}
          />
        ))}
      </div>

      <div className="flex gap-2">
        {(["front", "back"] as CardSide[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSideChange(s)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              side === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) addImageLayer(f); e.target.value = ""; }}
        />
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={removingBg}
          className="px-3 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          {removingBg && <span className="w-3 h-3 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />}
          {removingBg ? "Removing background…" : "Upload Image"}
        </button>
        <button
          type="button"
          onClick={addTextLayer}
          className="px-3 py-2 border-2 border-gray-900 text-gray-900 text-xs font-semibold rounded-lg hover:bg-gray-50 transition"
        >
          Add Text
        </button>
      </div>
      {bgRemoveError && <p className="text-[10px] text-orange-500 text-center max-w-[220px]">{bgRemoveError}</p>}
      
    </div>
  );
}

// ── Main section ─────────────────────────────────────────────────────────

export default function IDCardUploadSection({
  orderType, onOrderTypeChange,
  orientation, onOrientationChange,
  cardSizeId, onCardSizeChange,
  theme, onThemeChange,
  customThemeColor = "#111827", onCustomThemeColorChange,
  cardMaterial, onCardMaterialChange,
  blankImageFront, blankImageBack,
  layers, setLayers,
  side, onSideChange,
  customizationNote, onCustomizationNoteChange,
}: {
  orderType: OrderType;
  onOrderTypeChange: (v: OrderType) => void;
  orientation: CardOrientation;
  onOrientationChange: (v: CardOrientation) => void;
  cardSizeId: string;
  onCardSizeChange: (v: string) => void;
  theme: CardTheme;
  onThemeChange: (v: CardTheme) => void;
  customThemeColor?: string;
  onCustomThemeColorChange?: (hex: string) => void;
  cardMaterial: CardMaterial;
  onCardMaterialChange: (v: CardMaterial) => void;
  blankImageFront?: string;
  blankImageBack?: string;
  layers: CardLayers;
  setLayers: React.Dispatch<React.SetStateAction<CardLayers>>;
  side: CardSide;
  onSideChange: (s: CardSide) => void;
  customizationNote?: string;
  onCustomizationNoteChange?: (v: string) => void;
}) {
  const [showCustomColorModal, setShowCustomColorModal] = useState(false);

  return (
    <div className="border-2 border-gray-200 rounded-xl p-4 flex flex-col gap-5">
      {/* 1. Order Type */}
      <OrderTypeSelector value={orderType} onChange={onOrderTypeChange} />

      <div className="border-t border-gray-100 pt-4 flex flex-col gap-5 lg:flex-row lg:gap-6">
        {/* Left column: settings */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">

          {/* 2. Card Settings */}
          <div>
            <span className="text-[13px] font-semibold text-gray-600 mb-2 block">Card Settings</span>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Orientation</label>
                <div className="flex gap-2">
                  {(["portrait", "landscape"] as CardOrientation[]).map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => onOrientationChange(o)}
                      className={`flex-1 py-2 rounded-xl border-2 text-xs font-semibold capitalize transition-all ${
                        orientation === o ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Card Size</label>
                <select
                  value={cardSizeId}
                  onChange={(e) => onCardSizeChange(e.target.value)}
                  className="h-[38px] border-2 border-gray-200 rounded-xl px-2 text-xs font-semibold text-gray-700 bg-white outline-none focus:border-gray-700"
                >
                  {CARD_SIZE_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Theme</label>
            <div className="flex gap-2 flex-wrap">
              {THEME_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    onThemeChange(t.id);
                    if (t.id === "custom") setShowCustomColorModal(true);
                  }}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    theme === t.id ? "border-gray-900 ring-2 ring-gray-300" : "border-gray-200"
                  }`}
                  style={t.id === "custom" ? { background: t.hex } : { backgroundColor: t.hex }}
                  title={t.id}
                >
                  {theme === t.id && (
                    <svg className="w-3.5 h-3.5 text-white drop-shadow" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Card Material Type */}
          <div>
            <span className="text-[13px] font-semibold text-gray-600 mb-2 block">Card Material Type</span>
            <div className="flex gap-2 sm:gap-3">
              {([
                { id: "standard-pvc", label: "Standard PVC" },
                { id: "biodegradable", label: "Biodegradable" },
                { id: "lanyard-attach", label: "Lanyard Attach" },
              ] as { id: CardMaterial; label: string }[]).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onCardMaterialChange(m.id)}
                  className={`flex-1 py-2.5 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                    cardMaterial === m.id ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3b. Optional note / customization instructions */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-gray-600">
              Any Text or Customization <span className="font-normal text-gray-400">(Optional)</span>
            </label>
            <textarea
              value={customizationNote ?? ""}
              onChange={(e) => onCustomizationNoteChange?.(e.target.value)}
              placeholder="E.g. Add 'Team Alpha' text, specific font, gold foil finish, etc."
              maxLength={500}
              className="w-full h-40 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none resize-none focus:border-gray-700 transition-colors placeholder:text-gray-400"
            />
            {/* <span className="text-[11px] text-gray-400 text-right">{(customizationNote ?? "").length}/500</span> */}
          </div>
        </div>

        {/* 4. Freeform live preview */}
        <div className="flex-shrink-0 lg:w-[340px]">
          <LiveCardCanvas
            side={side}
            onSideChange={onSideChange}
            blankImageFront={blankImageFront}
            blankImageBack={blankImageBack}
            layers={layers}
            setLayers={setLayers}
            orientation={orientation}
          />
        </div>
      </div>

      {showCustomColorModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={() => setShowCustomColorModal(false)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Pick a Custom Color</h3>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customThemeColor}
                onChange={(e) => onCustomThemeColorChange?.(e.target.value)}
                className="w-14 h-14 rounded-lg border border-gray-200 cursor-pointer"
              />
              <span className="text-sm font-mono text-gray-600">{customThemeColor}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowCustomColorModal(false)}
              className="w-full mt-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ── Example wiring in your page ──────────────────────────────────────────
 *
 * import IDCardUploadSection, {
 *   type OrderType, type CardOrientation, type CardMaterial, type CardTheme,
 *   type CardSide, type CardLayers, EMPTY_CARD_LAYERS,
 * } from "./IDCardUploadSection";
 *
 * const [orderType, setOrderType] = useState<OrderType>("individual");
 * const [orientation, setOrientation] = useState<CardOrientation>("portrait");
 * const [cardSizeId, setCardSizeId] = useState("cr80");
 * const [theme, setTheme] = useState<CardTheme>("default");
 * const [customThemeColor, setCustomThemeColor] = useState("#111827");
 * const [cardMaterial, setCardMaterial] = useState<CardMaterial>("standard-pvc");
 * const [cardLayers, setCardLayers] = useState<CardLayers>(EMPTY_CARD_LAYERS);
 * const [cardSide, setCardSide] = useState<CardSide>("front");
 *
 * <IDCardUploadSection
 *   orderType={orderType} onOrderTypeChange={setOrderType}
 *   orientation={orientation} onOrientationChange={setOrientation}
 *   cardSizeId={cardSizeId} onCardSizeChange={setCardSizeId}
 *   theme={theme} onThemeChange={setTheme}
 *   customThemeColor={customThemeColor} onCustomThemeColorChange={setCustomThemeColor}
 *   cardMaterial={cardMaterial} onCardMaterialChange={setCardMaterial}
 *   blankImageFront={blankMedia[0]?.src} blankImageBack={blankMedia[1]?.src}
 *   layers={cardLayers} setLayers={setCardLayers}
 *   side={cardSide} onSideChange={setCardSide}
 * />
 *
 * Also required in the same project:
 *  - app/api/remove-bg/route.ts  (Next.js proxy → Python service)
 *  - rembg_service.py            (FastAPI + rembg U-2-Net, run separately)
 *  - .env: REMBG_SERVICE_URL=http://localhost:7860
 */