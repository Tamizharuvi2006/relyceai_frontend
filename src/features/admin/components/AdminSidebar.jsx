import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Users,
    BarChart,
    DollarSign,
    CreditCard,
    Shield,
    Settings,
    TrendingUp,
    Package,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Crown,
    Activity,
    Home,
    LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const AdminSidebar = memo(({ isSuperAdmin, isCollapsed, toggleSidebar, mobileOpen, closeMobile }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, currentUser } = useAuth();

    // Determine active tab based on path
    const getActiveTab = () => {
        const path = location.pathname;
        const parts = path.split('/');
        // For /super/users -> users, for /super -> overview
        return parts[2] || 'overview';
    };

    const activeTab = getActiveTab();

    const superAdminMenuItems = [
        { id: 'overview', label: 'Overview', icon: BarChart },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'payments', label: 'Payments & Revenue', icon: DollarSign },
        { id: 'coupons', label: 'Coupons', icon: CreditCard },
        { id: 'membership', label: 'Membership Plans', icon: Package },
        { id: 'roles', label: 'Role Management', icon: Shield },
        { id: 'settings', label: 'System Settings', icon: Settings }
    ];

    const adminMenuItems = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'payments', label: 'Payments & Revenue', icon: DollarSign },
        { id: 'coupons', label: 'Coupons', icon: CreditCard },
        { id: 'analytics', label: 'Analytics', icon: BarChart }
    ];

    // Logic to determine which menu to show
    // If user is Super Admin BUT is currently viewing /boss routes, show Super Admin menu
    // If viewing /super routes, show Admin menu
    const isBossView = isSuperAdmin && location.pathname.startsWith('/boss');

    const menuItems = isBossView ? superAdminMenuItems : adminMenuItems;
    const basePath = isBossView ? '/boss' : '/super';

    const handleNavigation = (id) => {
        // If id is 'overview', navigate to root of base path or /overview
        const path = id === 'overview' ? basePath : `${basePath}/${id}`;
        navigate(path);
        if (mobileOpen) closeMobile();
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to logout', error);
        }
    };

    // Animation variants
    const sidebarVariants = {
        expanded: { width: 260 },
        collapsed: { width: 80 }
    };

    // Mobile Sidebar variants
    const mobileSidebarVariants = {
        closed: { x: "-100%" },
        open: { x: 0 }
    };

    const NavItem = ({ item, isActive }) => (
        <button
            onClick={() => handleNavigation(item.id)}
            className={`w-full flex items-center p-3 mb-2 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                ? 'text-white shadow-lg shadow-emerald-900/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
        >
            {/* Active Background - Static instead of animated to prevent flashing */}
            {isActive && (
                <div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl"
                />
            )}

            <div className="relative z-10 flex items-center w-full">
                <div className={`flex items-center justify-center ${isCollapsed ? 'w-full' : ''}`}>
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'group-hover:text-emerald-400'} transition-colors`} />
                </div>

                {!isCollapsed && (
                    <span className="ml-3 font-medium truncate">
                        {item.label}
                    </span>
                )}

                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-zinc-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-zinc-700 transition-opacity">
                        {item.label}
                    </div>
                )}
            </div>
        </button>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.div
                className={`hidden md:flex flex-col h-screen fixed left-0 top-0 border-r border-zinc-800 bg-black/95 backdrop-blur-xl z-40 transition-all duration-300 ease-in-out overflow-hidden`}
                initial={false}
                animate={isCollapsed ? "collapsed" : "expanded"}
                variants={sidebarVariants}
                style={{ width: isCollapsed ? 80 : 260 }}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-900 mx-2">
                    <div className={`flex items-center space-x-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                            {isBossView ? <Crown size={16} className="text-white" /> : <Shield size={16} className="text-white" />}
                        </div>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="font-bold text-lg tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400"
                            >
                                {isBossView ? 'SuperAdmin' : 'Admin'}
                            </motion.span>
                        )}
                    </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto py-4 px-3 theme-scrollbar">
                    <nav className="space-y-1">
                        {menuItems.map(item => (
                            <NavItem key={item.id} item={item} isActive={activeTab === item.id} />
                        ))}
                    </nav>
                </div>

                {/* Footer / User Profile */}
                <div className="p-3 border-t border-zinc-900 mx-2 mb-2 space-y-2">
                    {!isCollapsed && (
                        <div className="flex items-center p-2 mb-2 rounded-xl bg-zinc-900/50 border border-zinc-800">
                            {currentUser?.photoURL ? (
                                <img
                                    src={currentUser.photoURL}
                                    alt={currentUser.displayName || 'User'}
                                    className="h-8 w-8 rounded-full object-cover shrink-0 ring-2 ring-emerald-500/30"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                    {currentUser?.displayName?.charAt(0).toUpperCase() || currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                            <div className="ml-3 overflow-hidden">
                                <p className="text-xs font-bold text-white truncate">
                                    {currentUser?.displayName || 'User'}
                                </p>
                                <p className="text-[10px] text-zinc-500 truncate">
                                    {currentUser?.email}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Links */}
                    {isSuperAdmin && (
                        <>
                            {isBossView ? (
                                <button
                                    onClick={() => navigate('/super')}
                                    className={`w-full flex items-center p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                                    title="Switch to Admin View"
                                >
                                    <LayoutDashboard size={18} />
                                    {!isCollapsed && <span className="ml-3 text-sm font-medium">Admin View</span>}
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate('/boss')}
                                    className={`w-full flex items-center p-2 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/20 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                                    title="Back to Super Admin"
                                >
                                    <Crown size={18} />
                                    {!isCollapsed && <span className="ml-3 text-sm font-medium">Super Admin</span>}
                                </button>
                            )}
                        </>
                    )}

                    <button
                        onClick={() => navigate('/')}
                        className={`w-full flex items-center p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                        title="Back to Home"
                    >
                        <Home size={18} />
                        {!isCollapsed && <span className="ml-3 text-sm font-medium">Home Page</span>}
                    </button>

                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors ${isCollapsed ? 'justify-center' : ''
                            }`}
                        title="Logout"
                    >
                        <LogOut size={18} />
                        {!isCollapsed && <span className="ml-3 text-sm font-medium">Sign Out</span>}
                    </button>

                    <button
                        onClick={toggleSidebar}
                        className="absolute -right-3 top-20 bg-emerald-600 text-white p-1 rounded-full shadow-lg hover:bg-emerald-500 transition-colors border border-emerald-400 hidden md:flex"
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                </div>
            </motion.div>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeMobile}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar */}
            <motion.div
                className="fixed inset-y-0 left-0 w-64 bg-zinc-900 border-r border-zinc-800 z-50 md:hidden flex flex-col"
                initial="closed"
                animate={mobileOpen ? "open" : "closed"}
                exit="closed"
                variants={mobileSidebarVariants}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            >
                <div className="h-16 flex items-center px-6 border-b border-zinc-800">
                    <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center mr-3">
                        {isSuperAdmin ? <Crown size={18} className="text-white" /> : <Shield size={18} className="text-white" />}
                    </div>
                    <span className="font-bold text-lg text-white">Dashboard</span>
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-4">
                    <nav className="space-y-2">
                        {menuItems.map(item => (
                            <NavItem key={item.id} item={item} isActive={activeTab === item.id} />
                        ))}
                    </nav>
                </div>

                <div className="p-4 border-t border-zinc-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center p-3 rounded-xl bg-red-500/10 text-red-400 font-medium"
                    >
                        <LogOut size={18} className="mr-2" />
                        Sign Out
                    </button>
                </div>
            </motion.div>
        </>
    );
});

AdminSidebar.displayName = 'AdminSidebar';

export default AdminSidebar;
