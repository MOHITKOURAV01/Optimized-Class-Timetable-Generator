const facultyService = require('../services/faculty.service');

const getFaculties = async (req, res, next) => {
    try { res.json(await facultyService.getAllFaculty(req.user.id)); } catch (e) { next(e); }
};
const getFaculty = async (req, res, next) => {
    try { res.json(await facultyService.getFacultyById(req.params.id, req.user.id)); } catch (e) { next(e); }
};
const createFaculty = async (req, res, next) => {
    try { res.status(201).json(await facultyService.createFaculty(req.body, req.user.id)); } catch (e) { next(e); }
};
const updateFaculty = async (req, res, next) => {
    try { res.json(await facultyService.updateFaculty(req.params.id, req.body, req.user.id)); } catch (e) { next(e); }
};
const deleteFaculty = async (req, res, next) => {
    try { await facultyService.deleteFaculty(req.params.id, req.user.id); res.status(204).send(); } catch (e) { next(e); }
};

module.exports = { getFaculties, getFaculty, createFaculty, updateFaculty, deleteFaculty };
