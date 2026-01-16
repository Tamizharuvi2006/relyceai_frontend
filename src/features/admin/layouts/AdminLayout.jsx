import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';

const AdminLayout = ({ children, isSuperAdmin = false, title = "Dashboard" }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const { currentUser } = useAuth();
    // Enforce dark theme
    const theme = 'dark';

    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
    const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);
    const closeMobileSidebar = () => setMobileSidebarOpen(false);

    return (
        <div className="h-screen bg-black text-white flex overflow-hidden">
            {/* Sidebar */}
            <AdminSidebar
                isSuperAdmin={isSuperAdmin}
                isCollapsed={sidebarCollapsed}
                toggleSidebar={toggleSidebar}
                mobileOpen={mobileSidebarOpen}
                closeMobile={closeMobileSidebar}
            />

            {/* Main Content Area */}
            <div
                className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-[260px]'
                    }`}
            >
                {/* Header */}
                <header className="sticky top-0 z-20 h-16 bg-black/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center">
                        <button
                            onClick={toggleMobileSidebar}
                            className="mr-4 p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 md:hidden"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-lg md:text-xl font-semibold text-white tracking-tight">
                            {title}
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-medium text-white">
                                {currentUser?.displayName || currentUser?.email || 'User'}
                            </span>
                            <span className="text-xs text-zinc-500 uppercase tracking-wider">
                                {isSuperAdmin ? 'Super Admin' : 'Administrator'}
                            </span>
                        </div>
                        {currentUser?.photoURL ? (
                            <img
                                src={currentUser.photoURL}
                                alt={currentUser.displayName || 'User'}
                                className="h-9 w-9 rounded-full object-cover ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-900/50 cursor-pointer"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-emerald-900/50 cursor-pointer">
                                {(currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative theme-scrollbar">
                    {/* Background Ambient Glow */}
                    <div className="fixed top-20 right-20 w-96 h-96 bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />
                    <div className="fixed bottom-20 left-20 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="max-w-7xl mx-auto"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
