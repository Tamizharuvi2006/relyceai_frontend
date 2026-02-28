import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../utils/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import {
  Menu,
  X,
  ChevronDown,
  Settings,
  LogOut,
  Plus,
  CreditCard,
  Shield,
  Crown,
  Library
} from "lucide-react";
import gsap from "gsap";

export default function Header() {
  const { currentUser: user, userProfile, membership, loading, role } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userPlan, setUserPlan] = useState('free');
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  const backdropRef = useRef(null);
  const tl = useRef(null);
  const [userAvatar, setUserAvatar] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set user plan from membership data
    if (membership) {
      setUserPlan(membership.plan || 'free');
    } else if (userProfile?.membership) {
      setUserPlan(userProfile.membership.plan || 'free');
    } else {
      setUserPlan('free');
    }

    // Set avatar - prioritize custom uploaded photo over Google photo
    if (userProfile?.photoURL) {
      // Custom uploaded photo takes priority
      setUserAvatar(userProfile.photoURL);
    } else if (user?.photoURL) {
      // Fall back to Google profile photo
      setUserAvatar(user.photoURL);
    } else {
      setUserAvatar(null);
    }
  }, [user, userProfile, membership]);

  // Effect for scroll background blur
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effect to close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // GSAP Animation for Sidebar
  useEffect(() => {
    // Only initialize GSAP timeline if refs are available
    if (sidebarRef.current && backdropRef.current) {
      gsap.set(sidebarRef.current, { xPercent: -100 });
      gsap.set(backdropRef.current, { autoAlpha: 0 });

      // Create timeline only once
      if (!tl.current) {
        tl.current = gsap.timeline({ paused: true })
          .to(backdropRef.current, { autoAlpha: 1, duration: 0.3 })
          .to(sidebarRef.current, { xPercent: 0, duration: 0.4, ease: "power3.out" }, "-=0.2");
      }
    }
  }, []);

  useEffect(() => {
    // Only play/reverse timeline if it exists
    if (tl.current) {
      isMenuOpen ? tl.current.play() : tl.current.reverse();
    }
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleNewChat = () => alert("Start a new chat");
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsDropdownOpen(false);
      setIsMenuOpen(false);
    } catch (error) {
      alert("Logout failed: " + error.message);
    }
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
    { label: "Pricing", path: "/membership" },
    { label: "Visualize", path: "/visualize" },
    { label: "Chat", path: "/chat" },
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#05060a]/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent border-transparent'} text-white`}>
      <div className="max-w-[90rem] mx-auto flex items-center justify-between px-6 lg:px-12 py-3">
        <Link to="/" className="flex items-center">
          <img src="/logo.svg" alt="Relyce AI" className="w-12 h-12 object-contain opacity-90 hover:opacity-100 transition-opacity" />
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          {navItems.map(({ label, path }) => (
            <Link key={label} to={path} className="text-[11px] uppercase tracking-[0.2em] font-medium text-white/50 hover:text-white transition-colors duration-200" style={{ fontFamily: "'Geist Mono', monospace" }}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-6">
          {user ? (
            // --- NEW USER DROPDOWN MENU ---
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => {
                // Use a timeout to allow moving to the dropdown menu
                setTimeout(() => {
                  if (dropdownRef.current && !dropdownRef.current.matches(':hover')) {
                    setIsDropdownOpen(false);
                  }
                }, 100);
              }}
            >
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-full hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-white/10"
              >
                {userAvatar ? (
                  <>
                  <img
                    src={userAvatar}
                    alt="Profile"
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-emerald-500/30"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 hidden items-center justify-center font-bold text-emerald-300 border border-emerald-500/30 absolute top-1.5 left-1.5 pointer-events-none text-sm">
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                  </>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-emerald-300 border border-emerald-500/30 text-sm">
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="text-left">
                  <p className="font-semibold text-white truncate max-w-[150px] text-[13px] leading-none">{user.displayName || user.email}</p>
                  <p className="text-[10px] text-emerald-400 capitalize mt-1 leading-none">
                    {(role === 'admin' || role === 'superadmin') ? 'Unlimited Access' : `${userPlan} Plan`}
                  </p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''} ml-1`} />
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute top-full right-0 mt-3 w-64 border border-white/10 rounded-2xl shadow-2xl overflow-hidden bg-[#0a0d14]/95 backdrop-blur-xl animate-fade-in-down"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <div className="p-5 border-b border-white/10">
                    <p className="font-semibold text-white truncate text-base">{user.displayName || "User"}</p>
                    <p className="text-sm text-white/50 truncate mt-0.5">{user.email}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        {(role === 'admin' || role === 'superadmin') ? 'Unlimited Access' : userPlan}
                      </span>
                      {role === 'superadmin' && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          {loading ? '...' : 'Super Admin'}
                        </span>
                      )}
                      {role === 'admin' && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {loading ? '...' : 'Admin'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-2 space-y-0.5">
                    <Link to="/settings" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium">
                      <Settings size={16} /><span>Settings</span>
                    </Link>
                    <Link to="/files" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium">
                      <Plus size={16} /><span>My Files</span>
                    </Link>
                    <Link to="/library" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium">
                      <Library size={16} /><span>Library</span>
                    </Link>
                    <Link to="/membership" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium">
                      <CreditCard size={16} /><span>Change Plan</span>
                    </Link>
                    {(role === 'admin' || role === 'superadmin') && (
                      <Link to="/super" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 w-full px-3 py-2.5 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 rounded-xl transition-colors text-sm font-medium mt-1 border border-emerald-500/0 hover:border-emerald-500/20">
                        <Shield size={16} /><span>Admin Dashboard</span>
                      </Link>
                    )}
                    {role === 'superadmin' && (
                      <Link to="/boss" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 w-full px-3 py-2.5 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 rounded-xl transition-colors text-sm font-medium mt-1 border border-amber-500/0 hover:border-amber-500/20">
                        <Crown size={16} /><span>Super Admin Panel</span>
                      </Link>
                    )}
                  </div>
                  <div className="p-2 border-t border-white/10">
                    <button onClick={() => { handleLogout(); setIsDropdownOpen(false); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors text-sm font-medium">
                      <LogOut size={16} /><span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <button onClick={() => navigate("/login")} type="button" className="text-[11px] uppercase tracking-[0.2em] font-medium text-zinc-400 hover:text-white transition-colors" style={{ fontFamily: "'Geist Mono', monospace" }}>Login</button>
              <button onClick={() => navigate("/Signup")} type="button" className="flex items-center gap-2 px-5 py-2 border border-white/20 rounded-[24px] text-[11px] uppercase tracking-[0.2em] font-medium text-zinc-300 hover:text-white hover:border-white/40 transition-all" style={{ fontFamily: "'Geist Mono', monospace" }}>
                TRY RELYCE AI ↗
              </button>
            </div>
          )}
        </div>

        <button className="lg:hidden text-zinc-400 hover:text-white transition" onClick={toggleMenu} aria-label="Menu">
          <Menu size={28} />
        </button>
      </div>

      {/* Mobile Sidebar & Backdrop */}
      <div
        ref={backdropRef}
        onClick={toggleMenu}
        className={`fixed inset-0 z-40 lg:hidden bg-black/60 backdrop-blur-sm pointer-events-auto`}
        style={{ display: 'block' }}
      />

      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen w-[280px] z-50 lg:hidden border-r bg-[#0a0d14] border-white/5 text-white flex flex-col shadow-2xl`}
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-black flex items-center justify-center shrink-0">
              <img src="/logo.svg" alt="Relyce AI" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-lg font-bold tracking-tight">Relyce AI</span>
          </div>
          <button onClick={toggleMenu} className="text-white/50 hover:text-white transition-colors" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2 overflow-y-auto flex-grow mt-2">
          {navItems.map(({ label, path }) => (
            <Link
              key={label}
              to={path}
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 font-semibold text-white/80 hover:text-white transition-colors text-[15px]"
            >
              {label}
            </Link>
          ))}
          {user && (
            <Link
              to="/settings"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 font-semibold text-white/80 hover:text-white transition-colors text-[15px]"
            >
              Settings
            </Link>
          )}
        </nav>

        <div className="mt-auto p-5 border-t border-white/5">
          {user ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4 overflow-hidden">
                {userAvatar ? (
                  <div className="relative shrink-0">
                    <img 
                      src={userAvatar} 
                      alt="Profile" 
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 hidden items-center justify-center font-bold text-emerald-300 absolute inset-0">
                      {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </div>
                ) : (
                  <div className="w-10 h-10 shrink-0 rounded-full bg-[#111621] flex items-center justify-center font-bold text-white border border-white/10">
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="min-w-0 pr-2">
                  <p className="text-[15px] font-bold text-white truncate max-w-[120px]">{user.displayName || user.email}</p>
                  <p className="text-[10px] tracking-widest font-bold text-[#00E599] truncate mt-0.5">
                    {(role === 'admin' || role === 'superadmin') ? 'UNLIMITED ACCESS' : `${userPlan.toUpperCase()} PLAN`}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                className="text-white/40 hover:text-white transition-colors shrink-0" 
                aria-label="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2 w-full">
              <button onClick={() => { setIsMenuOpen(false); navigate('/login'); }} className="flex-1 py-2.5 rounded-xl text-white bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium border border-white/10">
                Login
              </button>
              <button onClick={() => { setIsMenuOpen(false); navigate('/Signup'); }} className="flex-1 py-2.5 rounded-xl bg-[#00E599] text-black font-semibold hover:bg-emerald-400 transition-colors text-sm border border-transparent">
                Sign Up
              </button>
            </div>
          )}
        </div>
      </aside>

    </header>
  );
}
