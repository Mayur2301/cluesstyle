// PATH: app/admin/(protected)/certificates/CertificateBuilder.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CERTIFICATE_CATEGORIES,
  type CertLayer,
  type CertTextLayer,
  type CertImageLayer,
  type CertShapeLayer,
  type CertOrientation,
  type CertCategory,
  type CertificateTemplate,
} from "@/app/lib/certificate-types";

function newId() {
  return Math.random().toString(36).slice(2);
}
function newTextLayer(): CertTextLayer {
  return {
    id: newId(),
    pos: { x: 50, y: 50 },
    scale: 1,
    rotation: 0,
    type: "text",
    text: "Your text here",
    color: "#111827",
    fontSize: 20,
    fontWeight: 700,
    fontFamily: "serif",
    fontStyle: "normal",
    align: "center",
    // Defaults to true — with a blank photo background, most layers you add
    // are meant to be filled in by the customer (name, date, etc). Toggle
    // off in the properties panel for the rare fixed overlay text.
    editableByCustomer: true,
  };
}
function newImageLayer(): CertImageLayer {
  return { id: newId(), pos: { x: 50, y: 50 }, scale: 1, rotation: 0, type: "image", src: "", editableByCustomer: true };
}
function newShapeLayer(shape: CertShapeLayer["shape"]): CertShapeLayer {
  return { id: newId(), pos: { x: 50, y: 50 }, scale: 1, rotation: 0, type: "shape", shape, color: "#b8860b" };
}

const FONT_OPTIONS = [
  { value: "serif", label: "Serif" },
  { value: "sans-serif", label: "Sans-serif" },
  { value: "'Times New Roman', serif", label: "Times New Roman" },
  { value: "'Georgia', serif", label: "Georgia" },
  { value: "'Brush Script MT', cursive", label: "Script / Cursive" },
  { value: "'Courier New', monospace", label: "Monospace" },
];

