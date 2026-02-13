const prisma = require('../config/prisma');

const getAllSubjects = async (userId) => prisma.subject.findMany({ where: { userId }, include: { department: true } });
const getSubjectById = async (id, userId) => prisma.subject.findFirst({ where: { id: parseInt(id), userId }, include: { department: true } });
const createSubject = async (data, userId) => {
    const formattedData = {
        name: data.name,
        code: data.code,
        departmentId: parseInt(data.departmentId),
        semester: data.semester ? parseInt(data.semester) : 1,
        type: data.type || 'LECTURE',
        credits: data.credits ? parseInt(data.credits) : null,
        lecturesPerWeek: data.lecturesPerWeek ? parseInt(data.lecturesPerWeek) : null,
        labsPerWeek: data.labsPerWeek ? parseInt(data.labsPerWeek) : 0,
        classesPerWeek: data.classesPerWeek ? parseInt(data.classesPerWeek) : null,
        classesPerDay: data.classesPerDay ? parseInt(data.classesPerDay) : null,
        durationPerClass: data.durationPerClass ? parseInt(data.durationPerClass) : null,
        prerequisites: data.prerequisites || null,
        allowedRoomTypes: data.allowedRoomTypes || null,
        userId
    };
    return prisma.subject.create({ data: formattedData });
};
const updateSubject = async (id, data, userId) => {
    const s = await prisma.subject.findFirst({ where: { id: parseInt(id), userId } });
    if (!s) throw { status: 404, message: 'Subject not found' };
    return prisma.subject.update({ where: { id: parseInt(id) }, data });
};
const deleteSubject = async (id, userId) => {
    const subjectId = parseInt(id);
    const s = await prisma.subject.findFirst({ where: { id: subjectId, userId } });
    if (!s) throw { status: 404, message: 'Subject not found' };
    return await prisma.$transaction([
        prisma.subjectFaculty.deleteMany({ where: { subjectId } }),
        prisma.timetableSlot.deleteMany({ where: { subjectId } }),
        prisma.subject.delete({ where: { id: subjectId } })
    ]);
};

module.exports = { getAllSubjects, getSubjectById, createSubject, updateSubject, deleteSubject };
