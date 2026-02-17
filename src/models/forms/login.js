import bcrypt from 'bcrypt';
import db from '../db.js';

/**
 * Find a user by email address for login verification.
 * 
 * @param {string} email - Email address to search for
 * @returns {Promise<Object|null>} User object with password hash or null if not found
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT id, name, email, password
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
        `;
    
        try {
            const result = await db.query(query, [email]);
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error('Database error in findUserByEmail:', error);
            throw error;
        }
};

/**
 * Verify a plain text password against a stored bcrypt hash.
 * 
 * @param {string} plainPassword - The password to verify
 * @param {string} hashedPassword - The stored password hash
 * @returns {Promise<boolean>} True if password matches, false otherwise
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
        try {
            // bcrypt.compare returns a boolean
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            console.error('Bcrypt error in verifyPassword:', error);
            return false;
    }
};

export { findUserByEmail, verifyPassword };