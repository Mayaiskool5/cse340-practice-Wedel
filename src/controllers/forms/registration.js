import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { emailExists, saveUser, getAllUsers } from '../../models/forms/registration.js';

const router = Router();

/**
 * Validation rules for user registration
 */
const registrationValidation = [
    // Name field: length range and character pattern
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    // Email field: normalization and maximum length
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email address is too long'),
    // Email Confirmation: Custom match check
    body('emailConfirm')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.email) {
                throw new Error('Email confirmation does not match email');
            }
            return true;
        }),
    // Password field: length range and complexity (0-9, a-z, A-Z, special)
    body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
        .withMessage('Password must contain at least one special character'),
    // Password Confirmation: Custom match check
    body('passwordConfirm')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password confirmation does not match password');
            }
            return true;
        })
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