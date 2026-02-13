const prisma = require('../config/prisma');

const getAllClassrooms = async (userId) => prisma.classroom.findMany({ where: { userId }, include: { department: true } });
const getClassroomById = async (id, userId) => prisma.classroom.findFirst({ where: { id: parseInt(id), userId }, include: { department: true } });
const createClassroom = async (data, userId) => {
    const formattedData = {
        ...data,
        departmentId: parseInt(data.departmentId),
        year: parseInt(data.year),
        semester: parseInt(data.semester),
        userId
    };
    return prisma.classroom.create({ data: formattedData });
};
const updateClassroom = async (id, data, userId) => {
    const c = await prisma.classroom.findFirst({ where: { id: parseInt(id), userId } });
    if (!c) throw { status: 404, message: 'Classroom not found' };
    return prisma.classroom.update({ where: { id: parseInt(id) }, data });
};
const deleteClassroom = async (id, userId) => {
    const c = await prisma.classroom.findFirst({ where: { id: parseInt(id), userId } });
    if (!c) throw { status: 404, message: 'Classroom not found' };
    return prisma.classroom.delete({ where: { id: parseInt(id) } });
};

module.exports = { getAllClassrooms, getClassroomById, createClassroom, updateClassroom, deleteClassroom };
