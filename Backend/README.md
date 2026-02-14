# Optimized-Class-Timetable-Generator
Intelligent Scheduling for Smarter Campuses


# 🧩 The Problem
Most colleges still rely on manual or spreadsheet-based timetable creation, leading to:
Class clashes and faculty overload


Underutilized classrooms and labs


Uneven workload distribution


Frustrated students and faculty


With NEP 2020 promoting flexible and multidisciplinary learning, scheduling complexity has exploded — existing tools can’t keep up.

# 💡 The Idea
An AI-powered, web-based platform that automatically generates optimized timetables for colleges by balancing:
Room utilization

Faculty workload

Student preferences

Fixed and elective slots

All while ensuring zero clashes and maximum efficiency using **Google Gemini AI**.

# ⚙️ How It Works
You input:

Faculty, subjects, rooms, and constraints

Algorithm runs optimization (via **Google Gemini 1.5 Flash** + Heuristic Fallback)

The system produces multiple optimized timetables

Users can review, tweak, and approve the final schedule

Exports available in **Professional PDF** for easy sharing


# 🧠 Tech Stack
**Frontend:** React (Vite), Tailwind CSS (Glassmorphism Design), Lucide Icons
**Backend:** Node.js (Express)
**Database:** MySQL (TiDB Cloud) with Prisma ORM
**AI Engine:** Google Gemini 1.5 Flash (@google/generative-ai)
**State Management:** Zustand
**Tools:** jsPDF (Export), React Router
**Hosting:** Vercel (Frontend), Render (Backend)

# 🔐 Login & Signup System (How it Works)
The backend handles who is allowed to enter the system.

### How we check users:
1. **Signup**: When a user signs up, we save their **Email** and **Password** safely in our database.
2. **Login**: When a user tries to log in, we check if their **Email** and **Password** match what we have.
   - If it matches -> **Access Granted!** ✅
   - If it is wrong -> **Access Denied!** ❌

We use **JWT (JSON Web Tokens)** to give users a "digital pass" so they stay logged in while using the app.

# 🌟 Key Features
� **Modern Glassmorphism UI** - Beautiful, intuitive interface with gradient aesthetics
📄 **Professional PDF Export** - Generate print-ready A4 landscape timetables
🤖 **AI-Powered Scheduling** - Utilizes Google Gemini to solve complex constraints
🧑‍🏫 **Faculty Load Management** - Automatic workload balancing and leave tracking
🏫 **Room Optimization** - Efficient allocation of labs and classrooms
⚖️ **Conflict Detection** - Real-time analysis of changing constraints
🔐 **Private Access** - Secure isolated workspace for your data
✅ **Approval Workflow** - Draft -> Pending -> Approved/Rejected cycle



# 🚀 Impact
Saves 80% time vs manual scheduling


Increases classroom utilization by 20–30%


Eliminates faculty & room clashes


Improves satisfaction among faculty and students


Scalable for any university structure or NEP 2020-based curriculum



# 🔮 Future Scope
Student elective integration


Predictive faculty availability (AI-based)


Mobile app for personalized timetables


Integration with LMS platforms



# 🧭 Vision
To make academic scheduling smart, conflict-free, and adaptive —
 helping institutions focus less on logistics and more on learning outcomes.

Here’s your content formatted in **Markdown** for clean preview and readability:

---
# University Timetable Database Schema 


# 🏫 1. Department Model

### **Purpose**

Represents an academic department (like CSE, ECE, MECH, etc.) — acts as the core organizational unit.

### **Key Fields**

* **name** → Full department name (e.g., `"Computer Science and Engineering"`)
* **code** → Short code (e.g., `"CSE"`)
* **headOfDepartment** → Name or ID of HOD
* **totalFaculty** → Department stats
* **createdAt**, **updatedAt** → Record tracking timestamps

### **Relations**

* **faculties** → All faculty members in this department
* **classrooms** → Classrooms assigned to this department
* **subjects** → Subjects offered by the department
* **timetableSlots** → Slots scheduled under this department
* **authorizedUsers** → Users tied to this department

💡 **Use:** You’ll use this as a central reference when generating department-wise timetables, faculty loads, and subject allocations.

---

# 👨‍🏫 2. Faculty Model

### **Purpose**

Represents a faculty member and their workload preferences.

### **Key Fields**

* **name**, **email**, **phone**
* **maxWeeklyLoad** → Maximum teaching hours per week
* **averageLeavesPerMonth** → To optimize schedules
* **availableDays** → JSON array (e.g., `["Monday", "Wednesday"]`)
* **preferredSlots** → JSON array of preferred time windows
* **departmentId** → FK → Department

### **Relations**

