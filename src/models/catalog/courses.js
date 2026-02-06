import db from '../db.js';

/**
 * Get all courses from the database with optional sorting.
 * 
 * @param {string} sortBy - Sort option: 'department' (default), 'name', 'course_code'
 * @returns {Promise<Array>} Array of course objects with department information
 */
const getAllCourses = async (sortBy = 'department') => {
    /**
     * Build ORDER BY clause based on sortBy parameter.
     * When sorting by department, also sort by course_code within each department.
     */
    const orderByClause = sortBy === 'name' ? 'c.name' :
                          sortBy === 'course_code' ? 'c.course_code' :
                          'd.name, c.course_code';
    
    /**
     * JOIN with departments to get department name and code.
     * Using table aliases (c for courses, d for departments) keeps queries readable.
     */
    const query = `
        SELECT c.id, c.course_code, c.name, c.description, c.credit_hours, c.slug,
               d.name as department_name, d.code as department_code
        FROM courses c
        JOIN departments d ON c.department_id = d.id
        ORDER BY ${orderByClause}
    `;
    
    const result = await db.query(query);
    
    /**
     * Map database rows to JavaScript objects with camelCase property names.
     * This is standard practice for Node.js applications.
     */
    return result.rows.map(course => ({
        id: course.id,
        courseCode: course.course_code,
        name: course.name,
        description: course.description,
        creditHours: course.credit_hours,
        department: course.department_name,
        departmentCode: course.department_code,
        slug: course.slug
    }));
};

/**
 * Core function to get a single course by ID or slug.
 * Using one function with a parameter reduces code duplication.
 * 
 * @param {string|number} identifier - Course ID or slug
 * @param {string} identifierType - 'id' or 'slug' (default: 'id')
 * @returns {Promise<Object>} Course object with department info, or empty object if not found
 */
const getCourse = async (identifier, identifierType = 'id') => {
    // Dynamic WHERE clause - search by slug or id depending on identifierType
    const whereClause = identifierType === 'slug' ? 'c.slug = $1' : 'c.id = $1';
    
    const query = `
        SELECT c.id, c.course_code, c.name, c.description, c.credit_hours, c.slug,
               d.name as department_name, d.code as department_code
        FROM courses c
        JOIN departments d ON c.department_id = d.id
        WHERE ${whereClause}
    `;
    
    const result = await db.query(query, [identifier]);
    
    /**
     * Return empty object if course not found - this is a common pattern.
     * The calling code can check if the object is empty with Object.keys(result).length
     */
    if (result.rows.length === 0) return {};
    
    const course = result.rows[0];
    return {
        id: course.id,
        courseCode: course.course_code,
        name: course.name,
        description: course.description,
        creditHours: course.credit_hours,
        department: course.department_name,
        departmentCode: course.department_code,
        slug: course.slug
    };
};

/**
 * Get all courses in a specific department.
 * 
 * @param {number} departmentId - The ID of the department
 * @param {string} sortBy - Sort option: 'course_code' (default), 'name', 'department'
 * @returns {Promise<Array>} Array of course objects in the specified department
 */
const getCoursesByDepartment = async (departmentId, sortBy = 'course_code') => {
    const orderByClause = sortBy === 'name' ? 'c.name' :
                          sortBy === 'department' ? 'd.name, c.course_code' :
                          'c.course_code';
    
    const query = `
        SELECT c.id, c.course_code, c.name, c.description, c.credit_hours, c.slug,
               d.name as department_name, d.code as department_code
        FROM courses c
        JOIN departments d ON c.department_id = d.id
        WHERE c.department_id = $1
        ORDER BY ${orderByClause}
    `;
    
    const result = await db.query(query, [departmentId]);
    
    return result.rows.map(course => ({
        id: course.id,
        courseCode: course.course_code,
        name: course.name,
        description: course.description,
        creditHours: course.credit_hours,
        department: course.department_name,
        departmentCode: course.department_code,
        slug: course.slug
    }));
};

/**
 * Wrapper functions for backward compatibility and cleaner API.
 * Arrow functions work great for simple wrappers like this.
 */
const getCourseById = (courseId) => getCourse(courseId, 'id');
const getCourseBySlug = (courseSlug) => getCourse(courseSlug, 'slug');

export { getAllCourses, getCourseById, getCourseBySlug, getCoursesByDepartment };