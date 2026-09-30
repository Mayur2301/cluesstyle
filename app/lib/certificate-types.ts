// PATH: app/lib/certificate-types.ts
//
// Pure types + constants for certificate templates — deliberately has ZERO
// imports from app/lib/db.ts (or anything that pulls in mysql2/Node core
// modules). This is what client components (CertificateBuilder.tsx) import
// from directly.
//
// admin-certificates.ts re-exports everything here for backwards
// compatibility with existing server-side imports (API routes, server
// components) — those can keep importing from either file.

// ── Layer model (kept in sync with the storefront's CertLayer union) ────────
export type CertLayerBase = {
  id: string;
  pos: { x: number; y: number }; // percentage of canvas, 0–100
  scale: number;
  rotation: number; // degrees
};

export type CertTextLayer = CertLayerBase & {
  type: "text";
  text: string;
  color: string;
  fontSize: number;
  fontWeight: 400 | 700;
  fontFamily?: string;
  fontStyle?: "normal" | "italic";
  align?: "left" | "center" | "right";
  // Marks a layer as something the *customer* should be able to fill in on
  // the storefront (e.g. the recipient's name) — the common case now that
  // fixed decorative content lives in the blank image itself. Set false for
  // the rare fixed overlay text the admin doesn't want touched.
  editableByCustomer?: boolean;
  placeholder?: string;
};

export type CertImageLayer = CertLayerBase & {
  type: "image";
  src: string;
  editableByCustomer?: boolean;
};

export type CertShapeLayer = CertLayerBase & {
  type: "shape";
  shape: "rect" | "circle" | "line" | "star";
  color: string;
};

export type CertLayer = CertTextLayer | CertImageLayer | CertShapeLayer;

export type CertOrientation = "portrait" | "landscape";

// Add new entries here as more products get their own certificate/design
// library — this is the single source of truth for what shows in the admin
// builder's Category dropdown.
export const CERTIFICATE_CATEGORIES = [
  { id: "certificate", label: "Certificate Frames" },
  { id: "home-decor", label: "Home Decor" },
] as const;
export type CertCategory = (typeof CERTIFICATE_CATEGORIES)[number]["id"];

export interface CertificateTemplate {
  id: number;
  name: string;
  category: CertCategory;
  orientation: CertOrientation;
  demo_image_url: string | null;
  blank_image_url: string | null;
  layers: CertLayer[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CertificateTemplateInput {
  name: string;
  category: CertCategory;
  orientation: CertOrientation;
  demo_image_url: string | null;
  blank_image_url: string | null;
  layers: CertLayer[];
  is_active?: boolean;
}