import { getAllCourses, getCourseById, getSortedSections } from '../../models/catalog/catalog.js';

// Route handler for the course catalog list page
const catalogPage = (req, res) => {
    const courses = getAllCourses();

    res.render('catalog', {
        title: 'Course Catalog',
        courses: courses
    });
};

// Route handler for individual course detail pages
const courseDetailPage = (req, res, next) => {
    const courseId = req.params.courseId;
    const course = getCourseById(courseId);

    // If course doesn't exist, create 404 error
    if (!course) {
        const err = new Error(`Course ${courseId} not found`);
        err.status = 404;
        return next(err);
    }

    // Handle sorting if requested
    const sortByTime = req.query.sort || 'time';
    const sortedSections = getSortedSections(course.sections, sortByTime);
    const sortByProfessor = req.query.sort || 'professor';
    const sortedSectionsByProfessor = getSortedSections(course.sections, sortByProfessor);
    res.render('course-detail', {
        title: `${course.id} - ${course.title}`,
        course: { ...course, sections: sortedSections },
        currentSort: sortByTime,
        currentSortByProfessor: sortByProfessor
    });
};

export { catalogPage, courseDetailPage };