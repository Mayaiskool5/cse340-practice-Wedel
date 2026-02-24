// Create a new router instance
import { addDemoHeaders } from '../middleware/demo/headers.js';
import { catalogPage, courseDetailPage } from './catalog/catalog.js';
import { homePage, aboutPage, demoPage, testErrorPage } from './index.js';
import { facultyListPage, facultyDetailPage } from './faculty/faculty.js';
import contactRoutes, { handleContactSubmission } from './forms/contact.js';
import loginRoutes, { processLogin, processLogout, showDashboard } from './forms/login.js';
import { requireLogin } from '../middleware/auth.js';
import { 
    showRegistrationForm, 
    processRegistration, 
    showAllUsers, 
    showEditAccountForm, 
    processEditAccount, 
    processDeleteAccount 
} from './forms/registration.js';

import { Router } from 'express';

// Import Validation Rules from Middleware
import { 
    loginValidation, 
    registrationValidation, 
    editValidation,
    contactValidation 
} from '../middleware/validation/forms.js';

const router = Router();

// Add catalog-specific styles to all catalog routes
router.use('/catalog', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/catalog.css">');
    next();
});

// Add contact-specific styles to all contact routes
router.use('/contact', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/contact.css">');
    next();
});

// Add catalog-specific styles to all catalog routes
router.use('/faculty', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/faculty.css">');
    next();
});

// Define the POST handler specifically for /contact with validation first
router.post('/contact', contactValidation, handleContactSubmission);

// Contact form routes
router.use('/contact', contactRoutes);

router.use('/register', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/registration.css">');
    next();
});

// 2. GET the form
router.get('/register', showRegistrationForm);

// 3. POST the form (Validation + Handler)
router.post('/register', registrationValidation, processRegistration);

// 4. User List
router.get('/register/list', requireLogin, showAllUsers);

// 5. Edit Account (GET and POST)
router.get('/register/:id/edit', requireLogin, showEditAccountForm);
router.post('/register/:id/edit', requireLogin, editValidation, processEditAccount);

// 6. Delete Account
router.post('/register/:id/delete', requireLogin, processDeleteAccount);

// Add login-specific styles to all login routes
router.use('/login', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/login.css">');
    next();
});

// Login routes (form and submission)
router.use('/login', loginRoutes, loginValidation, processLogin);

// Validation rules for registration form
router.use('/register', editValidation);

// Authentication-related routes at root level
router.get('/logout', processLogout);
router.get('/dashboard', requireLogin, showDashboard);

// Home and basic pages
router.get('/', homePage);
router.get('/about', aboutPage);

// Course catalog routes
router.get('/catalog', catalogPage);
router.get('/courses/:slugId', courseDetailPage);

// Demo page with special middleware
router.get('/demo', addDemoHeaders, demoPage);

// Faculty directory routes
router.get('/faculty', facultyListPage);
router.get('/faculty/:facultySlug', facultyDetailPage);

// Route to trigger a test error
router.get('/test-error', testErrorPage);


export default router;


