// PATH: app/lib/customer-certificates.ts
//
// Stores what a logged-in customer did with an admin-authored certificate
// template — which template they started from, and their edits to whichever
// layers the admin marked editableByCustomer: true. The admin's original
// template (certificate_templates) is never modified by this.

import { query } from "@/app/lib/db";

export interface CertificateEdit {
  text?: string;
  imageSrc?: string;
}

export interface CustomerCertificate {
  id: number;
  user_id: number;
  template_id: number;
  edits: Record<string, CertificateEdit>; // keyed by layer id
  certificate_scale: number;
  created_at: string;
  updated_at: string;
}

function normalizeRow(row: any): CustomerCertificate {
  let edits: Record<string, CertificateEdit> = {};
  if (row.edits && typeof row.edits === "object" && !Array.isArray(row.edits)) {
    edits = row.edits;
  } else if (typeof row.edits === "string") {
    try {
      edits = JSON.parse(row.edits);
    } catch {
      edits = {};
    }
  }
  return {
    id: Number(row.id),
    user_id: Number(row.user_id),
    template_id: Number(row.template_id),
    edits,
    certificate_scale: Number(row.certificate_scale),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function saveCustomerCertificate(input: {
  userId: number;
  templateId: number;
  edits: Record<string, CertificateEdit>;
  certificateScale: number;
}): Promise<CustomerCertificate> {
  const result: any = await query(
    `INSERT INTO customer_certificates (user_id, template_id, edits, certificate_scale)
     VALUES (?, ?, ?, ?)`,
    [input.userId, input.templateId, JSON.stringify(input.edits), input.certificateScale]
  );

  const insertId = Array.isArray(result) ? result[0]?.insertId : result?.insertId;
  if (!insertId) {
    throw new Error("Insert succeeded but no insertId was returned — check query() helper's return shape.");
  }

  const rows = await query<any[]>(`SELECT * FROM customer_certificates WHERE id = ?`, [insertId]);
  return normalizeRow(rows[0]);
}

export async function getCustomerCertificatesForUser(userId: number): Promise<CustomerCertificate[]> {
  const rows = await query<any[]>(
    `SELECT * FROM customer_certificates WHERE user_id = ? ORDER BY updated_at DESC`,
    [userId]
  );
  return rows.map(normalizeRow);
}

export async function getCustomerCertificateById(id: number, userId: number): Promise<CustomerCertificate | null> {
  const rows = await query<any[]>(
    `SELECT * FROM customer_certificates WHERE id = ? AND user_id = ?`,
    [id, userId]
  );
  return rows[0] ? normalizeRow(rows[0]) : null;
}