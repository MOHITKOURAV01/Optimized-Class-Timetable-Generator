const { PrismaClient } = require('@prisma/client');
const timetableService = require('./src/services/timetable.service');
const aiSchedulerService = require('./src/services/aiScheduler.service');
const validateTimetable = require('./src/utils/timetableValidator');
require('dotenv').config();

const prisma = new PrismaClient();

async function generate() {
    try {
        const departmentId = 1;
        const semester = 3;
        const generatedById = 1;
        const name = "Local Generated Timetable - " + new Date().toLocaleTimeString();

        console.log(`1. Fetching data for Department ${departmentId}, Semester ${semester}...`);
        const data = await timetableService.getGenerationData(departmentId, semester);
        console.log(`Data fetched: ${data.subjects.length} subjects, ${data.faculty.length} faculty, ${data.classrooms.length} classrooms.`);

        console.log("2. Building prompt and calling AI...");
        const prompt = aiSchedulerService.buildPrompt(data);
        const generatedSlots = await aiSchedulerService.callAiModel(prompt);

        console.log("3. Validating generated slots...");
        const validation = validateTimetable(generatedSlots);
        if (!validation.valid) {
            console.error("AI generated an invalid timetable:", validation.errors);
            process.exit(1);
        }

        console.log("4. Saving generated timetable...");
        const savedTimetable = await timetableService.saveGeneratedTimetable({
            departmentId,
            semester,
            name,
            generatedById,
            slots: generatedSlots
        });

        console.log("SUCCESS! Timetable saved with ID:", savedTimetable.id);
        console.dir(savedTimetable, { depth: null, colors: true });

    } catch (error) {
        console.error("Generation failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

generate();
