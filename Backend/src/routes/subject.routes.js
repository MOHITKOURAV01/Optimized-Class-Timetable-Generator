const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subject.controller');
const authApiKey = require('../middleware/authApiKey');
const { verifyToken } = require('../middleware/authJwt');

router.use(authApiKey);
router.use(verifyToken);

router.get('/', subjectController.getSubjects);
router.get('/:id', subjectController.getSubject);
router.post('/', subjectController.createSubject);
router.put('/:id', subjectController.updateSubject);
router.delete('/:id', subjectController.deleteSubject);

module.exports = router;