// ── Real file upload for demo/blank certificate photos ───────────────────────
// Posts to /api/admin/certificates/upload and stores the returned URL —
// admin picks a file from their computer, not a path they have to know.
function ImageUploadField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/certificates/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Upload failed.");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-[11px] text-gray-500 mb-1">{label}</label>

      {value ? (
        <div className="flex items-center gap-2">
          <div className="relative w-14 h-14 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-xs font-semibold text-blue-600 hover:underline disabled:opacity-50 text-left"
            >
              {uploading ? "Uploading…" : "Replace"}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs font-semibold text-gray-400 hover:text-red-600 text-left"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 py-3 text-xs font-semibold text-gray-500 disabled:opacity-50 transition-colors"
        >
          {uploading ? (
            "Uploading…"
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 8.25L12 3.75m0 0L7.5 8.25M12 3.75v12" />
              </svg>
              Upload image
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {error && <p className="text-[10px] text-red-600 mt-1">{error}</p>}
      <p className="text-[10px] text-gray-400 mt-1">{hint}</p>
    </div>
  );
}

// ── Draggable/resizable/rotatable layer on the canvas ────────────────────────
function BuilderLayer({
  layer,
  active,
  containerRef,
  onActivate,
  onPosChange,
  onScaleChange,
  onRotationChange,
}: {
  layer: CertLayer;
  active: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onActivate: () => void;
  onPosChange: (p: { x: number; y: number }) => void;
  onScaleChange: (s: number) => void;
  onRotationChange: (r: number) => void;
}) {
  const dragging = useRef(false);
  const resizing = useRef(false);
  const rotating = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const startScale = useRef(1);
  const startDist = useRef(1);

  const clientToPct = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return layer.pos;
    return {
      x: Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100)),
    };
  };

  const handleMove = (e: React.PointerEvent) => {
    if (dragging.current) {
      onPosChange(clientToPct(e.clientX, e.clientY));
    } else if (resizing.current) {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      const next = Math.max(0.2, Math.min(6, startScale.current * (dist / startDist.current)));
      onScaleChange(next);
    } else if (rotating.current) {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;
      onRotationChange(Math.round(angle));
    }
  };

  const endAll = () => {
    dragging.current = false;
    resizing.current = false;
    rotating.current = false;
  };

  const startResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (rect) {
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      startDist.current = Math.hypot(e.clientX - cx, e.clientY - cy) || 1;
    }
    startScale.current = layer.scale;
    resizing.current = true;
  };

  return (
    <div
      ref={wrapperRef}
      onPointerDown={(e) => {
        e.stopPropagation();
        onActivate();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        dragging.current = true;
      }}
      onPointerMove={handleMove}
      onPointerUp={endAll}
      onPointerCancel={endAll}
      className={`absolute select-none ${active ? "z-20" : "z-10"} ${dragging.current ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        left: `${layer.pos.x}%`,
        top: `${layer.pos.y}%`,
        transform: `translate(-50%, -50%) rotate(${layer.rotation}deg) scale(${layer.scale})`,
        touchAction: "none",
      }}
    >
      <div className={`relative ${active ? "outline outline-2 outline-blue-400 outline-offset-4" : ""}`}>
        {layer.type === "text" && (
          <span
            style={{
              color: layer.color,
              fontSize: `${layer.fontSize}px`,
              fontWeight: layer.fontWeight,
              fontFamily: layer.fontFamily,
              fontStyle: layer.fontStyle,
              textAlign: layer.align ?? "center",
              // Customer-editable fields render as a single-line <input> on
              // the storefront — preview them the same way here so a long
              // placeholder doesn't look deceptively wrapped while designing.
              whiteSpace: layer.editableByCustomer ? "nowrap" : "pre-wrap",
              display: "inline-block",
            }}
          >
            {layer.text}
          </span>
        )}
        {layer.type === "image" &&
          (layer.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={layer.src} alt="" className="max-w-[140px] max-h-[140px] object-contain pointer-events-none" draggable={false} />
          ) : (
            <div className="w-20 h-20 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400 bg-white/60">
              no image URL
            </div>
          ))}
        {layer.type === "shape" && (
          <div
            style={{
              width: 40,
              height: layer.shape === "line" ? 3 : 40,
              background: layer.shape === "star" ? "transparent" : layer.color,
              borderRadius: layer.shape === "circle" ? "9999px" : 0,
              border: layer.shape === "star" ? `3px solid ${layer.color}` : undefined,
              clipPath:
                layer.shape === "star"
                  ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
                  : undefined,
            }}
          />
        )}

        {active && (
          <>
            {/* Resize handle — bottom-right */}
            <div
              onPointerDown={startResize}
              className="absolute -bottom-2.5 -right-2.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow cursor-nwse-resize"
              style={{ touchAction: "none" }}
            />
            {/* Rotate handle — top */}
            <div
              onPointerDown={(e) => {
                e.stopPropagation();
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
                rotating.current = true;
              }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-purple-500 border-2 border-white shadow cursor-grab"
              style={{ touchAction: "none" }}
            />
          </>
        )}
      </div>
    </div>
  );
}

// ── Main builder ───────────────────────────────────────────────────────────
const DEFAULT_INITIAL = {
  name: "",
  category: "certificate" as CertCategory,
  orientation: "portrait" as CertOrientation,
  demo_image_url: null as string | null,
  blank_image_url: null as string | null,
  layers: [] as CertLayer[],
  is_active: true,
};

export default function CertificateBuilder({
  mode,
  templateId,
  initial = DEFAULT_INITIAL,
}: {
  mode: "new" | "edit";
  templateId?: number;
  initial?: {
    name: string;
    category: CertCategory;
    orientation: CertOrientation;
    demo_image_url: string | null;
    blank_image_url: string | null;
    layers: CertLayer[];
    is_active: boolean;
  };
}) {
  const router = useRouter();

  const [name, setName] = useState(initial.name);
  const [category, setCategory] = useState<CertCategory>(initial.category);
  const [orientation, setOrientation] = useState<CertOrientation>(initial.orientation);
  const [demoImageUrl, setDemoImageUrl] = useState(initial.demo_image_url ?? "");
  const [blankImageUrl, setBlankImageUrl] = useState(initial.blank_image_url ?? "");
  const [isActive, setIsActive] = useState(initial.is_active);
  const [layers, setLayers] = useState<CertLayer[]>(initial.layers);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const selected = layers.find((l) => l.id === selectedId) ?? null;

  const updateLayer = (id: string, patch: Partial<CertLayer>) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? ({ ...l, ...patch } as CertLayer) : l)));
  };

  const addLayer = (layer: CertLayer) => {
    setLayers((prev) => [...prev, layer]);
    setSelectedId(layer.id);
  };

  const duplicateSelected = () => {
    if (!selected) return;
    const copy = { ...selected, id: newId(), pos: { x: Math.min(90, selected.pos.x + 4), y: Math.min(90, selected.pos.y + 4) } };
    setLayers((prev) => [...prev, copy as CertLayer]);
    setSelectedId(copy.id);
  };

  const deleteSelected = () => {
    if (!selected) return;
    setLayers((prev) => prev.filter((l) => l.id !== selected.id));
    setSelectedId(null);
  };

  const moveLayer = (id: string, dir: "up" | "down") => {
    setLayers((prev) => {
      const i = prev.findIndex((l) => l.id === id);
      if (i === -1) return prev;
      const j = dir === "up" ? i + 1 : i - 1;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  async function handleSave() {
    if (!name.trim()) {
      setError("Give this certificate a name first.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        category,
        orientation,
        demo_image_url: demoImageUrl.trim() || null,
        blank_image_url: blankImageUrl.trim() || null,
        layers,
        is_active: isActive,
      };
      const res =
        mode === "new"
          ? await fetch("/api/admin/certificates", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/admin/certificates/${templateId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Could not save this certificate.");
        return;
      }

      if (mode === "new" && data?.template?.id) {
        router.push(`/admin/certificates/${data.template.id}`);
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[220px]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Certificate name (e.g. Classic Gold Appreciation)"
            className="flex-1 text-base font-bold text-gray-900 border-b border-transparent hover:border-gray-200 focus:border-gray-400 focus:outline-none px-1 py-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-gray-500">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active (visible to customers)
          </label>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm font-semibold bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 transition-colors"
          >
            {saving ? "Saving…" : mode === "new" ? "Create certificate" : "Save changes"}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_300px] gap-4 items-start">
        {/* Left: add elements + background */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Category</h3>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CertCategory)}
              className="w-full text-sm rounded-lg border border-gray-200 px-2.5 py-2"
            >
              {CERTIFICATE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <p className="text-[10px] text-gray-400 mt-1.5">
              Which product this template belongs to — customers on that product only ever see templates in the
              same category.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Orientation</h3>
            <div className="flex items-center gap-0.5 rounded-full bg-gray-100 p-0.5">
              {(["portrait", "landscape"] as const).map((o) => (
                <button
                  key={o}
                  onClick={() => setOrientation(o)}
                  className={`flex-1 px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                    orientation === o ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">Add element</h3>
            <button
              onClick={() => addLayer(newTextLayer())}
              className="w-full text-left text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 transition-colors"
            >
              + Text
            </button>
            <button
              onClick={() => addLayer(newImageLayer())}
              className="w-full text-left text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 transition-colors"
            >
              + Image / seal
            </button>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {(["rect", "circle", "line", "star"] as const).map((shape) => (
                <button
                  key={shape}
                  onClick={() => addLayer(newShapeLayer(shape))}
                  className="text-xs font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 capitalize transition-colors"
                >
                  + {shape}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Images</h3>
            <ImageUploadField
              label="Demo (filled-in example)"
              hint="Shown to customers as the picker thumbnail — a photo of what a finished certificate could look like."
              value={demoImageUrl}
              onChange={setDemoImageUrl}
            />
            <ImageUploadField
              label="Blank (nothing filled in)"
              hint="This is the canvas background below — position your text/image layers directly on top of it. The same blank photo (with your layers filled in) is what the customer edits and previews."
              value={blankImageUrl}
              onChange={setBlankImageUrl}
            />
          </div>
        </div>

        {/* Center: canvas */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div
            ref={containerRef}
            onPointerDown={() => setSelectedId(null)}
            className="relative w-full mx-auto overflow-hidden rounded-md border border-gray-200 bg-gray-50"
            style={{
              aspectRatio: orientation === "portrait" ? "3 / 4" : "4 / 3",
              maxWidth: orientation === "portrait" ? 480 : 640,
              backgroundImage: blankImageUrl ? `url("${blankImageUrl}")` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!blankImageUrl && (
              <div className="absolute inset-0 flex items-center justify-center text-center px-6">
                <p className="text-xs text-gray-400">
                  Add a blank image URL on the left to see your certificate design here — layers will position
                  directly on top of it.
                </p>
              </div>
            )}
            {layers.map((layer) => (
              <BuilderLayer
                key={layer.id}
                layer={layer}
                active={selectedId === layer.id}
                containerRef={containerRef}
                onActivate={() => setSelectedId(layer.id)}
                onPosChange={(pos) => updateLayer(layer.id, { pos })}
                onScaleChange={(scale) => updateLayer(layer.id, { scale })}
                onRotationChange={(rotation) => updateLayer(layer.id, { rotation })}
              />
            ))}
          </div>
          <p className="text-[11px] text-gray-400 text-center mt-2">
            Drag to move &middot; blue handle to resize &middot; purple handle to rotate
          </p>
        </div>

        {/* Right: layer list + properties */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">
              Layers ({layers.length})
            </h3>
            {layers.length === 0 ? (
              <p className="text-xs text-gray-400">Nothing on the canvas yet — add an element on the left.</p>
            ) : (
              <div className="space-y-1">
                {layers.map((l, i) => (
                  <div
                    key={l.id}
                    onClick={() => setSelectedId(l.id)}
                    className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer ${
                      selectedId === l.id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <span className="truncate">
                      {l.type === "text" ? `“${l.text.slice(0, 18)}${l.text.length > 18 ? "…" : ""}”` : l.type === "image" ? "Image" : `Shape: ${l.shape}`}
                    </span>
                    <span className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); moveLayer(l.id, "up"); }} title="Bring forward" className="hover:text-gray-900">
                        ↑
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); moveLayer(l.id, "down"); }} title="Send backward" className="hover:text-gray-900">
                        ↓
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selected && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Properties</h3>
                <div className="flex items-center gap-1">
                  <button onClick={duplicateSelected} title="Duplicate" className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                    </svg>
                  </button>
                  <button onClick={deleteSelected} title="Delete" className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-500 hover:text-red-600">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {selected.type === "text" && (
                <>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Text</label>
                    <textarea
                      value={selected.text}
                      onChange={(e) => updateLayer(selected.id, { text: e.target.value })}
                      rows={2}
                      className="w-full text-sm rounded-lg border border-gray-200 px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800 resize-y"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-1">Font size</label>
                      <input
                        type="number"
                        min={8}
                        max={96}
                        value={selected.fontSize}
                        onChange={(e) => updateLayer(selected.id, { fontSize: Number(e.target.value) || 20 })}
                        className="w-full text-sm rounded-lg border border-gray-200 px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-1">Color</label>
                      <input
                        type="color"
                        value={selected.color}
                        onChange={(e) => updateLayer(selected.id, { color: e.target.value })}
                        className="w-full h-8 rounded-lg border border-gray-200 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Font</label>
                    <select
                      value={selected.fontFamily}
                      onChange={(e) => updateLayer(selected.id, { fontFamily: e.target.value })}
                      className="w-full text-sm rounded-lg border border-gray-200 px-2.5 py-1.5"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateLayer(selected.id, { fontWeight: selected.fontWeight === 700 ? 400 : 700 })}
                      className={`flex-1 text-xs font-bold rounded-lg border px-2 py-1.5 ${selected.fontWeight === 700 ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-600"}`}
                    >
                      B
                    </button>
                    <button
                      onClick={() => updateLayer(selected.id, { fontStyle: selected.fontStyle === "italic" ? "normal" : "italic" })}
                      className={`flex-1 text-xs italic rounded-lg border px-2 py-1.5 ${selected.fontStyle === "italic" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-600"}`}
                    >
                      I
                    </button>
                    {(["left", "center", "right"] as const).map((a) => (
                      <button
                        key={a}
                        onClick={() => updateLayer(selected.id, { align: a })}
                        className={`flex-1 text-xs rounded-lg border px-2 py-1.5 capitalize ${selected.align === a ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-600"}`}
                      >
                        {a[0].toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center gap-1.5 text-[11px] text-gray-600 pt-1">
                    <input
                      type="checkbox"
                      checked={!!selected.editableByCustomer}
                      onChange={(e) => updateLayer(selected.id, { editableByCustomer: e.target.checked })}
                    />
                    Customer can edit this text (e.g. recipient name)
                  </label>
                  {selected.editableByCustomer && (
                    <input
                      value={selected.placeholder ?? ""}
                      onChange={(e) => updateLayer(selected.id, { placeholder: e.target.value })}
                      placeholder="Placeholder shown to the customer"
                      className="w-full text-xs rounded-lg border border-gray-200 px-2.5 py-1.5"
                    />
                  )}
                </>
              )}

              {selected.type === "image" && (
                <>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Image URL</label>
                    <input
                      value={selected.src}
                      onChange={(e) => updateLayer(selected.id, { src: e.target.value })}
                      placeholder="/certificates/gold-seal.webp"
                      className="w-full text-xs rounded-lg border border-gray-200 px-2.5 py-2"
                    />
                  </div>
                  <label className="flex items-center gap-1.5 text-[11px] text-gray-600">
                    <input
                      type="checkbox"
                      checked={!!selected.editableByCustomer}
                      onChange={(e) => updateLayer(selected.id, { editableByCustomer: e.target.checked })}
                    />
                    Customer can replace this image (e.g. a photo slot)
                  </label>
                </>
              )}

              {selected.type === "shape" && (
                <>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Shape</label>
                    <select
                      value={selected.shape}
                      onChange={(e) => updateLayer(selected.id, { shape: e.target.value as CertShapeLayer["shape"] })}
                      className="w-full text-sm rounded-lg border border-gray-200 px-2.5 py-1.5 capitalize"
                    >
                      {(["rect", "circle", "line", "star"] as const).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Color</label>
                    <input
                      type="color"
                      value={selected.color}
                      onChange={(e) => updateLayer(selected.id, { color: e.target.value })}
                      className="w-full h-8 rounded-lg border border-gray-200 cursor-pointer"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={() => updateLayer(selected.id, { pos: { ...selected.pos, x: 50 } })}
                  className="text-[11px] font-semibold rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 px-2 py-1.5"
                >
                  ↔ Center horizontally
                </button>
                <button
                  type="button"
                  onClick={() => updateLayer(selected.id, { pos: { ...selected.pos, y: 50 } })}
                  className="text-[11px] font-semibold rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 px-2 py-1.5"
                >
                  ↕ Center vertically
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1 mt-2">Scale</label>
                  <input
                    type="range"
                    min={0.2}
                    max={4}
                    step={0.05}
                    value={selected.scale}
                    onChange={(e) => updateLayer(selected.id, { scale: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1 mt-2">Rotation</label>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={selected.rotation}
                    onChange={(e) => updateLayer(selected.id, { rotation: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}