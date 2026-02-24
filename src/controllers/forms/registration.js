import { Router } from 'express';
import bcrypt from 'bcrypt';
import { emailExists, saveUser, getAllUsers, getUserById, updateUser, deleteUser } from '../../models/forms/registration.js';
import { validationResult } from 'express-validator';

const router = Router();

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
    let users = [];
    try {
        users = await getAllUsers();
    } catch (error) {
        console.error('Error retrieving users:', error);
    }
    res.render('forms/registration/list', {
        title: 'Registered Users',
        users,
        user: req.session && req.session.user ? req.session.user : null
    });
};

/**
 * Display the edit account form
 * Users can edit their own account, admins can edit any account
 */
const showEditAccountForm = async (req, res) => {
    const targetUserId = parseInt(req.params.id);
    const currentUser = req.session.user;

    const targetUser = await getUserById(targetUserId);

    if (!targetUser) {
        req.flash('error', 'User not found.');
        return res.redirect('/register/list');
    }

    // Check permissions: users can edit themselves, admins can edit anyone
    const canEdit = currentUser.id === targetUserId || currentUser.email === 'admin@example.com';

    if (!canEdit) {
        req.flash('error', 'You do not have permission to edit this account.');
        return res.redirect('/register/list');
    }

    res.render('forms/registration/edit', {
        title: 'Edit Account',
        user: targetUser
    });
};

/**
 * Process account edit form submission
 */
const processEditAccount = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect(`/register/${req.params.id}/edit`);
    }

    const targetUserId = parseInt(req.params.id);
    const currentUser = req.session.user;
    const { name, email } = req.body;

    try {
        const targetUser = await getUserById(targetUserId);

        if (!targetUser) {
            req.flash('error', 'User not found.');
            return res.redirect('/register/list');
        }

        // Check permissions
        const canEdit = currentUser.id === targetUserId || currentUser.roleName === 'admin';

        if (!canEdit) {
            req.flash('error', 'You do not have permission to edit this account.');
            return res.redirect('/register/list');
        }

        // Check if new email already exists (and belongs to different user)
        const emailTaken = await emailExists(email);
        if (emailTaken && targetUser.email !== email) {
            req.flash('error', 'An account with this email already exists.');
            return res.redirect(`/register/${targetUserId}/edit`);
        }

        // Update the user
        await updateUser(targetUserId, name, email);

        // If user edited their own account, update session
        if (currentUser.id === targetUserId) {
            req.session.user.name = name;
            req.session.user.email = email;
        }

        req.flash('success', 'Account updated successfully.');
        res.redirect('/register/list');
    } catch (error) {
        console.error('Error updating account:', error);
        req.flash('error', 'An error occurred while updating the account.');
        res.redirect(`/register/${targetUserId}/edit`);
    }
};

/**
 * Process account deletion
 * Only admins can delete accounts, and they cannot delete themselves
 */
const processDeleteAccount = async (req, res) => {
    const targetUserId = parseInt(req.params.id);
    const currentUser = req.session.user;

    // Only admins can delete accounts
    if (currentUser.roleName !== 'admin') {
        req.flash('error', 'You do not have permission to delete accounts.');
        return res.redirect('/register/list');
    }

    // Prevent admins from deleting their own account
    if (currentUser.id === targetUserId) {
        req.flash('error', 'You cannot delete your own account.');
        return res.redirect('/register/list');
    }

    try {
        const deleted = await deleteUser(targetUserId);

        if (deleted) {
            req.flash('success', 'User account deleted successfully.');
        } else {
            req.flash('error', 'User not found or already deleted.');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        req.flash('error', 'An error occurred while deleting the account.');
    }

    res.redirect('/register/list');
};


export { 
    showRegistrationForm, 
    processRegistration, 
    showAllUsers,
    showEditAccountForm,
    processEditAccount,
    processDeleteAccount
};