import React from 'react';
import { Link } from 'react-router-dom';
import { useSecurityMode } from '../../contexts/SecurityModeContext';
import ModeToggle from './ModeToggle';

const Header = () => {
  const { mode } = useSecurityMode();
  
  const borderColor = mode === 'secure' 
    ? 'border-green-500' 
    : 'border-red-500';
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 h-16 bg-white border-b-2 ${borderColor} shadow-sm z-50`}
      role="banner"
    >
      <div className="h-full px-4 lg:px-6 flex items-center justify-between max-w-full">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors focus-ring rounded"
          aria-label="SecureScape Home"
        >
          <span className="text-2xl">🛡️</span>
          <span>SecureScape</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
