import { getFacultyById, getSortedFaculty } from '../../models/faculty/faculty.js';

export const facultyListPage = (req, res) => {
    const sortBy = req.query.sort || 'department';
    const facultyList = getSortedFaculty(sortBy);
    res.render('faculty/list', { 
        title: 'Faculty Directory', 
        facultyList 
    });
};

export const facultyDetailPage = (req, res) => {
    const facultyMember = getFacultyById(req.params.facultyId);
    
    if (!facultyMember) {
        return res.status(404).send('Faculty member not found');
    }

    res.render('faculty/detail', { 
        title: facultyMember.name, 
        member: facultyMember 
    });
};