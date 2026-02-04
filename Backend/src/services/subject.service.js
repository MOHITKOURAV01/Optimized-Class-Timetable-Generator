const prisma = require('../config/prisma');

const getAllSubjects = async () => prisma.subject.findMany({ include: { department: true } });
const getSubjectById = async (id) => prisma.subject.findUnique({ where: { id: parseInt(id) }, include: { department: true } });
const createSubject = async (data) => {
    const formattedData = {
        ...data,
        departmentId: parseInt(data.departmentId),
        semester: parseInt(data.semester),
        credits: data.credits ? parseInt(data.credits) : null,
        lecturesPerWeek: data.lecturesPerWeek ? parseInt(data.lecturesPerWeek) : null,
        labsPerWeek: data.labsPerWeek ? parseInt(data.labsPerWeek) : 0,
        classesPerWeek: data.classesPerWeek ? parseInt(data.classesPerWeek) : null,
        classesPerDay: data.classesPerDay ? parseInt(data.classesPerDay) : null,
        durationPerClass: data.durationPerClass ? parseInt(data.durationPerClass) : null,
    };
    return prisma.subject.create({ data: formattedData });
};
const updateSubject = async (id, data) => prisma.subject.update({ where: { id: parseInt(id) }, data });
const deleteSubject = async (id) => {
    const subjectId = parseInt(id);
    return await prisma.$transaction([
        // 1. Delete Faculty Assignments
        prisma.subjectFaculty.deleteMany({ where: { subjectId } }),
        // 2. Delete Timetable Slots using this subject
        prisma.timetableSlot.deleteMany({ where: { subjectId } }),
        // 3. Delete the Subject itself
        prisma.subject.delete({ where: { id: subjectId } })
    ]);
};

module.exports = { getAllSubjects, getSubjectById, createSubject, updateSubject, deleteSubject };
