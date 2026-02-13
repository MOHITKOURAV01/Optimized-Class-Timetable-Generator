const timetableService = require('../services/timetable.service');
const aiSchedulerService = require('../services/aiScheduler.service');
const validateTimetable = require('../utils/timetableValidator');

const generateTimetable = async (req, res, next) => {
    try {
        const { departmentId, semester, name } = req.body;
        const generatedById = req.user.id; // From authJwt

        const dId = parseInt(departmentId);
        const sem = parseInt(semester);

        if (isNaN(dId) || isNaN(sem)) {
            return res.status(400).json({ error: "Invalid departmentId or semester" });
        }

        // 1. Get Data (scoped to user)
        const data = await timetableService.getGenerationData(dId, sem, generatedById);

        // 2. Pre-Generation Requirements Check
        if (!data.subjects || data.subjects.length === 0) {
            return res.status(400).json({
                error: `No subjects found for Semester ${sem} in this department. Please add subjects first.`
            });
        }
        if (!data.faculty || data.faculty.length === 0) {
            return res.status(400).json({
                error: "No faculty found for this department. Please assign faculty members first."
            });
        }
        if (!data.classrooms || data.classrooms.length === 0) {
            return res.status(400).json({
                error: "No classrooms found for this department. Please add classrooms first."
            });
        }

        // 3. Build Prompt & Call AI
        const messages = aiSchedulerService.buildPrompt(data);
        const generatedSlots = await aiSchedulerService.callAiModel(messages);

        // 3. Validate
        const validation = validateTimetable(generatedSlots);
        if (!validation.valid) {
            return res.status(400).json({
                error: "AI generated an invalid timetable",
                details: validation.errors,
                rawOutput: generatedSlots
            });
        }

        // 4. Save
        const savedTimetable = await timetableService.saveGeneratedTimetable({
            departmentId,
            semester,
            name: name || `Timetable - ${new Date().toISOString()}`,
            generatedById,
            slots: generatedSlots
        });

        res.status(201).json(savedTimetable);

    } catch (error) {
        console.error("AI Generation Failed, attempting fallback:", error.message);

        // --- Fallback Mechanism ---
        try {
            const data = await timetableService.getGenerationData(req.body.departmentId, req.body.semester, req.user.id);

            console.log("--- FALLBACK DEBUG ---");
            console.log(`Request - Dept: ${req.body.departmentId}, Sem: ${req.body.semester}`);
            console.log(`Fetched - Subjects: ${data.subjects?.length}, Faculty: ${data.faculty?.length}, Rooms: ${data.classrooms?.length}`);
            if (data.subjects?.length === 0) console.log("WARNING: No subjects found! Fallback will produce empty slots.");
            console.log("----------------------");

            const fallbackSlots = [];
            const usedSlots = new Set();

            if (data.occupiedSlots) {
                data.occupiedSlots.forEach(s => {
                    usedSlots.add(`${s.day}-${s.time}-${s.classroomId}`);
                });
            }

            const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
            const timeSlots = [
                { start: "09:00", end: "10:00" },
                { start: "10:00", end: "11:00" },
                { start: "11:00", end: "12:00" },
                { start: "12:00", end: "13:00" },
                { start: "14:00", end: "15:00" },
                { start: "15:00", end: "16:00" },
                { start: "16:00", end: "17:00" }
            ];

            data.subjects.forEach(subject => {
                const totalNeeded = (subject.lecturesPerWeek || 0) + (subject.labsPerWeek || 0);
                let assigned = 0;

                for (const day of days) {
                    if (assigned >= totalNeeded) break;

                    for (const time of timeSlots) {
                        if (assigned >= totalNeeded) break;

                        const freeRoom = data.classrooms.find(room => {
                            const key = `${day}-${time.start}-${room.id}`;
                            return !usedSlots.has(key);
                        });

                        if (freeRoom) {
                            const key = `${day}-${time.start}-${freeRoom.id}`;
                            usedSlots.add(key);

                            const currentSlotType = assigned < (subject.lecturesPerWeek || 0) ? 'LECTURE' : 'LAB';

                            fallbackSlots.push({
                                dayOfWeek: day,
                                startTime: time.start,
                                endTime: time.end,
                                subjectId: subject.id,
                                slotType: currentSlotType,
                                facultyId: data.faculty[0] ? data.faculty[0].id : null,
                                classroomId: freeRoom.id
                            });
                            assigned++;
                        }
                    }
                }
            });

            const savedTimetable = await timetableService.saveGeneratedTimetable({
                departmentId: req.body.departmentId,
                semester: req.body.semester,
                name: req.body.name || `Fallback Timetable - ${new Date().toISOString()}`,
                generatedById: req.user.id,
                slots: fallbackSlots
            });

            return res.status(201).json({
                ...savedTimetable,
                warning: "Generated using fallback scheduler due to AI unavailability."
            });

        } catch (fallbackError) {
            console.error("Fallback generation failed:", fallbackError);
            next(error);
        }
    }
};

const getTimetable = async (req, res, next) => {
    try {
        const timetable = await timetableService.getTimetableById(req.params.id, req.user.id);
        if (!timetable) {
            return res.status(404).json({ error: "Timetable not found" });
        }
        res.json(timetable);
    } catch (error) {
        next(error);
    }
};

const getTimetables = async (req, res, next) => {
    try {
        const { departmentId } = req.query;
        const timetables = await timetableService.getAllTimetables(req.user.id, departmentId);
        res.json(timetables);
    } catch (error) {
        next(error);
    }
};

const approveTimetable = async (req, res, next) => {
    try {
        const { status, comments } = req.body;
        const approverId = req.user.id;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: "Invalid status. Must be APPROVED or REJECTED" });
        }

        const result = await timetableService.approveTimetable(req.params.id, approverId, status, comments);
        res.json(result);

    } catch (error) {
        next(error);
    }
};

const deleteTimetable = async (req, res, next) => {
    try {
        await timetableService.deleteTimetable(req.params.id, req.user.id);
        res.status(200).json({ message: "Timetable deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateTimetable,
    getTimetable,
    getTimetables,
    approveTimetable,
    deleteTimetable
};
