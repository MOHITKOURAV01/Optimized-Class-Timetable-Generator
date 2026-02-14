const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    try {
        const semester = 5;
        const departmentId = 1; // Assuming Dept 1 (Computer Science)

        console.log(`Checking data for Department ${departmentId}, Semester ${semester}...`);

        const subjects = await prisma.subject.count({
            where: {
                departmentId: departmentId,
                semester: semester
            }
        });

        const classrooms = await prisma.classroom.count({
            where: {
                departmentId: departmentId
            }
        });

        const faculties = await prisma.faculty.count({
            where: {
                departmentId: departmentId
            }
        });

        console.log(`----------------------------------------`);
        console.log(`Subjects (Sem ${semester}): ${subjects}`);
        console.log(`Classrooms (Total): ${classrooms}`);
        console.log(`Faculty (Total): ${faculties}`);
        console.log(`----------------------------------------`);

        if (subjects === 0) {
            console.error("ERROR: No subjects found for Semester 5! Timetable generation requires subjects.");
        } else {
            console.log("Data seems sufficient (checking constraints next).");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
