import { Router } from 'express';
import { validationResult } from 'express-validator';
import { createContactForm, getAllContactForms } from '../../models/forms/contact.js';

const router = Router();

/**
 * Display the contact form page.
 */
const showContactForm = (req, res) => {
    res.render('forms/contact/form', {
        title: 'Contact Us'
    });
};

/**
 * Handle contact form submission with validation.
 * If validation passes, save to database and redirect.
 * If validation fails, log errors and redirect back to form.
 */
const handleContactSubmission = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Store each validation error as a separate flash message
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        // Redirect back to form without saving
        return res.redirect('/contact');
    }

    try {
        // Extract validated data
        const { subject, message } = req.body;
        // Save to database
        await createContactForm(subject, message);
        // After successfully saving to the database
        req.flash('success', 'Thank you for contacting us! We will respond soon.');
        res.redirect('/contact');
    } catch (error) {
        console.error('Error saving contact form:', error);
        req.flash('error', 'Unable to submit your message. Please try again later.');
        res.redirect('/contact');
    }
};

/**
 * Display all contact form submissions.
 */
const showContactResponses = async (req, res) => {
    let contactForms = [];

    try {
        contactForms = await getAllContactForms();
    } catch (error) {
        console.error('Error retrieving contact forms:', error);
    }

    res.render('forms/contact/responses', {
        title: 'Contact Form Submissions',
        contactForms
    });
};

/**
 * GET /contact - Display the contact form
 */
router.get('/', showContactForm);

/**
 * GET /contact/responses - Display all contact form submissions
 */
router.get('/responses', showContactResponses);

// Export router as default, and specific functions for root-level routes
export { showContactForm, showContactResponses, handleContactSubmission };
export default router;