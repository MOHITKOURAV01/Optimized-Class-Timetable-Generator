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

        // 1. Get Data
        const data = await timetableService.getGenerationData(dId, sem);

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
            // Re-fetch data if needed or just use 'data' from above if scope allows. 
            // We need to move 'data' variable declaration up or re-fetch.
            const data = await timetableService.getGenerationData(req.body.departmentId, req.body.semester);

            console.log("--- FALLBACK DEBUG ---");
            console.log(`Request - Dept: ${req.body.departmentId}, Sem: ${req.body.semester}`);
            console.log(`Fetched - Subjects: ${data.subjects?.length}, Faculty: ${data.faculty?.length}, Rooms: ${data.classrooms?.length}`);
            if (data.subjects?.length === 0) console.log("WARNING: No subjects found! Fallback will produce empty slots.");
            console.log("----------------------");

            const fallbackSlots = [];
            // Use Set to track conflicts: "Day-Time-RoomID"
            const usedSlots = new Set();

            // Populate usedSlots with occupiedSlots from other timetables (fetched in getGenerationData)
            if (data.occupiedSlots) {
                data.occupiedSlots.forEach(s => {
                    // Normalize keys: MONDAY-09:00-1
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

            // Distribute subjects
            data.subjects.forEach(subject => {
                const totalNeeded = (subject.lecturesPerWeek || 0) + (subject.labsPerWeek || 0);
                let assigned = 0;

                // Try days
                for (const day of days) {
                    if (assigned >= totalNeeded) break;

                    // Try times
                    for (const time of timeSlots) {
                        if (assigned >= totalNeeded) break;

                        // Find FREE Room
                        const freeRoom = data.classrooms.find(room => {
                            const key = `${day}-${time.start}-${room.id}`;
                            return !usedSlots.has(key);
                        });

                        if (freeRoom) {
                            // Assign
                            const key = `${day}-${time.start}-${freeRoom.id}`;
                            usedSlots.add(key);

                            // Determine slot type based on assigned count
                            const currentSlotType = assigned < (subject.lecturesPerWeek || 0) ? 'LECTURE' : 'LAB';

                            fallbackSlots.push({
                                dayOfWeek: day,
                                startTime: time.start,
                                endTime: time.end,
                                subjectId: subject.id,
                                slotType: currentSlotType,
                                // Corrected faculty assignment
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
            next(error); // Return original error if fallback also fails
        }
    }
};

const getTimetable = async (req, res, next) => {
    try {
        const timetable = await timetableService.getTimetableById(req.params.id);
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
        const timetables = await timetableService.getAllTimetables(departmentId);
        res.json(timetables);
    } catch (error) {
        next(error);
    }
};

const approveTimetable = async (req, res, next) => {
    try {
        const { status, comments } = req.body; // status: 'APPROVED' | 'REJECTED'
        const approverId = req.user.id;
        const { role } = req.user;

        // Role Check: Only HOD, TIMETABLE_ADMIN, or SUPERADMIN can approve
        if (!['HOD', 'TIMETABLE_ADMIN', 'SUPERADMIN', 'FACULTY'].includes(role)) {
            return res.status(403).json({ error: "Insufficient permissions to approve timetables" });
        }

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
        await timetableService.deleteTimetable(req.params.id);
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
