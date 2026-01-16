import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiInfo } from 'react-icons/fi';

const InfoPanel = ({ 
  title, 
  children, 
  defaultOpen = false,
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-blue-100 transition-colors rounded-lg focus-ring"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <FiInfo className="w-5 h-5 text-blue-600" aria-hidden="true" />
          <span className="font-semibold text-blue-900">{title}</span>
        </div>
        {isOpen ? (
          <FiChevronUp className="w-5 h-5 text-blue-600" aria-hidden="true" />
        ) : (
          <FiChevronDown className="w-5 h-5 text-blue-600" aria-hidden="true" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-sm text-blue-800">
          {children}
        </div>
      )}
    </div>
  );
};

export default InfoPanel;
