import { Router } from 'express';
import { addDemoHeaders } from '../middleware/demo/headers.js';
import { catalogPage, courseDetailPage } from './catalog/catalog.js';
import { homePage, aboutPage, demoPage, testErrorPage } from './index.js';

// Create a new router instance
const router = Router();

// TODO: Add import statements for controllers and middleware
// TODO: Add route definitions
// Home and basic pages
router.get('/', homePage);
router.get('/about', aboutPage);

// Faculty Routes
router.get('/faculty', facultyController.facultyListPage);
router.get('/faculty/:facultyId', facultyController.facultyDetailPage);

// Course catalog routes
router.get('/catalog', catalogPage);
router.get('/catalog/:courseId', courseDetailPage);

// Demo page with special middleware
router.get('/demo', addDemoHeaders, demoPage);

// Route to trigger a test error
router.get('/test-error', testErrorPage);

export default router;