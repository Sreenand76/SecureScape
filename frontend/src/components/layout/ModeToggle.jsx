import React, { useEffect } from 'react';
import { FiShield, FiAlertTriangle } from 'react-icons/fi';
import { useSecurityMode } from '../../contexts/SecurityModeContext';

const ModeToggle = () => {
  const { mode, toggleMode, isSecure } = useSecurityMode();
  
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Alt + M to toggle mode
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        toggleMode();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleMode]);
  
  const bgColor = isSecure 
    ? 'bg-green-600 hover:bg-green-700' 
    : 'bg-red-600 hover:bg-red-700';
  
  const borderColor = isSecure 
    ? 'border-green-500' 
    : 'border-red-500';
  
  const text = isSecure ? 'SECURE MODE' : 'INSECURE MODE';
  const Icon = isSecure ? FiShield : FiAlertTriangle;
  
  return (
    <button
      onClick={toggleMode}
      className={`${bgColor} text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition-all duration-200 border-2 ${borderColor} focus-ring focus:ring-offset-2 focus:ring-offset-white`}
      aria-label={`Current mode: ${mode}. Press to toggle security mode. Keyboard shortcut: Alt+M`}
      title={`Toggle security mode (Alt+M)`}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
      <span className="hidden sm:inline">{text}</span>
      <span className="sm:hidden">{isSecure ? 'SECURE' : 'INSECURE'}</span>
    </button>
  );
};

export default ModeToggle;
