const prisma = require('../config/prisma');

const getAllFaculty = async (userId) => prisma.faculty.findMany({ where: { userId }, include: { department: true } });
const getFacultyById = async (id, userId) => prisma.faculty.findFirst({ where: { id: parseInt(id), userId }, include: { department: true, subjects: true } });
const createFaculty = async (data, userId) => {
    const formattedData = {
        ...data,
        departmentId: parseInt(data.departmentId),
        maxWeeklyLoad: parseInt(data.maxWeeklyLoad),
        averageLeavesPerMonth: data.averageLeavesPerMonth ? parseFloat(data.averageLeavesPerMonth) : 0,
        availableDays: Array.isArray(data.availableDays) ? JSON.stringify(data.availableDays) : data.availableDays,
        preferredSlots: Array.isArray(data.preferredSlots) ? JSON.stringify(data.preferredSlots) : data.preferredSlots,
        userId
    };
    return prisma.faculty.create({ data: formattedData });
};
const updateFaculty = async (id, data, userId) => {
    const f = await prisma.faculty.findFirst({ where: { id: parseInt(id), userId } });
    if (!f) throw { status: 404, message: 'Faculty not found' };
    return prisma.faculty.update({ where: { id: parseInt(id) }, data });
};
const deleteFaculty = async (id, userId) => {
    const f = await prisma.faculty.findFirst({ where: { id: parseInt(id), userId } });
    if (!f) throw { status: 404, message: 'Faculty not found' };
    return prisma.faculty.delete({ where: { id: parseInt(id) } });
};

module.exports = { getAllFaculty, getFacultyById, createFaculty, updateFaculty, deleteFaculty };
