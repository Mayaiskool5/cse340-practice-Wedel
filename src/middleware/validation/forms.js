import { body } from 'express-validator';

/**
 * Validation rules for login form
 */
const loginValidation = [
    // Email field: basic validation + length safety
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email address is too long'),
    // Password field: basic presence + length safety
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
];


/**
 * Validation rules for user registration
 */
const registrationValidation = [
    // Name field: length range and character pattern
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z0-9\s'-]+$/)
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
 * POST /contact - Handle contact form submission with validation
 */
const contactValidation = [
        body('subject')
            .trim()
            .isLength({ min: 2, max: 255 })
            .withMessage('Subject must be between 2 and 255 characters')
            .matches(/^[a-zA-Z0-9\s\-.,!?]+$/)
            .withMessage('Subject contains invalid characters'),
        body('message')
            .trim()
            .isLength({ min: 10, max: 2000 })
            .withMessage('Message must be between 10 and 2000 characters')
            .custom((value) => {
                // Check for spam patterns (excessive repetition)
                const words = value.split(/\s+/);
                const uniqueWords = new Set(words);
                if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
                    throw new Error('Message appears to be spam');
                }
                return true;
            })
];

/**
 * Validation rules for editing user accounts
 */
const editValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z0-9\s'-]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address')
        .isLength({ max: 255 })
        .withMessage('Email address is too long')
];

export {
    loginValidation, 
    registrationValidation, 
    editValidation,
    contactValidation
};