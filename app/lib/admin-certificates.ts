// PATH: app/lib/admin-certificates.ts
//
// ⚠️ SERVER-ONLY — this file imports app/lib/db.ts (mysql2), which does not
// work in the browser. Never import this file from a "use client" component
// — import from app/lib/certificate-types.ts instead for the plain
// types/constants (CertLayer, CERTIFICATE_CATEGORIES, etc.), which has zero
// DB dependency. API routes and server components can keep importing
// everything from here as before; the types are just re-exported below.
//
// Data layer for admin-authored certificate templates. Mirrors the existing
// `query()` convention used by admin-orders.ts / admin-stats.ts elsewhere in
// this codebase — MySQL/MariaDB, so `?` placeholders (not $1/$2), and no
// RETURNING clause (that's Postgres-only) — inserts/updates re-fetch the row
// afterward instead.
//
// Each template is built from two uploaded photos rather than a CSS
// background:
//   - demo_image_url  — a fully filled-in example, shown as the picker
//                        thumbnail so customers know what they're choosing.
//   - blank_image_url — the same design with nothing filled in, used as the
//                        actual canvas background both while the admin is
//                        positioning layers here and while a customer fills
//                        them in on the storefront.
// All the fixed decorative content (borders, seals, "This is to certify
// that…", signature lines, etc.) lives directly in the photographed/designed
// blank image — layers on top of it are only the things meant to be filled
// in (name, date, a photo), not a recreation of the whole design in CSS.
//
// `category` lets different products have their own separate template
// libraries instead of sharing one pool — e.g. "certificate" for the
// Certificate Frames product, "home-decor" for the Home Decor product.

import { query } from "@/app/lib/db";
import type { CertLayer, CertOrientation, CertCategory, CertificateTemplate, CertificateTemplateInput } from "@/app/lib/certificate-types";

// Re-export everything from the types file so existing imports elsewhere
// (API routes, server components) keep working unchanged.
export * from "@/app/lib/certificate-types";

const SELECT_COLUMNS = `id, name, category, orientation, demo_image_url, blank_image_url, layers, is_active, created_at, updated_at`;

// Raw DB row has `layers` as a JSON string (mysql2 typically returns JSON
// columns already parsed, but normalize defensively either way) and
// `is_active` as 0/1 (TINYINT) rather than a real boolean.
function normalizeRow(row: any): CertificateTemplate {
  let layers: CertLayer[] = [];
  if (Array.isArray(row.layers)) {
    layers = row.layers;
  } else if (typeof row.layers === "string") {
    try {
      layers = JSON.parse(row.layers);
    } catch {
      layers = [];
    }
  }
  return {
    id: Number(row.id),
    name: row.name,
    category: (row.category as CertCategory) ?? "certificate",
    orientation: row.orientation,
    demo_image_url: row.demo_image_url ?? null,
    blank_image_url: row.blank_image_url ?? null,
    layers,
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function listCertificateTemplates(): Promise<CertificateTemplate[]> {
  const rows = await query<any[]>(
    `SELECT ${SELECT_COLUMNS} FROM certificate_templates ORDER BY updated_at DESC`
  );
  return rows.map(normalizeRow);
}

export async function getCertificateTemplateById(id: number): Promise<CertificateTemplate | null> {
  const rows = await query<any[]>(
    `SELECT ${SELECT_COLUMNS} FROM certificate_templates WHERE id = ?`,
    [id]
  );
  return rows[0] ? normalizeRow(rows[0]) : null;
}

// NOTE: this assumes `query()` returns the raw INSERT result (with an
// `insertId` field) when given an INSERT statement — the standard shape
// mysql2 returns. If your `query()` helper instead always returns just
// rows/nothing for non-SELECT statements, this needs a small tweak: swap
// the `result.insertId` line for however your helper exposes it.
export async function createCertificateTemplate(input: CertificateTemplateInput): Promise<CertificateTemplate> {
  const result: any = await query(
    `INSERT INTO certificate_templates (name, category, orientation, demo_image_url, blank_image_url, layers, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      input.name,
      input.category,
      input.orientation,
      input.demo_image_url,
      input.blank_image_url,
      JSON.stringify(input.layers),
      input.is_active ?? true,
    ]
  );

  const insertId = Array.isArray(result) ? result[0]?.insertId : result?.insertId;
  if (!insertId) {
    throw new Error("Insert succeeded but no insertId was returned — check query() helper's return shape.");
  }

  const created = await getCertificateTemplateById(insertId);
  if (!created) throw new Error("Created certificate template but could not re-fetch it.");
  return created;
}

export async function updateCertificateTemplate(
  id: number,
  input: Partial<CertificateTemplateInput>
): Promise<CertificateTemplate | null> {
  const existing = await getCertificateTemplateById(id);
  if (!existing) return null;

  const merged: CertificateTemplateInput = {
    name: input.name ?? existing.name,
    category: input.category ?? existing.category,
    orientation: input.orientation ?? existing.orientation,
    demo_image_url: input.demo_image_url !== undefined ? input.demo_image_url : existing.demo_image_url,
    blank_image_url: input.blank_image_url !== undefined ? input.blank_image_url : existing.blank_image_url,
    layers: input.layers ?? existing.layers,
    is_active: input.is_active ?? existing.is_active,
  };

  await query(
    `UPDATE certificate_templates
     SET name = ?, category = ?, orientation = ?, demo_image_url = ?, blank_image_url = ?, layers = ?, is_active = ?
     WHERE id = ?`,
    [
      merged.name,
      merged.category,
      merged.orientation,
      merged.demo_image_url,
      merged.blank_image_url,
      JSON.stringify(merged.layers),
      merged.is_active,
      id,
    ]
  );

  return getCertificateTemplateById(id);
}

export async function deleteCertificateTemplate(id: number): Promise<boolean> {
  const existing = await getCertificateTemplateById(id);
  if (!existing) return false;
  await query(`DELETE FROM certificate_templates WHERE id = ?`, [id]);
  return true;
}

// ── Public (storefront-facing) accessor ──────────────────────────────────────
// Only ever returns active templates — used by the public API route that
// each product page calls to offer these as starting layouts. Always scoped
// to a category so, e.g., Home Decor never sees Certificate Frames' designs.
export async function listActiveCertificateTemplates(
  category: CertCategory,
  orientation?: CertOrientation
): Promise<CertificateTemplate[]> {
  const rows = orientation
    ? await query<any[]>(
        `SELECT ${SELECT_COLUMNS} FROM certificate_templates
         WHERE is_active = 1 AND category = ? AND orientation = ?
         ORDER BY updated_at DESC`,
        [category, orientation]
      )
    : await query<any[]>(
        `SELECT ${SELECT_COLUMNS} FROM certificate_templates
         WHERE is_active = 1 AND category = ?
         ORDER BY updated_at DESC`,
        [category]
      );
  return rows.map(normalizeRow);
}