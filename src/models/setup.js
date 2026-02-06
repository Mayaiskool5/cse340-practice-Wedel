import db from './db.js';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Sets up the database by running the seed.sql file if needed.
 * Checks if faculty table has data - if not, runs a full re-seed.
 */
const setupDatabase = async () => {
    /**
     * Check if faculty table has any rows and wrap in try-catch to handle cases
     * where table doesn't exist yet.
     */
    let hasData = false;
    try {
        const result = await db.query(
            "SELECT EXISTS (SELECT 1 FROM faculty LIMIT 1) as has_data"
        );
        hasData = result.rows[0]?.has_data || false;
    } catch (error) {
        /**
         * If query fails (e.g., table doesn't exist), treat the same as no data.
         * This allows the seed process to proceed.
         */
        hasData = false;
    }
    
    if (hasData) {
        console.log('Database already seeded');
        return true;
    }
    
    // No faculty found - run full seed
    console.log('Seeding database...');
    const seedPath = join(__dirname, 'sql', 'seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    await db.query(seedSQL);
    console.log('Database seeded successfully');
    
    return true;
};

/**
 * Tests the database connection by executing a simple query.
 */
const testConnection = async () => {
    const result = await db.query('SELECT NOW() as current_time');
    console.log('Database connection successful:', result.rows[0].current_time);
    return true;
};

export { setupDatabase, testConnection };