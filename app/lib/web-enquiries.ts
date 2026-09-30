// PATH: app/lib/web-enquiries.ts
//
// ⚠️ SERVER-ONLY — imports app/lib/db.ts (mysql2), which does not work in
// the browser. Never import this from a "use client" component; each
// inquiry modal calls its own /api/web-enquiry route (with a productType),
// which imports this.
//
// Shared data layer for every product inquiry form — Visiting Card today,
// Identity Card / Trophy / etc. as they're added. Contact fields are real
// columns; everything specific to that product's own form shape lives in
// `details` (JSON), so adding a new inquiry type never needs a migration —
// just call createWebEnquiry() with a new productType and whatever details
// that form collects.
//
// Mirrors the `query()` convention already used elsewhere in this codebase
// (admin-orders.ts, admin-certificates.ts) — MySQL/MariaDB, `?`
// placeholders, no RETURNING clause (Postgres-only) — inserts re-fetch the
// row by insertId afterward instead.

import { query } from "@/app/lib/db";

export interface WebEnquiryInput {
  productType: string; // "visiting-card" | "identity-card" | "trophy" | ...
  fullName: string;
  phone: string;
  email: string;
  companyName?: string;
  businessAddress?: string;
  // Whatever fields that specific product's form collects beyond the common
  // contact fields above — shape varies per productType.
  details: Record<string, unknown>;
}

export interface WebEnquiry extends WebEnquiryInput {
  id: number;
  status: "new" | "contacted" | "quoted" | "closed";
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

const SELECT_COLUMNS = `
  id, product_type, full_name, phone, email, company_name, business_address,
  details, status, admin_notes, created_at, updated_at
`;

function normalizeRow(row: any): WebEnquiry {
  let details: Record<string, unknown> = {};
  if (row.details && typeof row.details === "object") {
    details = row.details;
  } else if (typeof row.details === "string") {
    try { details = JSON.parse(row.details); } catch { details = {}; }
  }
  return {
    id: Number(row.id),
    productType: row.product_type,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    companyName: row.company_name ?? "",
    businessAddress: row.business_address ?? "",
    details,
    status: row.status,
    adminNotes: row.admin_notes ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// NOTE: this assumes `query()` returns the raw INSERT result (with an
// `insertId` field) when given an INSERT statement — the standard shape
// mysql2 returns, same assumption already made in admin-certificates.ts. If
// your `query()` helper behaves differently, this is the one line to adjust.
export async function createWebEnquiry(input: WebEnquiryInput): Promise<WebEnquiry> {
  const result: any = await query(
    `INSERT INTO web_enquires (product_type, full_name, phone, email, company_name, business_address, details)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      input.productType,
      input.fullName,
      input.phone,
      input.email,
      input.companyName || null,
      input.businessAddress || null,
      JSON.stringify(input.details),
    ]
  );

  const insertId = Array.isArray(result) ? result[0]?.insertId : result?.insertId;
  if (!insertId) {
    throw new Error("Insert succeeded but no insertId was returned — check query() helper's return shape.");
  }

  const created = await getWebEnquiryById(insertId);
  if (!created) throw new Error("Created enquiry but could not re-fetch it.");
  return created;
}

export async function getWebEnquiryById(id: number): Promise<WebEnquiry | null> {
  const rows = await query<any[]>(
    `SELECT ${SELECT_COLUMNS} FROM web_enquires WHERE id = ?`,
    [id]
  );
  return rows[0] ? normalizeRow(rows[0]) : null;
}

export async function listWebEnquiries(productType?: string): Promise<WebEnquiry[]> {
  const rows = productType
    ? await query<any[]>(
        `SELECT ${SELECT_COLUMNS} FROM web_enquires WHERE product_type = ? ORDER BY created_at DESC`,
        [productType]
      )
    : await query<any[]>(`SELECT ${SELECT_COLUMNS} FROM web_enquires ORDER BY created_at DESC`);
  return rows.map(normalizeRow);
}

const WEB_ENQUIRY_STATUSES = ["new", "contacted", "quoted", "closed"] as const;

export function isValidWebEnquiryStatus(value: unknown): value is WebEnquiry["status"] {
  return typeof value === "string" && (WEB_ENQUIRY_STATUSES as readonly string[]).includes(value);
}

export async function updateWebEnquiryStatus(
  id: number,
  status: WebEnquiry["status"]
): Promise<void> {
  await query(`UPDATE web_enquires SET status = ? WHERE id = ?`, [status, id]);
}