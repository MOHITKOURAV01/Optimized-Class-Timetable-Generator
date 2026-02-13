const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');
const authApiKey = require('../middleware/authApiKey');
const { verifyToken } = require('../middleware/authJwt');

router.use(authApiKey);
router.use(verifyToken);

router.get('/', departmentController.getDepartments);
router.get('/:id', departmentController.getDepartment);
router.post('/', departmentController.createDepartment);
router.put('/:id', departmentController.updateDepartment);
router.delete('/:id', departmentController.deleteDepartment);

module.exports = router;
