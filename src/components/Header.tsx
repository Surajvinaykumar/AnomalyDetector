import React from 'react';
import { Shield } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Anomaly<span className="text-grey-400">Detector</span>
              </h1>
              <p className="text-xs text-gray-400">Using Cisco's Foundation Model</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-900/20 text-green-400 rounded-full border border-green-800">
              <Shield className="w-4 h-4" />
              
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
