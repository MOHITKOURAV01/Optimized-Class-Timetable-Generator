const prisma = require('../config/prisma');

const getAllFaculty = async () => prisma.faculty.findMany({ include: { department: true } });
const getFacultyById = async (id) => prisma.faculty.findUnique({ where: { id: parseInt(id) }, include: { department: true, subjects: true } });
const createFaculty = async (data) => {
    const formattedData = {
        ...data,
        departmentId: parseInt(data.departmentId),
        maxWeeklyLoad: parseInt(data.maxWeeklyLoad),
        averageLeavesPerMonth: data.averageLeavesPerMonth ? parseFloat(data.averageLeavesPerMonth) : 0,
        // Ensure availableDays and preferredSlots are strings (stored as JSON string in Prisma)
        availableDays: Array.isArray(data.availableDays) ? JSON.stringify(data.availableDays) : data.availableDays,
        preferredSlots: Array.isArray(data.preferredSlots) ? JSON.stringify(data.preferredSlots) : data.preferredSlots,
    };
    return prisma.faculty.create({ data: formattedData });
};
const updateFaculty = async (id, data) => prisma.faculty.update({ where: { id: parseInt(id) }, data });
const deleteFaculty = async (id) => prisma.faculty.delete({ where: { id: parseInt(id) } });

module.exports = { getAllFaculty, getFacultyById, createFaculty, updateFaculty, deleteFaculty };
