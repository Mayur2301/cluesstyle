// PATH: app/lib/contact-messages.ts
//
// Data access for messages submitted through the /contact-us form
// (app/api/contact/route.ts inserts into this table). Depends on the
// `web_contact_messages` table — create it on your database before using
// anything here:
//
//   CREATE TABLE IF NOT EXISTS web_contact_messages (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     name VARCHAR(255) NOT NULL,
//     email VARCHAR(255) NOT NULL,
//     phone VARCHAR(50),
//     subject VARCHAR(255) NOT NULL,
//     message TEXT NOT NULL,
//     service_interest VARCHAR(100),
//     budget_range VARCHAR(100),
//     heard_from VARCHAR(100),
//     status ENUM('unread', 'read', 'replied', 'archived') NOT NULL DEFAULT 'unread',
//     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
//   );

import { query } from "@/app/lib/db";

const CONTACT_MESSAGE_STATUSES = ["unread", "read", "replied", "archived"] as const;
export type ContactMessageStatus = (typeof CONTACT_MESSAGE_STATUSES)[number];

export function isValidContactMessageStatus(value: unknown): value is ContactMessageStatus {
  return typeof value === "string" && (CONTACT_MESSAGE_STATUSES as readonly string[]).includes(value);
}

export interface ContactMessageRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  service_interest: string | null;
  budget_range: string | null;
  heard_from: string | null;
  status: ContactMessageStatus;
  created_at: string;
}

export async function listContactMessages(limit = 100): Promise<ContactMessageRow[]> {
  // Same reasoning as listReturnRequests(): mysql2's execute() (prepared
  // statements) rejects a placeholder in the LIMIT clause on some
  // MySQL/MariaDB builds, so it's inlined as a validated plain integer
  // instead of bound as `?`.
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 100;
  return query<ContactMessageRow[]>(
    `SELECT * FROM web_contact_messages ORDER BY created_at DESC LIMIT ${safeLimit}`
  );
}

export async function getContactMessageById(id: number): Promise<ContactMessageRow | null> {
  const rows = await query<ContactMessageRow[]>(
    `SELECT * FROM web_contact_messages WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function countUnreadContactMessages(): Promise<number> {
  const rows = await query<{ total: number }[]>(
    `SELECT COUNT(*) as total FROM web_contact_messages WHERE status = 'unread'`
  );
  return rows[0]?.total ?? 0;
}

export async function updateContactMessageStatus(
  id: number,
  status: ContactMessageStatus
): Promise<void> {
  await query(`UPDATE web_contact_messages SET status = ? WHERE id = ?`, [status, id]);
}