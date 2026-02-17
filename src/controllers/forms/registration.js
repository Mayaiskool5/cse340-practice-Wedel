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
        .normalizeEmail()
        .custom((value, { req }) => {
            // Compare after both have been normalized
            if (value !== req.body.email) {
                throw new Error('Email addresses must match');
            }
            return true;
        })
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
        return res.render('forms/registration/form', { 
            title: 'User Registration',
            errors: errors.array(), // Pass errors to the UI
            formData: req.body        // Keep what the user typed so they don't have to restart
        });
    }

    // Extract validated data from request body
    const { name, email, password } = req.body;

    try {
        // Check if email already exists in database
        const exists = await emailExists(email);

        if (exists) {
            return res.render('forms/registration/form', { 
                title: 'User Registration',
                message: 'Email already registered.', // Custom message
                formData: req.body 
            });
        }

        // Hash the password before saving to database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user to database with hashed password
        console.log('Saving user:', { name, email });
        await saveUser(name, email, hashedPassword);
        console.log('User saved successfully:', name);

        console.log(`User ${name} registered successfully.`);
        res.redirect('/register/list');
        // NOTE: Later when we add authentication, we'll change this to require login first
    } catch (error) {
        res.render('forms/registration/form', { 
            title: 'User Registration',
            message: 'Server Error. Please try again.',
            formData: req.body 
        });
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