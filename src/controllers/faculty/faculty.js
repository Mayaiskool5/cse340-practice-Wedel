import * as facultyModel from '../../models/faculty/faculty.js';

export const facultyListPage = (req, res) => {
    const sort = req.query.sort;
    const facultyList = facultyModel.getSortedFaculty(sort);
    res.render('faculty/list', { 
        title: 'Faculty Directory', 
        facultyList 
    });
};

export const facultyDetailPage = (req, res) => {
    const id = req.params.facultyId;
    const member = facultyModel.getFacultyById(id);

    if (!member) {
        // 404 error
        const err = new Error('Faculty Member Not Found');
        err.status = 404;
        throw err; 
    }

    res.render('faculty/detail', { 
        title: member.name, 
        member 
    });
};