* **subjects** → Links through *SubjectFaculty* (many-to-many)
* **timetableSlots** → Timetable slots assigned to this faculty

💡 **Use:** Helps scheduler respect teacher availability, avoid overload, and balance lectures across week.

---

# 🏫 3. Classroom Model

### **Purpose**

Represents a specific classroom or lab space.

### **Key Fields**

* **name** → Classroom name (e.g., `"CSE-Lab-1"`)
* **year**, **semester** → Batch/semester it belongs to
* **departmentId** → FK → Department

### **Relations**

* **department** → Linked department

* **timetableSlots** → Slots conducted in this room

💡 **Use:** Prevents double-booking and helps allocate suitable rooms (e.g., labs for practicals).

---



# 📘 4. Subject Model

### **Purpose**

Stores course or subject information.

### **Key Fields**

* **code**, **name**, **departmentId**
* **credits**, **type** (Lecture/Lab/Tutorial)
* **lecturesPerWeek**, **labsPerWeek**, **semester**
* **durationPerClass**, **allowedRoomTypes**, **prerequisites**

### **Relations**

* **department** → Department offering the subject
* **facultyAssignments** → Many-to-many through *SubjectFaculty*
* **timetableSlots** → When/where subject is scheduled

💡 **Use:** Forms the backbone of timetable creation — defines teaching load and type of room needed.

---

# 🔗 5. SubjectFaculty Model (Join Table)

### **Purpose**

Connects multiple faculties to multiple subjects (many-to-many).

### **Fields**

* **facultyId**, **subjectId** → Composite key

### **Relations**

* **faculty** → Faculty assigned
* **subject** → Subject taught

💡 **Use:** Allows co-teaching, lab assistance, or cross-department faculty handling.

---

# 🕓 6. TimetableSlot Model

### **Purpose**

Represents each lecture/lab time block.

### **Key Fields**

* **dayOfWeek**, **startTime**, **endTime**
* **subjectId**, **facultyId**, **classroomId**, **departmentId**
* **isFixed** → For fixed lab sessions

### **Relations**

* **subject**, **faculty**, **classroom**, **department**
* **timetable** *(optional)* → Belongs to a version of timetable

💡 **Use:** Core of the scheduling engine. Prevents conflicts using
`@@unique([dayOfWeek, startTime, classroomId])`.

---

# 👨‍💼 7. AuthorizedUser Model

### **Purpose**

Handles authentication and secure access control.

### **Key Fields**

* **name**, **email**, **password**
* **departmentId**, **isActive**

### **Relations**

* **department** → The department they manage (optional)
* **approvals** → Links to timetable approvals
* **generatedTimetables** → Timetables created by this user

💡 **Use:** Manages authentication for your private workspace.

---

# 📅 8. Timetable Model

### **Purpose**

Stores a full timetable version (like `"CSE Sem 3 - Draft 1"`).

### **Key Fields**

* **name**, **generatedById**, **status**, **scoreJson**

### **Relations**

* **generatedBy** → AuthorizedUser
* **slots** → All slots under this timetable
* **approvals** → Review/approval process

💡 **Use:** Enables multiple timetable versions, scoring, and comparisons before final approval.

---

# ✅ 9. Approval Model

### **Purpose**

Tracks approval workflow of timetables.

### **Key Fields**

* **timetableId**, **approverId**, **status**, **comments**

### **Relations**

* **timetable** → The timetable being approved
* **approver** → AuthorizedUser reviewing it

💡 **Use:** Tracks approval status of your generated timetables.

---

# 🔤 Enums



### **TimetableStatus**

Tracks lifecycle:
`PENDING | APPROVED | REJECTED`

### **ApprovalStatus**

For each approval record:
`PENDING | APPROVED | REJECTED`

---


```mermaid
erDiagram


    INSTRUCTOR {
        int instructor_id PK
        string name
        string email
        string department_id FK
    }

    COURSE {
        int course_id PK
        string course_name
        string course_code
        int credits
        string department_id FK
    }

    DEPARTMENT {
        string department_id PK
        string department_name
        string building
    }

    CLASSROOM {
        int classroom_id PK
        string room_number
        int capacity
        string building
    }

    TIMETABLE {
        int timetable_id PK
        int course_id FK
        int instructor_id FK
        int classroom_id FK
        string day_of_week
        string start_time
        string end_time
    }



    %% RELATIONSHIPS %%

    DEPARTMENT ||--o{ INSTRUCTOR : "has"
    DEPARTMENT ||--o{ COURSE : "offers"



    COURSE ||--o{ TIMETABLE : "scheduled as"
    INSTRUCTOR ||--o{ TIMETABLE : "teaches"
    CLASSROOM ||--o{ TIMETABLE : "hosts"
