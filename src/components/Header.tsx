import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={`border-b border-gray-300 dark:border-gray-700 sticky top-0 z-50 transition-all duration-300 ease-in-out ${
          isScrolled
            ? 'bg-black/80 backdrop-blur-sm'
            : 'bg-black'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 rounded-2xl p-1 backdrop-blur-sm bg-opacity-80">
                  <div className="bg-black rounded-xl px-3 py-2">
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                      Anomaly<span className="text-white">_Detector</span>
                    </h1>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-300">Welcome, {user.username}</span>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate('/login')}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => navigate('/register')}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Register
                    </button>
                  </div>
                )}
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>
  );
};

export default Header;