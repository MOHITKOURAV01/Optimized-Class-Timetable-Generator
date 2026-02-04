const prisma = require('../config/prisma');

const getGenerationData = async (departmentId, semester) => {
    const deptId = parseInt(departmentId);
    const sem = parseInt(semester);

    if (isNaN(deptId) || isNaN(sem)) {
        throw new Error(`Invalid parameters: departmentId=${departmentId}, semester=${semester}`);
    }

    // 1. Fetch Department info
    const department = await prisma.department.findUnique({
        where: { id: deptId }
    });

    if (!department) throw new Error(`Department with ID ${deptId} not found`);

    // 2. Fetch Faculty belonging to this department
    const faculty = await prisma.faculty.findMany({
        where: { departmentId: deptId },

        include: {
            subjects: {
                include: { subject: true }
            }
        }
    });

    // 3. Fetch Subjects for this department and semester
    const subjects = await prisma.subject.findMany({
        where: {
            departmentId: deptId,
            semester: sem
        }
    });

    // 4. Fetch Classrooms for this department
    const classrooms = await prisma.classroom.findMany({
        where: { departmentId: deptId }
    });

    // 5. Fetch EXISTING Occupied Slots (from Approved/Pending Timetables of OTHER semesters/depts)
    // This allows AI to know which rooms are already taken
    const existingTimetables = await prisma.timetable.findMany({
        where: {
            status: { in: ['APPROVED', 'PENDING'] },
            // Don't count CURRENT semester's pending drafts (as they will be replaced)
            NOT: {
                AND: [
                    { departmentId: deptId },
                    { semester: sem },
                    { status: 'PENDING' }
                ]
            }
        },
        include: { slots: true }
    });

    const occupiedSlots = existingTimetables.flatMap(t => t.slots.map(s => ({
        day: s.dayOfWeek,
        time: s.startTime,
        classroomId: s.classroomId
    })));

    return {
        department,
        semester: sem,
        occupiedSlots, // Pass this list to AI
        faculty: faculty.map(f => ({
            id: f.id,
            name: f.name,
            maxWeeklyLoad: f.maxWeeklyLoad,
            availableDays: f.availableDays,
            preferredSlots: f.preferredSlots,
            qualifiedSubjects: f.subjects.map(s => s.subject.code)
        })),
        subjects: subjects.map(s => ({
            id: s.id,
            code: s.code,
            name: s.name,
            lecturesPerWeek: s.lecturesPerWeek || 0,
            labsPerWeek: s.labsPerWeek || 0,
            type: s.type,
            durationPerClass: s.durationPerClass || 1
        })),
        classrooms: classrooms.map(c => ({
            id: c.id,
            name: c.name,
            capacity: c.capacity
        })),
        constraints: {
            workingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
            slotsPerDay: 16,
            timeSlots: [
                "09:00-09:30", "09:30-10:00", "10:00-10:30", "10:30-11:00",
                "11:00-11:30", "11:30-12:00", "12:00-12:30", "12:30-13:00",
                "14:00-14:30", "14:30-15:00", "15:00-15:30", "15:30-16:00",
                "16:00-16:30", "16:30-17:00", "17:00-17:30", "17:30-18:00"
            ]
        }
    };
};

const saveGeneratedTimetable = async ({ departmentId, semester, name, generatedById, slots }) => {
    // 0. CLEANUP: Delete any existing PENDING timetables for this Dept/Sem to avoid conflicts
    // --- DEEP CLEANUP START ---
    // 1. Find ALL existing Timetables for this context (Pending, Approved, etc.)
    const existingTts = await prisma.timetable.findMany({
        where: {
            departmentId: parseInt(departmentId),
            semester: parseInt(semester)
        },
        select: { id: true }
    });
    const ttIds = existingTts.map(t => t.id);

    // 2. Delete Slots linked to these timetables OR Orphaned slots for this Dept/Sem
    await prisma.timetableSlot.deleteMany({
        where: {
            OR: [
                { timetableId: { in: ttIds } },
                {
                    timetableId: null,
                    departmentId: parseInt(departmentId),
                    semester: parseInt(semester)
                }
            ]
        }
    });

    // 3. Delete linked Approvals (to satisfy FK constraints)
    await prisma.approval.deleteMany({
        where: { timetableId: { in: ttIds } }
    });

    // 4. Delete the Timetables themselves
    await prisma.timetable.deleteMany({
        where: { id: { in: ttIds } }
    });
    // --- DEEP CLEANUP END ---

    // 4. Create New Timetable Header
    const timetable = await prisma.timetable.create({
        data: {
            name,
            generatedById,
            departmentId: parseInt(departmentId),
            semester: parseInt(semester),
            status: 'PENDING',
            scoreJson: "{}"
        }
    });

    // 5. Map & Create Slots
    const slotData = slots.map(slot => ({
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        subjectId: parseInt(slot.subjectId),
        facultyId: parseInt(slot.facultyId),
        classroomId: parseInt(slot.classroomId),
        semester: parseInt(semester),
        departmentId: parseInt(departmentId),
        timetableId: timetable.id,
        slotType: slot.slotType || 'LECTURE',
        isFixed: false
    }));

    await prisma.timetableSlot.createMany({
        data: slotData
    });

    return await prisma.timetable.findUnique({
        where: { id: timetable.id },
        include: {
            slots: {
                include: {
                    subject: { select: { name: true, code: true } },
                    faculty: { select: { name: true } },
                    classroom: { select: { name: true } }
                }
            }
        }
    });
};

const getTimetableById = async (id) => {
    return await prisma.timetable.findUnique({
        where: { id: parseInt(id) },
        include: {
            slots: {
                include: {
                    subject: { select: { name: true, code: true } },
                    faculty: { select: { name: true } },
                    classroom: { select: { name: true } }
                }
            },
            department: { select: { name: true, code: true } },
            generatedBy: {
                select: { name: true, email: true }
            },
            approvals: {
                include: { approver: { select: { name: true, role: true } } }
            }
        }
    });
};

const deleteTimetable = async (id) => {
    // 1. Delete Approvals first (FK Constraint)
    await prisma.approval.deleteMany({
        where: { timetableId: parseInt(id) }
    });

    // 2. Delete Slots
    await prisma.timetableSlot.deleteMany({
        where: { timetableId: parseInt(id) }
    });

    // 3. Delete Timetable

    return await prisma.timetable.delete({
        where: { id: parseInt(id) }
    });
};

const getAllTimetables = async (departmentId) => {
    const where = departmentId ? { slots: { some: { departmentId: parseInt(departmentId) } } } : {};

    return await prisma.timetable.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            generatedBy: {
                select: { name: true }
            },
            department: {
                select: { name: true, code: true }
            },
            _count: {
                select: { slots: true }
            }
        }
    });
};

const approveTimetable = async (id, approverId, status, comments) => {
    const timetableId = parseInt(id);

    // 1. Create Approval Record
    await prisma.approval.create({
        data: {
            timetableId,
            approverId,
            status,
            comments
        }
    });

    // 2. Update Timetable Status
    // Logic: If REJECTED, set timetable to REJECTED.
    // If APPROVED, we might want to check if it needs multiple approvals, 
    // but for now, we'll set it to APPROVED directly.

    const newStatus = status === 'REJECTED' ? 'REJECTED' : 'APPROVED';

    return await prisma.timetable.update({
        where: { id: timetableId },
        data: { status: newStatus },
        include: { approvals: true }
    });
};

module.exports = {
    getGenerationData,
    saveGeneratedTimetable,
    getTimetableById,
    getAllTimetables,
    approveTimetable,
    deleteTimetable
};
