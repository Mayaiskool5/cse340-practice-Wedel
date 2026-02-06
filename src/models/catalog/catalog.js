import db from '../db.js';

/**
 * Core function that gets all sections (course offerings) for a specific course.
 * Works with either course ID or slug - this pattern reduces code duplication.
 * 
 * @param {string|number} identifier - Course ID or slug
 * @param {string} identifierType - 'id' or 'slug' (default: 'slug')
 * @param {string} sortBy - Sort option: 'time', 'room', or 'professor' (default: 'time')
 * @returns {Promise<Array>} Array of section objects with course, faculty, and department info
 */
const getSectionsByCourse = async (identifier, identifierType = 'slug', sortBy = 'time') => {
    // Build WHERE clause dynamically based on whether we're searching by ID or slug
    // Using $1 prevents SQL injection - never concatenate user input into SQL!
    const whereClause = identifierType === 'id' ? 'c.id = $1' : 'c.slug = $1';
    
    /**
     * Let PostgreSQL do the sorting - it's faster than sorting in JavaScript.
     * SUBSTRING with regex extracts the hour from time strings like "Mon Wed Fri 8:00-8:50".
     * The ::INTEGER cast converts the extracted string to a number for proper sorting.
     */
    const orderByClause = sortBy === 'room' ? 'cat.room' : 
                          sortBy === 'professor' ? 'f.last_name, f.first_name' :
                          "SUBSTRING(cat.time FROM '(\\d{1,2}):(\\d{2})')::INTEGER";
    
    /**
     * Join catalog with courses, faculty, and departments to get complete information.
     * Note: We're using template literals for ORDER BY because PostgreSQL doesn't allow
     * parameterized ORDER BY clauses. The values are whitelisted above, so this is safe.
     */
    const query = `
        SELECT cat.id, cat.time, cat.room, 
               c.course_code, c.name as course_name, c.description, c.credit_hours,
               f.first_name, f.last_name, f.slug as faculty_slug, f.title as faculty_title,
               d.name as department_name, d.code as department_code
        FROM catalog cat
        JOIN courses c ON cat.course_slug = c.slug
        JOIN faculty f ON cat.faculty_slug = f.slug
        JOIN departments d ON c.department_id = d.id
        WHERE ${whereClause}
        ORDER BY ${orderByClause}
    `;
    
    const result = await db.query(query, [identifier]);
    
    /**
     * Transform database column names (snake_case) to JavaScript convention (camelCase).
     * This is a common pattern when working with databases in JavaScript.
     */
    return result.rows.map(section => ({
        id: section.id,
        time: section.time,
        room: section.room,
        courseCode: section.course_code,
        courseName: section.course_name,
        description: section.description,
        creditHours: section.credit_hours,
        professor: `${section.first_name} ${section.last_name}`,
        professorSlug: section.faculty_slug,
        professorTitle: section.faculty_title,
        department: section.department_name,
        departmentCode: section.department_code
    }));
};

/**
 * Core function that gets all courses taught by a specific faculty member.
 * Similar pattern to getSectionsByCourse - same logic, different perspective.
 * 
 * @param {string|number} identifier - Faculty ID or slug
 * @param {string} identifierType - 'id' or 'slug' (default: 'slug')
 * @param {string} sortBy - Sort option: 'time', 'room', or 'course' (default: 'time')
 * @returns {Promise<Array>} Array of section objects with course, faculty, and department info
 */
const getCoursesByFaculty = async (identifier, identifierType = 'slug', sortBy = 'time') => {
    // Search by faculty ID or faculty slug
    const whereClause = identifierType === 'id' ? 'f.id = $1' : 'f.slug = $1';
    
    // Different sorting options - by time, room, or course code
    const orderByClause = sortBy === 'room' ? 'cat.room' : 
                          sortBy === 'course' ? 'c.course_code' :
                          "SUBSTRING(cat.time FROM '(\\d{1,2}):(\\d{2})')::INTEGER";
    
    // Same JOIN pattern - catalog connects courses to faculty
    const query = `
        SELECT cat.id, cat.time, cat.room, 
               c.course_code, c.name as course_name, c.description, c.credit_hours,
               f.first_name, f.last_name, f.slug as faculty_slug, f.title as faculty_title,
               d.name as department_name, d.code as department_code
        FROM catalog cat
        JOIN courses c ON cat.course_slug = c.slug
        JOIN faculty f ON cat.faculty_slug = f.slug
        JOIN departments d ON c.department_id = d.id
        WHERE ${whereClause}
        ORDER BY ${orderByClause}
    `;
    
    const result = await db.query(query, [identifier]);
    
    return result.rows.map(section => ({
        id: section.id,
        time: section.time,
        room: section.room,
        courseCode: section.course_code,
        courseName: section.course_name,
        description: section.description,
        creditHours: section.credit_hours,
        professor: `${section.first_name} ${section.last_name}`,
        professorSlug: section.faculty_slug,
        professorTitle: section.faculty_title,
        department: section.department_name,
        departmentCode: section.department_code
    }));
};

/**
 * Wrapper functions maintain backward compatibility with existing code.
 * These let us keep the same API while using consolidated core functions internally.
 * Example: getSectionsByCourseId(5) calls getSectionsByCourse(5, 'id')
 */
const getSectionsByCourseId = (courseId, sortBy = 'time') => 
    getSectionsByCourse(courseId, 'id', sortBy);

const getSectionsByCourseSlug = (courseSlug, sortBy = 'time') => 
    getSectionsByCourse(courseSlug, 'slug', sortBy);

const getCoursesByFacultyId = (facultyId, sortBy = 'time') => 
    getCoursesByFaculty(facultyId, 'id', sortBy);

const getCoursesByFacultySlug = (facultySlug, sortBy = 'time') => 
    getCoursesByFaculty(facultySlug, 'slug', sortBy);

export { 
    getSectionsByCourseId,
    getSectionsByCourseSlug,
    getCoursesByFacultyId,
    getCoursesByFacultySlug
};