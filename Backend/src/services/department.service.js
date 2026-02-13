const prisma = require('../config/prisma');

const getAllDepartments = async (userId) => {
    return await prisma.department.findMany({
        where: { userId },
        include: {
            _count: {
                select: { faculties: true, classrooms: true, subjects: true }
            }
        }
    });
};

const getDepartmentById = async (id, userId) => {
    return await prisma.department.findFirst({
        where: { id: parseInt(id), userId },
        include: {
            faculties: true,
            classrooms: true,
            subjects: true
        }
    });
};

const createDepartment = async (data, userId) => {
    return await prisma.department.create({
        data: { ...data, userId }
    });
};

const updateDepartment = async (id, data, userId) => {
    // Verify ownership
    const dept = await prisma.department.findFirst({ where: { id: parseInt(id), userId } });
    if (!dept) throw { status: 404, message: 'Department not found' };
    return await prisma.department.update({
        where: { id: parseInt(id) },
        data
    });
};

const deleteDepartment = async (id, userId) => {
    const dept = await prisma.department.findFirst({ where: { id: parseInt(id), userId } });
    if (!dept) throw { status: 404, message: 'Department not found' };
    return await prisma.department.delete({
        where: { id: parseInt(id) }
    });
};

module.exports = {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
};
