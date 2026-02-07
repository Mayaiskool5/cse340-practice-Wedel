import { Router } from 'express';

// Create a new router instance
const router = Router();
import { addDemoHeaders } from '../middleware/demo/headers.js';
import { catalogPage, courseDetailPage } from './catalog/catalog.js';
import { homePage, aboutPage, demoPage, testErrorPage } from './index.js';
import { facultyListPage, facultyDetailPage } from './faculty/faculty.js';

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


