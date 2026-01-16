import React, { useState, useEffect } from 'react';
import { FiChevronUp, FiChevronDown, FiTerminal } from 'react-icons/fi';
import { useSecurityMode } from '../../contexts/SecurityModeContext';
import PayloadLibrary from './PayloadLibrary';
import RequestLogger from './RequestLogger';

const AttackerPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { mode } = useSecurityMode();
  
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Alt + A to toggle attacker panel
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  const borderColor = mode === 'secure' 
    ? 'border-green-500' 
    : 'border-red-500';
  
  const bgColor = 'bg-gray-900 text-gray-100';
  
  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-40
        ${bgColor} border-t-2 ${borderColor}
        transition-all duration-300 ease-in-out
        ${isOpen ? 'h-[400px]' : 'h-12'}
        shadow-lg
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full h-12 px-4 flex items-center justify-between
          hover:bg-gray-800 transition-colors
          focus-ring focus:ring-offset-2 focus:ring-offset-gray-900
        `}
        aria-label={`Attacker panel ${isOpen ? 'expanded' : 'collapsed'}. Press Alt+A to toggle.`}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <FiTerminal className="w-5 h-5" aria-hidden="true" />
          <span className="font-semibold">Attacker Simulation Panel</span>
          <span className="text-xs text-gray-400">(Alt+A)</span>
        </div>
        {isOpen ? (
          <FiChevronDown className="w-5 h-5" aria-hidden="true" />
        ) : (
          <FiChevronUp className="w-5 h-5" aria-hidden="true" />
        )}
      </button>
      
      {/* Content */}
      {isOpen && (
        <div className="h-[calc(400px-3rem)] overflow-y-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PayloadLibrary />
            <RequestLogger />
          </div>
        </div>
      )}
    </div>
  );
};

export default AttackerPanel;
