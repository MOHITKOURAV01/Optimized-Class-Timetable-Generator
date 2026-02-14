import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Users,
    BookOpen,
    School,
    Calendar,
    CheckSquare,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/dashboard/departments', label: 'Departments', icon: Building2 },
        { to: '/dashboard/faculty', label: 'Faculty', icon: Users },
        { to: '/dashboard/classrooms', label: 'Classrooms', icon: School },
        { to: '/dashboard/subjects', label: 'Subjects', icon: BookOpen },
        { to: '/dashboard/timetable/generate', label: 'Generate Timetable', icon: Calendar },
        { to: '/dashboard/timetables', label: 'Academic Timetables', icon: Calendar },
        { to: '/dashboard/approvals', label: 'Approvals', icon: CheckSquare },
    ];

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={toggleSidebar}
                className="fixed bottom-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg md:hidden"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar Container */}
            <aside className={`
                fixed top-16 left-0 bottom-0 w-64 glass border-r border-white/20 overflow-y-auto transition-transform duration-300 z-40
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                <div className="p-4 space-y-1">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === '/dashboard'}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
                                ${isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-slate-600 hover:bg-white/50 hover:text-slate-900 hover:translate-x-1'
                                }
                            `}
                        >
                            <link.icon className="w-5 h-5" />
                            <span>{link.label}</span>
                        </NavLink>
                    ))}
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
