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
        SELECT 
            users.id, 
            users.name, 
            users.email, 
            users.password,
            users.created_at,
            roles.role_name AS "roleName"
        FROM users
        LEFT JOIN roles ON users.role_id = roles.id
        WHERE LOWER(users.email) = LOWER($1)
        LIMIT 1
    `;
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
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