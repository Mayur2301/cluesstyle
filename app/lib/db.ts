// PATH: app/lib/db.ts
import mysql from "mysql2/promise";

/**
 * Shared MySQL connection pool.
 * Created once and reused across requests.
 *
 * IMPORTANT (why this isn't just a module-level `let`):
 * In Next.js dev mode, hot-reloading recompiles and re-evaluates route
 * modules on nearly every save. A plain `let pool` living only in this
 * module's closure gets reset to a fresh, empty variable each time this
 * file is re-evaluated — so `getPool()` would think no pool exists yet and
 * call `mysql.createPool()` again, opening ANOTHER real set of connections
 * to MySQL on top of the ones from every previous reload. Nothing ever
 * closes the old pool's connections, so over a dev session they pile up
 * past MySQL's `max_connections` limit and every query starts failing with
 * "Too many connections" (ER_CON_COUNT_ERROR) — even though the app code
 * never changed.
 *
 * The fix is the same one Prisma/most DB clients use: stash the pool on
 * Node's `global` object instead of a module-local variable. `global`
 * survives HMR module re-evaluation (it's the same JS runtime, only the
 * module registry gets swapped), so the pool — and its connections — are
 * genuinely created once per running dev-server process, not once per save.
 * In production (no HMR, one process per instance) this behaves identically
 * to the old code.
 */

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: mysql.Pool | undefined;
}

export function getPool(): mysql.Pool {
  if (!global.__mysqlPool) {
    global.__mysqlPool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      // Keep this comfortably under MySQL's max_connections (check with
      // `SHOW VARIABLES LIKE 'max_connections';`) — remember Next.js may
      // also run more than one server process (e.g. multiple `next start`
      // instances behind a load balancer, or a serverless deployment where
      // each function instance gets its own pool), and each one opens up
      // to `connectionLimit` connections of its own.
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  return global.__mysqlPool;
}

/**
 * Generic typed query helper.
 */
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T> {
  try {
    const [rows] = await getPool().execute(sql, params);
    return rows as T;
  } catch (error) {
    console.error("Database Query Error:", error);
    throw error;
  }
}

/**
 * Default pool export.
 *
 * This top-level call runs the instant this module is first evaluated —
 * including on every HMR reload in dev, same as before. That was fine on
 * its own; the actual bug was that `getPool()` used to check a
 * module-local `let pool`, which HMR resets to empty on each reload, so
 * this line ended up calling `mysql.createPool()` again every time. Now
 * that `getPool()` checks `global.__mysqlPool` instead (see above), calling
 * it here on every reload is harmless — it finds the existing pool already
 * sitting on `global` and just returns it, exactly once creating real
 * connections per dev-server process.
 */
export default getPool();