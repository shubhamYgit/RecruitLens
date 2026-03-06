import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, FileText, Briefcase, BarChart3, LayoutDashboard } from 'lucide-react';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/resumes', label: 'Resumes', icon: FileText },
    { to: '/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/screenings', label: 'Screenings', icon: BarChart3 },
];

export default function Navbar() {
    const { email, role, logout } = useAuth();
    const location = useLocation();

    return (
        <nav className="glass-nav sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center gradient-btn">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg gradient-text">RecruitLens</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const active = location.pathname === item.to;
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${active
                                            ? 'bg-violet-500/15 text-violet-300'
                                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                        }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Info + Logout */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-medium text-gray-200">{email}</p>
                            <p className="text-xs font-semibold gradient-text">{role}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex border-t border-white/5 px-2 py-1 gap-1 overflow-x-auto">
                {navItems.map((item) => {
                    const active = location.pathname === item.to;
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${active ? 'bg-violet-500/15 text-violet-300' : 'text-gray-400'
                                }`}
                        >
                            <item.icon className="w-3.5 h-3.5" />
                            {item.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
