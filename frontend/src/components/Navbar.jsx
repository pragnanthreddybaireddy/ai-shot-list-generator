import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MonitorPlay, BarChart3, Clock, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Generate', icon: Home },
  { to: '/history', label: 'History', icon: Clock },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-studio-purple to-studio-neon flex items-center justify-center shadow-lg shadow-studio-purple/20"
          >
            <MonitorPlay size={20} className="text-white" />
          </motion.div>
          <div>
            <span className="font-display text-2xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">DIGIQUEST</span>
            <span className="font-display text-2xl tracking-widest ml-2 text-studio-neon">STUDIO</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isActive = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all group"
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-white/10 rounded-xl border border-white/10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon size={16} className={`relative z-10 ${isActive ? 'text-studio-neon' : 'text-studio-muted group-hover:text-white transition-colors'}`} />
                  <span className={`relative z-10 ${isActive ? 'text-white' : 'text-studio-muted group-hover:text-white transition-colors'}`}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>

          {user && (
            <div className="relative pl-4 border-l border-white/10">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-studio-purple to-studio-neon flex items-center justify-center font-display text-lg font-bold text-white shadow-lg shadow-studio-purple/20 hover:scale-105 transition-transform"
              >
                {user.email.charAt(0).toUpperCase()}
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-[#12121A] border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden z-[100] backdrop-blur-xl">
                  <div className="px-4 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs text-studio-muted truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="md:hidden p-2.5 rounded-xl text-white hover:bg-white/10 transition-colors" onClick={() => setOpen(o => !o)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-white/10 bg-studio-dark/95 backdrop-blur-xl px-4 py-4 space-y-2"
        >
          {navLinks.map(({ to, label, icon: Icon }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${isActive ? 'bg-white/10 text-white border border-white/10' : 'text-studio-muted hover:text-white hover:bg-white/5'}`}
              >
                <Icon size={18} className={isActive ? 'text-studio-neon' : ''} />
                {label}
              </Link>
            );
          })}
          {user && (
            <div className="pt-2 mt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-white/5 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </motion.div>
      )}
    </nav>
  );
}
