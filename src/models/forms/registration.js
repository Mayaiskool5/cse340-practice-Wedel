import db from '../db.js';

/**
 * Checks if an email address is already registered in the database.
 * 
 * @param {string} email - The email address to check
 * @returns {Promise<boolean>} True if email exists, false otherwise
 */
const emailExists = async (email) => {
    try {
        const sql = 'SELECT * FROM users WHERE email = $1';
        const res = await db.query(sql, [email]); // node-postgres uses $1, $2 for placeholders
        return res.rows.length > 0;
    } catch (err) {
        console.error("Database error:", err.message);
        throw err;
    }
};

/**
 * Saves a new user to the database with a hashed password.
 * 
 * @param {string} name - The user's full name
 * @param {string} email - The user's email address
 * @param {string} hashedPassword - The bcrypt-hashed password
 * @returns {Promise<Object>} The newly created user record (without password)
 */
const saveUser = async (name, email, hashedPassword) => {
    try {
        // RETURNING id is required in Postgres to get the new ID back
        const sql = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id';
        const res = await db.query(sql, [name, email, hashedPassword]);
        return res.rows[0].id;
    } catch (err) {
        console.error("Error saving user:", err.message);
        throw err;
    }
};

/**
 * Retrieves all registered users from the database.
 * 
 * @returns {Promise<Array>} Array of user records (without passwords)
 */
const getAllUsers = async () => {
    try {
        const sql = 'SELECT id, name, email FROM users ORDER BY id DESC';
        const res = await db.query(sql);
        return res.rows; // node-postgres returns results in the .rows property
    } catch (err) {
        console.error("Error fetching users:", err.message);
        throw err;
    }
};

export { emailExists, saveUser, getAllUsers };