// PATH: app/lib/admin-heatmap.ts
// Query helpers for the admin Heatmap page — reads click_events, the table
// app/api/track-click/route.ts now inserts into (see click-events-migration.sql).
import { query } from "@/app/lib/db";

export interface PageClickSummary {
  page: string;
  clicks: number;
  last_click: string;
}

export interface ClickPoint {
  x: number;
  y: number;
  viewport_width: number | null;
  viewport_height: number | null;
}

export interface TopElement {
  href: string | null;
  click_text: string | null;
  clicks: number;
}

export interface HeatmapFilterState {
  page: string | null;
  from: string | null;
  to: string | null;
}

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(new Date(value).getTime());
}

export function parseHeatmapFilters(raw: { page?: string; from?: string; to?: string }): HeatmapFilterState {
  return {
    page: raw.page && raw.page.trim() ? raw.page.trim() : null,
    from: raw.from && isValidDate(raw.from) ? raw.from : null,
    to: raw.to && isValidDate(raw.to) ? raw.to : null,
  };
}

export function heatmapFiltersToQueryString(
  filters: HeatmapFilterState,
  extra?: Record<string, string | number | undefined>
): string {
  const parts: string[] = [];
  if (filters.page) parts.push(`page=${encodeURIComponent(filters.page)}`);
  if (filters.from) parts.push(`from=${filters.from}`);
  if (filters.to) parts.push(`to=${filters.to}`);
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v !== undefined && v !== "") parts.push(`${k}=${encodeURIComponent(String(v))}`);
    }
  }
  return parts.join("&");
}

function dateWhere(filters: HeatmapFilterState): { sql: string; params: any[] } {
  const clauses: string[] = [];
  const params: any[] = [];
  if (filters.from) {
    clauses.push("DATE(server_time) >= ?");
    params.push(filters.from);
  }
  if (filters.to) {
    clauses.push("DATE(server_time) <= ?");
    params.push(filters.to);
  }
  return { sql: clauses.length ? `AND ${clauses.join(" AND ")}` : "", params };
}

export async function getTrackedPages(filters: HeatmapFilterState): Promise<PageClickSummary[]> {
  const { sql, params } = dateWhere(filters);
  return query<PageClickSummary[]>(
    `SELECT page, COUNT(*) AS clicks, MAX(server_time) AS last_click
     FROM click_events
     WHERE 1 = 1 ${sql}
     GROUP BY page
     ORDER BY clicks DESC
     LIMIT 200`,
    params
  );
}

// Only rows with a known viewport can be normalized into a % position for
// the heatmap canvas (legacy clicks.log imports won't have one — see
// scripts/import-clicks-log.mjs). Capped at 5000 most-recent points so the
// canvas stays fast even on a high-traffic page.
export async function getClickPoints(page: string, filters: HeatmapFilterState): Promise<ClickPoint[]> {
  const { sql, params } = dateWhere(filters);
  return query<ClickPoint[]>(
    `SELECT x, y, viewport_width, viewport_height
     FROM click_events
     WHERE page = ? AND viewport_width IS NOT NULL AND viewport_height IS NOT NULL ${sql}
     ORDER BY server_time DESC
     LIMIT 5000`,
    [page, ...params]
  );
}

export async function getTopElements(page: string, filters: HeatmapFilterState): Promise<TopElement[]> {
  const { sql, params } = dateWhere(filters);
  return query<TopElement[]>(
    `SELECT href, click_text, COUNT(*) AS clicks
     FROM click_events
     WHERE page = ? ${sql}
     GROUP BY href, click_text
     ORDER BY clicks DESC
     LIMIT 15`,
    [page, ...params]
  );
}

export async function getHeatmapTotals(
  filters: HeatmapFilterState
): Promise<{ totalClicks: number; totalPages: number; topPage: string | null }> {
  const { sql, params } = dateWhere(filters);
  const [totals, topPageRows] = await Promise.all([
    query<{ totalClicks: number; totalPages: number }[]>(
      `SELECT COUNT(*) AS totalClicks, COUNT(DISTINCT page) AS totalPages FROM click_events WHERE 1 = 1 ${sql}`,
      params
    ),
    query<{ page: string }[]>(
      `SELECT page FROM click_events WHERE 1 = 1 ${sql} GROUP BY page ORDER BY COUNT(*) DESC LIMIT 1`,
      params
    ),
  ]);
  return {
    totalClicks: Number(totals[0]?.totalClicks ?? 0),
    totalPages: Number(totals[0]?.totalPages ?? 0),
    topPage: topPageRows[0]?.page ?? null,
  };
}