import { getAllCourses, getCourseById, getSortedSections } from '../../models/catalog/catalog.js';

// Route handler for the course catalog list page
const catalogPage = async (req, res) => {
    const courses = await getAllCourses();

    res.render('catalog', {
        title: 'Course Catalog',
        courses: courses
    });
};

// Route handler for individual course detail pages
const courseDetailPage = async (req, res, next) => {
    const courseId = req.params.courseId;
    const course = await getCourseById(courseId);

    // // If course doesn't exist, create 404 error
    // if (!course) {
    //     const err = new Error(`Course ${courseId} not found`);
    //     err.status = 404;
    //     return next(err);
    // }

    // // Handle sorting if requested
    // const sortByTime = req.query.sort || 'time';
    // const sortedSections = getSortedSections(course.sections, sortByTime);
    // const sortByProfessor = req.query.sort || 'professor';
    // const sortedSectionsByProfessor = getSortedSections(course.sections, sortByProfessor);
    // res.render('course-detail', {
    //     title: `${course.id} - ${course.title}`,
    //     course: { ...course, sections: sortedSections },
    //     currentSort: sortByTime,
    //     currentSortByProfessor: sortByProfessor
    // });

    // Our model returns empty object {} when not found, not null
    // Check if the object is empty using Object.keys()
    if (Object.keys(course).length === 0) {
        const err = new Error(`Course ${courseId} not found`);
        err.status = 404;
        return next(err);
    }
    
    // Get sections (course offerings) separately from the catalog
    // Pass the sortBy parameter directly to the model - PostgreSQL handles the sorting
    const sortBy = req.query.sort || 'time';
    const sections = await getSectionsByCourseId(courseId, sortBy);
    
    res.render('course-detail', {
        title: `${course.courseCode} - ${course.name}`,
        course: course,
        sections: sections,
        currentSort: sortBy
    });
};

export { catalogPage, courseDetailPage };