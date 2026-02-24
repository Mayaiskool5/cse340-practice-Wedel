import { validationResult } from 'express-validator';
import { findUserByEmail, verifyPassword } from '../../models/forms/login.js';
import { Router } from 'express';

const router = Router();

/**
 * Display the login form.
 */
const showLoginForm = (req, res) => {
    // Retrieve error messages from session (if any)
    const error = req.flash('error'); 
    const success = req.flash('success');
    // Clear the error after displaying
    delete req.session.loginError;
    res.render('forms/login/form', { 
        title: 'User Login', 
        error: error.length > 0 ? error[0] : null, // Get the first message
        success: success.length > 0 ? success[0] : null 
    });
};

/**
 * Process login form submission.
 */
const processLogin = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Validation errors: loop and create flash messages
        req.flash('error', errors.array()[0].msg);
        return res.redirect('/login');
    }

    // Extract email and password from req.body
    const { email, password } = req.body;

    try {
        // Find user by email using findUserByEmail()
        const user = await findUserByEmail(email);

        if (!user) {
            // User not found: Generic error for security
            console.log(`Login failed: No user found for ${email}`);
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }

        const isMatch = await verifyPassword(password, user.password);

        if (!isMatch) {
            // Invalid password: Generic error for security
            console.log(`Login failed: Password mismatch for ${email}`);
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }

        // SECURITY: Remove password from user object before storing in session
        delete user.password;

        // Store user
        req.session.user = user;

        // Successful login: Personalized welcome message
        const displayName = user.account_firstname || user.name || "User";
        req.flash('success', `Welcome back, ${displayName}!`);

        // Save the session before redirecting
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                req.flash('error', 'Session error. Please try again.');
                return res.redirect('/login');
            }
            res.redirect('/dashboard');
        });

    } catch (error) {
        // Catch block errors: Server logging and feedback
        console.error('Login processing error:', error);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.redirect('/login');
    }
};

/**
 * Handle user logout.
 * 
 * NOTE: connect.sid is the default session cookie name since we did not
 * specify a custom name when creating the session in server.js.
 */
const processLogout = (req, res) => {
    // First, check if there is a session object on the request
    if (!req.session) {
        // If no session exists, there's nothing to destroy,
        // so we just redirect the user back to the home page
        return res.redirect('/');
    }

    // Call destroy() to remove this session from the store (PostgreSQL in our case)
    req.session.destroy((err) => {
        if (err) {
            // If something goes wrong while removing the session from the database:
            console.error('Error destroying session:', err);

            /**
             * Clear the session cookie from the browser.
             */
            res.clearCookie('connect.sid');

            /** 
             * Normally we would respond with a 500 error since logout did not fully succeed.
             * Example: return res.status(500).send('Error logging out');
             * 
             * Since this is a practice site, we will redirect to the home page anyway.
             */
            return res.redirect('/');
        }

        // If session destruction succeeded, clear the session cookie from the browser
        res.clearCookie('connect.sid');

        // Redirect the user to the home page
        res.redirect('/');
    });
};

/**
 * Display protected dashboard (requires login).
 */
const showDashboard = (req, res) => {
    const user = req.session.user;
    const sessionData = req.session;

    // Security check! Ensure user and sessionData do not contain password field
    if (user && user.password) {
        console.error('Security error: password found in user object');
        delete user.password;
    }
    if (sessionData.user && sessionData.user.password) {
        console.error('Security error: password found in sessionData.user');
        delete sessionData.user.password;
    }

    res.render('dashboard', {
        title: 'Dashboard',
        user,
        sessionData
    });
};

// Routes
router.get('/', showLoginForm);
router.post('/', processLogin);

// Export router as default, and specific functions for root-level routes
export default router;
export { processLogin, processLogout, showDashboard };