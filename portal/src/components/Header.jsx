import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Info, HelpCircle, LogIn, LogOut, Landmark } from 'lucide-react';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'About', path: '/#about', icon: Info },
    { name: 'FAQ', path: '/faq', icon: HelpCircle }
  ];

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center w-full transition-all duration-300 ease-in-out ${scrolled ? 'pt-3' : 'pt-5'}`}
    >
      <div className={`
        flex items-center justify-between w-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${scrolled 
          ? 'max-w-4xl bg-card/70 backdrop-blur-xl border border-glass-border shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-full px-5 py-2.5'
          : 'max-w-6xl bg-transparent px-8 py-3'}
      `}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent shadow-lg shadow-emerald-glow overflow-hidden">
            <motion.div 
              className="absolute inset-0 bg-white/20"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.4 }}
            />
            <Landmark size={20} className="text-white relative z-10" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-secondary-foreground">
            Parivartan
          </span>
        </Link>
        
        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path === '/#about' && location.pathname === '/' && location.hash === '#about');
            const Icon = link.icon;
            
            return (
              <Link 
                key={link.name}
                to={link.path}
                className="relative group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <Icon size={16} className={`transition-colors duration-200 ${isActive ? 'text-primary' : 'group-hover:text-primary'}`} />
                <span>{link.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="nav-underline" 
                    className="absolute -bottom-2 left-0 right-0 h-[2px] bg-primary rounded-full shadow-[0_0_8px_rgba(22,163,74,0.6)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Auth / User Section */}
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <Link to="/login" className="relative group overflow-hidden flex items-center gap-2 px-6 py-2.5 rounded-full bg-foreground text-background font-medium text-sm transition-transform hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-lg">
              <span className="relative z-10 flex items-center gap-2">
                <LogIn size={16} /> Login
              </span>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/60 backdrop-blur-md border border-border/50 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-foreground">
                  {user?.username || user?.name || 'User'}
                </span>
              </div>
              <button 
                onClick={handleLogout} 
                className="p-2.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all active:scale-90"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;