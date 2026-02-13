const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/faculty.controller');
const authApiKey = require('../middleware/authApiKey');
const { verifyToken } = require('../middleware/authJwt');

router.use(authApiKey);
router.use(verifyToken);

router.get('/', facultyController.getFaculties);
router.get('/:id', facultyController.getFaculty);
router.post('/', facultyController.createFaculty);
router.put('/:id', facultyController.updateFaculty);
router.delete('/:id', facultyController.deleteFaculty);

module.exports = router;
