import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import DepartmentPage from './pages/DepartmentPage';
import AddDepartment from './pages/AddDepartment';
import FacultyPage from './pages/FacultyPage';
import AddFaculty from './pages/AddFaculty';
import ClassroomPage from './pages/ClassroomPage';
import AddClassroom from './pages/AddClassroom';
import SubjectPage from './pages/SubjectPage';
import AddSubject from './pages/AddSubject';
import EditDepartment from './pages/EditDepartment';
import EditFaculty from './pages/EditFaculty';
import EditClassroom from './pages/EditClassroom';
import EditSubject from './pages/EditSubject';
import TimetableGeneratePage from './pages/TimetableGeneratePage';
import ApprovalPage from './pages/ApprovalPage';
import TimetableDetailPage from './pages/TimetableDetailPage';
import { ToastContainer } from './components/ui/Toast';
import ConfirmDialog from './components/ui/ConfirmDialog';

function App() {
    return (
        <AuthProvider>
            <Router>
                <ToastContainer />
                <ConfirmDialog />
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/dashboard/departments" element={<DepartmentPage />} />
                        <Route path="/dashboard/departments/add" element={<AddDepartment />} />
                        <Route path="/dashboard/departments/edit/:id" element={<EditDepartment />} />
                        <Route path="/dashboard/faculty" element={<FacultyPage />} />
                        <Route path="/dashboard/faculty/add" element={<AddFaculty />} />
                        <Route path="/dashboard/faculty/edit/:id" element={<EditFaculty />} />
                        <Route path="/dashboard/classrooms" element={<ClassroomPage />} />
                        <Route path="/dashboard/classrooms/add" element={<AddClassroom />} />
                        <Route path="/dashboard/classrooms/edit/:id" element={<EditClassroom />} />
                        <Route path="/dashboard/subjects" element={<SubjectPage />} />
                        <Route path="/dashboard/subjects/add" element={<AddSubject />} />
                        <Route path="/dashboard/subjects/edit/:id" element={<EditSubject />} />
                        <Route path="/dashboard/timetable/generate" element={<TimetableGeneratePage />} />
                        <Route path="/dashboard/timetables" element={<TimetableDetailPage />} />
                        <Route path="/dashboard/approvals" element={<ApprovalPage />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
