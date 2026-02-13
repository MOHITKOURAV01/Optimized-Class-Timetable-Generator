import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    LayoutDashboard,
    Building2,
    Users,
    School,
    BookOpen,
    CalendarDays,
    CheckSquare,
    Settings,
} from 'lucide-react';

const Sidebar = () => {
    const { user } = useAuth();

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/dashboard/departments', label: 'Departments', icon: Building2 },
        { path: '/dashboard/faculty', label: 'Faculty', icon: Users },
        { path: '/dashboard/classrooms', label: 'Classrooms', icon: School },
        { path: '/dashboard/subjects', label: 'Subjects', icon: BookOpen },
        { path: '/dashboard/timetable', label: 'Timetable', icon: CalendarDays },
        { path: '/dashboard/approvals', label: 'Approvals', icon: CheckSquare },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col shadow-2xl transition-all duration-300">
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                <img src="/schedulify-logo.png" alt="Schedulify" className="w-8 h-8 rounded-lg object-cover" />
                <h1 className="text-xl font-bold text-white tracking-tight">Schedulify</h1>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-4 mt-2">
                    Menu
                </div>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/dashboard'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                    : 'hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-xs">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
