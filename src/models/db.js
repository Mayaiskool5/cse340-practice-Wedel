import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the CA certificate content
const caCert = fs.readFileSync(path.join(__dirname, '../../bin', 'byuicse-psql-cert.pem'));

/**
 * Connection pool for PostgreSQL database.
 *
 * A connection pool maintains a set of reusable database connections
 * to avoid the overhead of creating new connections for each request.
 * This improves performance and reduces load on the database server.
 *
 * Uses a connection string from environment variables for simplified setup.
 * The connection string format is:
 * postgresql://username:password@host:port/database
 */
const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: {
        ca: caCert,  // Use the certificate content, not the file path
        rejectUnauthorized: true,  // Keep this true for proper security
        checkServerIdentity: () => { return undefined; }  // Skip hostname verification but keep cert chain validation
    }
});

/**
 * Since we will modify the normal pool object in development mode, we need to create and
 * export a reference to the pool object. This allows us to use the same name for the
 * export regardless of whether we are in development or production mode.
 */
let db = null;

if (process.env.NODE_ENV.includes('dev') && process.env.ENABLE_SQL_LOGGING === 'true') {
    /**
     * In development mode, we wrap the pool to provide query logging.
     * This helps with debugging by showing all executed queries in the console.
     *
     * The wrapper also adds timing information to help identify slow queries
     * and tracks the number of rows affected by each query.
     */
    db = {
        async query(text, params) {
            try {
                const start = Date.now();
                const res = await pool.query(text, params);
                const duration = Date.now() - start;
                console.log('Executed query:', {
                    text: text.replace(/\s+/g, ' ').trim(),
                    duration: `${duration}ms`,
                    rows: res.rowCount
                });
                return res;
            } catch (error) {
                console.error('Error in query:', {
                    text: text.replace(/\s+/g, ' ').trim(),
                    error: error.message
                });
                throw error;
            }
        },

        async close() {
            await pool.end();
        }
    };
} else {
    // In production, export the pool directly without logging overhead
    db = pool;
}

export default db;
export { caCert };
