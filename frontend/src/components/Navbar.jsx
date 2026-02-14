import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="glass border-b border-white/20 px-4 py-3 fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <img src="/schedulify-logo.png" alt="Schedulify" className="w-8 h-8 rounded-lg object-cover" />
                    <span className="text-xl font-bold text-gray-900 hidden sm:block">Schedulify</span>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="hidden sm:block">
                        <p className="font-medium">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500">{user?.email || ''}</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
