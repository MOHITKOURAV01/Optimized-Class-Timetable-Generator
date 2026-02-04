const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = null;
let model = null;

// Initialize Google Gemini Client
// We use a hardcoded fallback or environment variable
const API_KEY = process.env.GOOGLE_AI_API_KEY;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }); // Using Flash 3 Preview as verified in test script
}

const buildPrompt = (data) => {
    // Gemini prompt structure is simpler (just a string usually, but we keep the logic clean)
    const systemInstruction = `You are an expert university timetable scheduler. Your task is to generate a conflict-free timetable based on the provided data.
      
      CRITICAL CONSTRAINTS:
      1. No faculty can be in two places at once.
      2. No classroom can be used by two classes at once.
      3. No student group (the requested semester) can have two classes at once.
      4. Respect faculty availability and max load.
      5. DURATION FLEXIBILITY: You can schedule classes for ANY duration necessary (e.g., 25m, 45m, 60m, 90m). The system is fully elastic. 
      6. EXACT COUNTS: The TOTAL number of slots for a subject MUST equal (lecturesPerWeek + labsPerWeek). If a subject has 3 lectures and 1 lab, you MUST provide exactly 3 LECTURE slots and 1 LAB slot. 
      7. DISTRIBUTION: Distribute classes evenly across the week (MONDAY-FRIDAY).
      8. DATA CONSISTENCY: Use the exact IDs provided for faculty, subjects, and classrooms.
      9. OCCUPIED CHECK: Check 'occupiedSlots' in data. DO NOT schedule a class in a room at a time if it is already in 'occupiedSlots'. THIS IS MANDATORY.
      
      Output Format:
      Return ONLY a JSON array of slot objects. Do not include any markdown formatting (like \`\`\`json) or explanation. 
      The output should be a single valid JSON array.
      
      Example Object:
      {
        "dayOfWeek": "MONDAY",
        "startTime": "09:00",
        "endTime": "10:00",
        "subjectId": 101,
        "facultyId": 5,
        "classroomId": 10,
        "slotType": "LECTURE"
      }`;

    const userMessage = `Generate a timetable for the following data: ${JSON.stringify(data)}`;

    return `${systemInstruction}\n\n${userMessage}`;
};

const callAiModel = async (prompt) => {
    if (!model) {
        // If AI model is not configured, try to generate a basic fallback timetable
        console.warn("Google Gemini API key not configured. Attempting to generate a fallback timetable.");

        const fallbackSlots = [];
        const usedSlots = new Set(); // To track occupied slots for fallback

        const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
        const timeSlotsData = [
            { start: "09:00", end: "10:00" },
            { start: "10:00", end: "11:00" },
            { start: "11:00", end: "12:00" },
            { start: "12:00", end: "13:00" },
            { start: "14:00", end: "15:00" },
            { start: "15:00", end: "16:00" },
            { start: "16:00", end: "17:00" },
            { start: "17:00", end: "18:00" }
        ];

        // Initialize subject assignment tracking
        const data = JSON.parse(prompt.split('Generate a timetable for the following data: ')[1]); // Extract data from prompt
        const subjectAssignments = data.subjects.map(s => ({
            ...s,
            totalNeeded: (s.lecturesPerWeek || 0) + (s.labsPerWeek || 0),
            assigned: 0,
            daysAssigned: new Set()
        }));

        // Pass 1: Try to give each subject a slot on a different day
        // This prevents "Stacking on Monday"
        for (let pass = 0; pass < 5; pass++) { // Iterate up to 5 times to try and distribute across days
            subjectAssignments.forEach(sub => {
                if (sub.assigned >= sub.totalNeeded) return;

                for (const day of days) {
                    if (sub.assigned >= sub.totalNeeded) break;
                    if (sub.daysAssigned.has(day)) continue; // Try to distribute to fresh days first

                    for (const time of timeSlotsData) {
                        const freeRoom = data.classrooms.find(room => {
                            const key = `${day}-${time.start}-${room.id}`;
                            // Check if room is free and not in occupiedSlots
                            const isOccupied = data.occupiedSlots && data.occupiedSlots.some(occ =>
                                occ.dayOfWeek === day && occ.startTime === time.start && occ.classroomId === room.id
                            );
                            return !usedSlots.has(key) && !isOccupied;
                        });

                        if (freeRoom) {
                            const key = `${day}-${time.start}-${freeRoom.id}`;
                            usedSlots.add(key);
                            sub.daysAssigned.add(day);

                            fallbackSlots.push({
                                dayOfWeek: day,
                                startTime: time.start,
                                endTime: time.end,
                                subjectId: sub.id,
                                slotType: sub.assigned < (sub.lecturesPerWeek || 0) ? 'LECTURE' : 'LAB',
                                facultyId: data.faculty[0] ? data.faculty[0].id : null, // Assign first faculty as fallback
                                classroomId: freeRoom.id
                            });
                            sub.assigned++;
                            break; // Move to next subject after assigning one slot for this subject in this pass
                        }
                    }
                }
            });
        }

        // Pass 2: Fill remaining slots if any (e.g. if a subject needs more than 5 slots or couldn't be distributed)
        subjectAssignments.forEach(sub => {
            if (sub.assigned >= sub.totalNeeded) return;
            days.forEach(day => {
                if (sub.assigned >= sub.totalNeeded) return;
                timeSlotsData.forEach(time => {
                    if (sub.assigned >= sub.totalNeeded) return;
                    const freeRoom = data.classrooms.find(room => {
                        const key = `${day}-${time.start}-${room.id}`
                        const isOccupied = data.occupiedSlots && data.occupiedSlots.some(occ =>
                            occ.dayOfWeek === day && occ.startTime === time.start && occ.classroomId === room.id
                        );
                        if (!usedSlots.has(key) && !isOccupied) return true;
                    });
                    if (freeRoom) {
                        usedSlots.add(`${day}-${time.start}-${freeRoom.id}`);
                        fallbackSlots.push({
                            dayOfWeek: day,
                            startTime: time.start,
                            endTime: time.end,
                            subjectId: sub.id,
                            slotType: sub.assigned < (sub.lecturesPerWeek || 0) ? 'LECTURE' : 'LAB',
                            facultyId: data.faculty[0] ? data.faculty[0].id : null,
                            classroomId: freeRoom.id
                        });
                        sub.assigned++;
                    }
                });
            });
        });
        console.log("----- FALLBACK TIMETABLE GENERATED -----");
        console.log(JSON.stringify(fallbackSlots, null, 2));
        console.log("----------------------------------------");
        return fallbackSlots;
    }

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown if Gemini adds it
        const cleanContent = text.replace(/```json/g, '').replace(/```/g, '').trim();

        console.log("----- AI RAW RESPONSE -----");
        console.log(text);
        console.log("---------------------------");

        return JSON.parse(cleanContent);
    } catch (error) {
        console.error("AI Model Call Failed:", error);
        if (error.response) console.error("AI Error Details:", JSON.stringify(error.response));
        throw new Error("Failed to generate timetable via AI");
    }
};

module.exports = {
    buildPrompt,
    callAiModel
};
