const subjectService = require('../services/subject.service');

const getSubjects = async (req, res, next) => {
    try { res.json(await subjectService.getAllSubjects(req.user.id)); } catch (e) { next(e); }
};
const getSubject = async (req, res, next) => {
    try {
        const subject = await subjectService.getSubjectById(req.params.id, req.user.id);
        if (!subject) {
            return res.status(404).json({ error: "Subject not found" });
        }
        res.json(subject);
    } catch (e) { next(e); }
};
const createSubject = async (req, res, next) => {
    try { res.status(201).json(await subjectService.createSubject(req.body, req.user.id)); } catch (e) { next(e); }
};
const updateSubject = async (req, res, next) => {
    try { res.json(await subjectService.updateSubject(req.params.id, req.body, req.user.id)); } catch (e) { next(e); }
};
const deleteSubject = async (req, res, next) => {
    try { await subjectService.deleteSubject(req.params.id, req.user.id); res.status(204).send(); } catch (e) { next(e); }
};

module.exports = { getSubjects, getSubject, createSubject, updateSubject, deleteSubject };
