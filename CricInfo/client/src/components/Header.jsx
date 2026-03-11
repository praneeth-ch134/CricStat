import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Ticket as Cricket, User, Menu, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useState } from 'react';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoggedIn = !!user;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-cricket-scoreboard text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-2">
            <Cricket size={28} className="text-cricket-pitch" />
            <span className="font-bold text-xl tracking-tight">Cricket Live</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`hover:text-cricket-pitch transition-colors ${
                location.pathname === '/' || location.pathname === '/matches' 
                  ? 'text-cricket-pitch' 
                  : ''
              }`}
            >
              Matches
            </Link>
            
            {isLoggedIn ? (
              <>
                <Link 
                  to="/admin/dashboard" 
                  className={`hover:text-cricket-pitch transition-colors ${
                    location.pathname === '/admin/dashboard' ? 'text-cricket-pitch' : ''
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="bg-gray-700 hover:bg-gray-600 py-1.5 px-3 rounded text-sm transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              !isAdminRoute && (
                <Link 
                  to="/admin/login" 
                  className="flex items-center space-x-1 bg-gray-700 hover:bg-gray-600 py-1.5 px-3 rounded text-sm transition-colors"
                >
                  <User size={16} />
                  <span>Admin Login</span>
                </Link>
              )
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-3 pb-4 animate-slide-in">
            <Link 
              to="/"
              className={`block py-2 hover:text-cricket-pitch transition-colors ${
                location.pathname === '/' || location.pathname === '/matches' 
                  ? 'text-cricket-pitch' 
                  : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Matches
            </Link>
            
            {isLoggedIn ? (
              <>
                <Link 
                  to="/admin/dashboard"
                  className={`block py-2 hover:text-cricket-pitch transition-colors ${
                    location.pathname === '/admin/dashboard' ? 'text-cricket-pitch' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 hover:text-cricket-pitch transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              !isAdminRoute && (
                <Link 
                  to="/admin/login"
                  className="block py-2 hover:text-cricket-pitch transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Login
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;