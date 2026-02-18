import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { emailExists, saveUser, getAllUsers } from '../../models/forms/registration.js';

const router = Router();

/**
 * Validation rules for user registration
 */
const registrationValidation = [
    body('name')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address'),
    body('emailConfirm')
        .trim()
        .custom((value, { req }) => value === req.body.email)
        .normalizeEmail()
        .withMessage('Email addresses must match'),
    body('password')
        .isLength({ min: 8 })
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*]/)
        .withMessage('Password must contain at least one special character'),
    body('passwordConfirm')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords must match')
];

/**
 * Display the registration form page.
 */
const showRegistrationForm = (req, res) => {
    res.render('forms/registration/form', { title: 'User Registration'});
};

/**
 * Handle user registration with validation and password hashing.
 */
const processRegistration = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Validation errors: Loop through errors and create flash messages
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect('/register'); // Redirect back to form to see flashes        
    }

    // Extract validated data from request body
    const { name, email, password } = req.body;

    try {
        // Check if email already exists in database
        const exists = await emailExists(email);

        if (exists) {
            // Duplicate email check: Use warning flash
            req.flash('warning', 'An account with this email already exists. Please log in.');
            return res.redirect('/login'); // Redirecting to login as requested
        }

        // Hash the password before saving to database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user to database with hashed password
        await saveUser(name, email, hashedPassword);

        // Successful registration: Use success flash and redirect to /login
        req.flash('success', 'Registration successful! You can now log in.');
        res.redirect('/login');

    } catch (error) {
        // Catch block errors: Server logging and error flash
        console.error('Registration Error:', error);
        req.flash('error', 'A server error occurred. Please try again.');
        res.redirect('/register');
    }
};

/**
 * Display all registered users.
 */
const showAllUsers = async (req, res) => {
    // Initialize users as empty array
    let users = [];

    try {
        console.log('Fetching all users...');
        users = await getAllUsers();
        console.log('Users fetched:', users.length, 'users found');
    } catch (error) {
        console.error('Fetch Users Error:', error);
        // users remains empty array on error
    }

    console.log('Rendering list with users:', users);
    res.render('forms/registration/list', {
        title: 'Registered Users',
        users
    });
};

/**
 * GET /register - Display the registration form
 */
router.get('/', showRegistrationForm);

/**
 * POST /register - Handle registration form submission with validation
 */
router.post('/', registrationValidation, processRegistration);

/**
 * GET /register/list - Display all registered users
 */
router.get('/list', showAllUsers);

export default router;