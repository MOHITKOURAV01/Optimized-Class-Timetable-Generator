import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { departmentApi } from '../api/department.api';
import { facultyApi } from '../api/faculty.api';
import { classroomApi } from '../api/classroom.api';
import { subjectApi } from '../api/subject.api';
import Loader from '../components/Loader';
import {
    Users,
    Building2,
    BookOpen,
    School,
    PlusCircle,
    Calendar,
    ArrowRight,
    TrendingUp
} from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [statsData, setStatsData] = useState({
        departments: 0,
        faculty: 0,
        classrooms: 0,
        subjects: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [departments, faculty, classrooms, subjects] = await Promise.all([
                    departmentApi.getAll(),
                    facultyApi.getAll(),
                    classroomApi.getAll(),
                    subjectApi.getAll()
                ]);

                setStatsData({
                    departments: departments.length,
                    faculty: faculty.length,
                    classrooms: classrooms.length,
                    subjects: subjects.length
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const stats = [
        { label: 'Departments', value: statsData.departments, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', path: '/dashboard/departments' },
        { label: 'Faculty Members', value: statsData.faculty, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/dashboard/faculty' },
        { label: 'Classrooms', value: statsData.classrooms, icon: School, color: 'text-purple-600', bg: 'bg-purple-50', path: '/dashboard/classrooms' },
        { label: 'Subjects', value: statsData.subjects, icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-50', path: '/dashboard/subjects' },
    ];

    const quickActions = [
        {
            label: 'Generate Timetable',
            desc: 'Start AI optimization engine',
            path: '/dashboard/timetable/generate',
            icon: Calendar,
            color: 'bg-gradient-to-br from-blue-600 to-indigo-700'
        },
        {
            label: 'Add New Faculty',
            desc: 'Register staff & constraints',
            path: '/dashboard/faculty/add',
            icon: PlusCircle,
            color: 'bg-gradient-to-br from-blue-500 to-blue-600'
        },
        {
            label: 'Create Subject',
            desc: 'Add new curriculum data',
            path: '/dashboard/subjects/add',
            icon: BookOpen,
            color: 'bg-gradient-to-br from-indigo-500 to-indigo-600'
        },
    ];

    if (loading) return <Loader />;

    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Overview</h1>
                    <p className="text-gray-500 text-lg mt-1">Intelligent Class Scheduling System</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100">
                    <TrendingUp className="w-4 h-4" />
                    System Active
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Link key={stat.label} to={stat.path}>
                        <div className="glass-card p-6 border-transparent hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center transition-colors group-hover:bg-opacity-80`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Primary Actions */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {quickActions.map((action) => (
                            <Link key={action.label} to={action.path}>
                                <div className={`${action.color} text-white p-6 rounded-2xl hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer relative overflow-hidden group h-full`}>
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                                            <action.icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-1">{action.label}</h3>
                                        <p className="text-white/80 text-sm mt-auto">{action.desc}</p>
                                    </div>
                                    {/* Decorative circle */}
                                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full transition-transform group-hover:scale-150 duration-500"></div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Secondary Links Card */}
                <div className="glass-card p-8 border-transparent flex flex-col space-y-6">
                    <h2 className="text-xl font-bold text-gray-800">Data Management</h2>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/dashboard/departments/add')}
                            className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all text-left group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-gray-700">Add Department</span>
                            </div>
                            <PlusCircle className="w-4 h-4 text-gray-400" />
                        </button>

                        <button
                            onClick={() => navigate('/dashboard/classrooms/add')}
                            className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all text-left group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <School className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-gray-700">Add Classroom</span>
                            </div>
                            <PlusCircle className="w-4 h-4 text-gray-400" />
                        </button>

                        <button
                            onClick={() => navigate('/dashboard/subjects/add')}
                            className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all text-left group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-gray-700">Add Subject</span>
                            </div>
                            <PlusCircle className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>

                    <div className="mt-auto pt-6 border-t font-medium text-sm text-center">
                        <Link to="/settings" className="text-gray-400 hover:text-gray-600 transition-colors">
                            System Settings & Preferences
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

