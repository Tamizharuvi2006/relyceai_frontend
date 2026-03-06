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
        <div className="relative min-h-[100dvh] bg-[#030508] text-white selection:bg-emerald-500/30 selection:text-white font-sans flex text-sm">
            {/* Premium Background Complex */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-[#030508]">
                {/* Deep Radial Gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0a1812_0%,_#030508_100%)] opacity-80" />
                
                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)]" />

                {/* Liquid Emerald Glows */}
                <div className="absolute -top-[20%] right-[5%] w-[800px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-[100%] mix-blend-screen pointer-events-none" />
                
                {/* Noise overlay for texture */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMSkiLz48L3N2Zz4=')] opacity-30 mix-blend-overlay pointer-events-none" />
            </div>

            {/* Sidebar Container */}
            <AdminSidebar
                isSuperAdmin={isSuperAdmin}
                isCollapsed={sidebarCollapsed}
                toggleSidebar={toggleSidebar}
                mobileOpen={mobileSidebarOpen}
                closeMobile={closeMobileSidebar}
            />

            {/* Main Content Area */}
            <div
                className={`relative z-10 flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out min-h-screen ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-[260px]'
                    }`}
            >
                {/* Header */}
                <header className="sticky top-0 z-20 h-20 bg-black/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 lg:px-10">
                    <div className="flex items-center">
                        <button
                            onClick={toggleMobileSidebar}
                            className="mr-6 p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 md:hidden transition-colors"
                        >
                            <Menu size={24} strokeWidth={1.5} />
                        </button>
                        <h1 className="text-xl md:text-2xl font-light text-white tracking-widest uppercase text-[15px]">
                            {title}
                        </h1>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[13px] font-medium text-white tracking-wide">
                                {currentUser?.displayName || currentUser?.email || 'User'}
                            </span>
                            <span className="text-[10px] font-mono tracking-[0.2em] text-emerald-500 uppercase mt-0.5 opacity-80">
                                {isSuperAdmin ? 'Super Admin' : 'Administrator'}
                            </span>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                            {currentUser?.photoURL ? (
                                <img
                                    src={currentUser.photoURL}
                                    alt={currentUser.displayName || 'User'}
                                    className="relative h-10 w-10 rounded-full object-cover ring-1 ring-white/20 shadow-2xl cursor-pointer bg-black"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="relative h-10 w-10 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center text-xs font-light text-white shadow-2xl cursor-pointer">
                                    {(currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 relative">
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
